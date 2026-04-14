from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import WellSerializer, WellProductionSerializer
import numpy as np
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction

import csv
from django.http import HttpResponse

from .ml_service import MLService

class WellViewSet(viewsets.ModelViewSet):
    queryset = Well.objects.all().order_by('name')
    serializer_class = WellSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'uwi']

class WellProductionViewSet(viewsets.ModelViewSet):
    queryset = WellProduction.objects.all().order_by('-date')
    serializer_class = WellProductionSerializer
    
    # Adding filtering so pros can filter by date or specific well
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['well', 'date', 'tag']
    ordering_fields = ['date', 'whp']


ml = MLService()

FEATURES = ["HOURS", "WHP", "WHT", "WLP", "H2O", "WATER"]
TARGETS = ["W_GAS", "S_GAS", "LPG_VOL", "LPG_MASS", "COND_VOL", "COND_MASS"]

# Helper function to get DB data formatted for ML
def get_well_history_df(well_name, days=7):
    """Fetches the last N days of production for a well from DB and formats it for ML."""
    qs = WellProduction.objects.filter(well__name=well_name).order_by('-date')[:days]
    if not qs.exists():
        return pd.DataFrame()
    
    # Convert database QuerySet to Pandas DataFrame
    df = pd.DataFrame(list(qs.values()))
    
    # Capitalize columns so 'whp' from DB matches 'WHP' for ML
    df.columns = [c.upper() for c in df.columns]
    
    # The DB returned them newest-first. We must sort chronologically for LSTM.
    df = df.sort_values("DATE")
    return df


class WellListView(APIView):
    """GET /api/wells/ — returns list of wells and feature ranges for sliders."""

    def get(self, request):
        wells = Well.objects.values_list('name', flat=True)
        
        # Pull all production data to calculate slider ranges
        qs = WellProduction.objects.all().values(*[f.lower() for f in FEATURES])
        if qs.exists():
            df = pd.DataFrame(list(qs))
            df.columns = [c.upper() for c in df.columns]
            
            ranges = {}
            for feat in FEATURES:
                ranges[feat] = {
                    "min": float(df[feat].min()),
                    "max": float(df[feat].max()),
                    "median": float(df[feat].median()),
                }
        else:
            ranges = {feat: {"min": 0, "max": 100, "median": 50} for feat in FEATURES}

        return Response({"wells": list(wells), "feature_ranges": ranges})


class PredictView(APIView):
    """POST /api/predict/ — Random Forest multi-output prediction."""

    def post(self, request):
        data = request.data
        try:
            row = [float(data[f]) for f in FEATURES]
        except (KeyError, TypeError, ValueError) as e:
            return Response(
                {"error": f"Missing or invalid feature: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        input_df = pd.DataFrame([row], columns=FEATURES)
        preds = ml.rf_model.predict(input_df)[0]

        return Response({
            "predictions": {
                target: round(float(val), 4)
                for target, val in zip(TARGETS, preds)
            }
        })


class ForecastView(APIView):
    """POST /api/forecast/ — LSTM 7-day forecast for a given well."""

    def post(self, request):
        well_name = request.data.get("well")
        if not well_name:
            return Response({"error": "well is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Get history directly from PostgreSQL/SQLite Database
        well_data = get_well_history_df(well_name, days=7)

        if len(well_data) < 7:
            return Response(
                {"error": "Not enough historical data in DB (need 7 days)"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # 2. Prepare data and run model
        seq_features = well_data[FEATURES].values
        seq_scaled = ml.feature_scaler.transform(seq_features)
        seq_3d = np.array([seq_scaled])

        pred_scaled = ml.lstm_model.predict(seq_3d, verbose=0)
        pred_real = ml.target_scaler.inverse_transform(pred_scaled)[0]

        history = []
        for _, row in well_data.iterrows():
            entry = {"date": str(row["DATE"])}
            for t in TARGETS:
                entry[t] = round(float(row[t]), 4)
            history.append(entry)

        return Response({
            "well": well_name,
            "forecast": {
                target: round(float(val), 4) for target, val in zip(TARGETS, pred_real)
            },
            "history": history,
        })


class AnalyzeView(APIView):
    """POST /api/analyze/ — Upload daily report CSV/Excel, get anomaly + RCA results."""

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if file.name.endswith(".csv"):
                daily_df = pd.read_csv(file)
            else:
                daily_df = pd.read_excel(file)
        except Exception as e:
            return Response(
                {"error": f"Could not parse file: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = []

        for _, row in daily_df.iterrows():
            well = row.get("WELL")
            actual_w_gas = row.get("W_GAS")

            if well is None or actual_w_gas is None:
                continue

            # Fetch historical comparison data directly from Database
            well_history = get_well_history_df(well, days=7)

            if len(well_history) < 7:
                results.append({"well": well, "status": "insufficient_data", "message": "Need 7 days of history in DB"})
                continue

            seq_features = well_history[FEATURES].values
            seq_scaled = ml.feature_scaler.transform(seq_features)
            seq_3d = np.array([seq_scaled])
            
            pred_scaled = ml.lstm_model.predict(seq_3d, verbose=0)
            lstm_pred = ml.target_scaler.inverse_transform(pred_scaled)[0]
            predicted_w_gas = float(lstm_pred[0])
            actual_w_gas = float(actual_w_gas)

            diff_pct = abs(actual_w_gas - predicted_w_gas) / max(actual_w_gas, 1)

            if diff_pct > 0.15:
                input_row = {f: float(row[f]) for f in FEATURES}
                culprit, expected_val = self._perform_rca(input_row, actual_w_gas)
                results.append({
                    "well": well,
                    "status": "anomaly",
                    "predicted_w_gas": round(predicted_w_gas, 2),
                    "reported_w_gas": round(actual_w_gas, 2),
                    "error_pct": round(diff_pct * 100, 2),
                    "rca": {
                        "culprit_feature": culprit,
                        "reported_value": round(input_row[culprit], 2),
                        "expected_value": round(float(expected_val), 2),
                    },
                })
            else:
                results.append({
                    "well": well,
                    "status": "normal",
                    "predicted_w_gas": round(predicted_w_gas, 2),
                    "reported_w_gas": round(actual_w_gas, 2),
                    "error_pct": round(diff_pct * 100, 2),
                })

        return Response({"results": results})

    def _perform_rca(self, input_row: dict, actual_w_gas: float):
        best_feat = None
        best_val = None
        best_err = float("inf")

        for feat in FEATURES:
            orig_val = input_row[feat]
            test_vals = np.linspace(max(0, orig_val * 0.1), max(10, orig_val * 3.0), 200)

            batch_df = pd.DataFrame([input_row] * 200, columns=FEATURES)
            batch_df[feat] = test_vals

            preds = ml.rf_model.predict(batch_df)
            w_gas_preds = preds[:, 0]

            errors = np.abs(w_gas_preds - actual_w_gas)
            min_err_idx = int(np.argmin(errors))

            if errors[min_err_idx] < best_err:
                best_err = errors[min_err_idx]
                best_feat = feat
                best_val = test_vals[min_err_idx]

        return best_feat, best_val
    

class ExportDataView(APIView):
    """GET /api/export/ — Download all database production data as a CSV file."""

    def get(self, request):
        # 1. Check if the user wants a specific well (optional: ?well=TFT-302)
        well_name = request.query_params.get("well")
        
        if well_name:
            queryset = WellProduction.objects.filter(well__name=well_name).select_related('well').order_by('-date')
            filename = f"{well_name}_production_data.csv"
        else:
            queryset = WellProduction.objects.all().select_related('well').order_by('well__name', '-date')
            filename = "all_wells_production_data.csv"

        # 2. Create the HttpResponse object with the CSV headers
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        # 3. Initialize the CSV writer
        writer = csv.writer(response)

        # 4. Write the Header Row (Matching your ML pipeline exact columns)
        writer.writerow([
<<<<<<< HEAD
            'DATE', 'WELL', 'HOURS', 'WHP', 'WHT', 'WLP', 
            'H2O', 'WATER', 'prodindex', 'W_GAS', 'S_GAS', 'LPG_MASS', 'LGP_VOL', 'COND_VOL', 'COND_MASS', 'C2M', 'C3', 'C4', 'C5P', 'TAG'
=======
            'DATE', 'WELL', 'HOURS_ON_STREAM', 'WHP', 'WHT', 'WLP', 
            'WATER_CUT', 'GAS_FLOW_RATE', 'OIL_FLOW_RATE', 'C3', 'C4', 'TAG'
>>>>>>> 1b63492 (change the structure of the project than change some detzi in th workflow to adapte the update)
        ])

        for row in queryset:
            writer.writerow([
                row.date,
                row.well.name,
<<<<<<< HEAD
                row.hours,     
                row.whp,
                row.wht,
                row.wlp,
                row.h2o,       
                row.water, 
                row.prodindex,
                row.w_gas,   
                row.s_gas, 
                row.lpg_mass, 
                row.lpg_vol,   
                row.cond_vol,  
                row.cond_mass,
                row.c2m,
                row.c3,
                row.c4,
                row.c5p,
=======
                row.hours_on_stream,
                row.whp,
                row.wht,
                row.wlp,
                row.water_cut,
                row.gas_flow_rate,
                row.oil_flow_rate,
                row.c3,
                row.c4,
>>>>>>> 1b63492 (change the structure of the project than change some detzi in th workflow to adapte the update)
                row.tag
            ])

        return response

class ImportDataView(APIView):
    """POST /api/import/ — Upload CSV/Excel to populate database."""
    
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Parse the uploaded file
        try:
            if file.name.endswith(".csv"):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
        except Exception as e:
            return Response({"error": f"Could not parse file: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure minimal required columns exist
        if 'WELL' not in df.columns or 'DATE' not in df.columns:
            return Response({"error": "File must contain 'WELL' and 'DATE' columns."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Check for missing wells in the database
        # Dropna to avoid breaking if there's a blank row at the end of the CSV
        file_wells = df['WELL'].dropna().unique()
        existing_wells = dict(Well.objects.filter(name__in=file_wells).values_list('name', 'id'))
        
        missing_wells = [w for w in file_wells if w not in existing_wells and str(w).strip() != '0']
        
        if missing_wells:
            return Response({
                "error": "Missing Wells Found",
                "message": "Please create these wells in the system before importing their production data.",
                "missing_wells": missing_wells
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Clean and prepare data
        df['DATE'] = pd.to_datetime(df['DATE']).dt.date
        
        # Replace NaN values safely. We use pandas built-in fillna for numbers.
        df.fillna(0, inplace=True)

        # 4. Create Production Records
        production_records = []
        
        for _, row in df.iterrows():
            well_name = row.get('WELL')
            date = row.get('DATE')
            
            if not well_name or well_name == 0 or not date or date == 0:
                continue
                
            # Safely get variables matching your EXACT models.py
            production_records.append(WellProduction(
                well_id=existing_wells[well_name],
                date=date,
                hours=row.get('HOURS', 24.0),
                whp=row.get('WHP', 0),
                wht=row.get('WHT', 0),
                wlp=row.get('WLP', 0),
                water_cut=row.get('H2O', 0),
                water=row.get('WATER', 0),
                w_gas=row.get('W_GAS', 0),
                s_gas=row.get('S_GAS', 0),
                lpg_vol=row.get('LPG_VOL', 0),   # FIXED TYPO
                lpg_mass=row.get('LPG_MASS', 0), # FIXED TYPO
                cond_vol=row.get('COND_VOL', 0),
                cond_mass=row.get('COND_MASS', 0),
                # Using None for fields that are null=True in your models.py
                c2m=row.get('C2M') if row.get('C2M') != 0 else None,
                c3=row.get('C3') if row.get('C3') != 0 else None,
                c4=row.get('C4') if row.get('C4') != 0 else None,
                c5p=row.get('C5P') if row.get('C5P') != 0 else None,
                prodindex=row.get('prodindex') if row.get('prodindex') != 0 else None,
                tag=False
            ))

        # 5. Bulk Insert into Database
        try:
            with transaction.atomic():
                WellProduction.objects.bulk_create(
                    production_records, 
                    batch_size=5000, 
                    ignore_conflicts=True
                )
        except Exception as e:
            return Response({"error": f"Database insertion failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Condition 2: Success!
        return Response({
            "message": "Data imported successfully!",
            "wells_updated": len(file_wells),
            "rows_processed": len(production_records)
        }, status=status.HTTP_201_CREATED)