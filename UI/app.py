import streamlit as st
import pandas as pd
import numpy as np
import joblib
import tensorflow as tf
import matplotlib.pyplot as plt
# from src.utils import load_config

# --- 1. Page Configuration ---
st.set_page_config(page_title="WellSense AI", page_icon="🛢️", layout="wide")
st.title("🛢️ WellSense AI: Multi-Output Production Dashboard")

# config = load_config()

# --- 2. Load Models and Data ---
@st.cache_resource
def load_assets():
    rf_model = joblib.load("models/rf_model.joblib")
    lstm_model = tf.keras.models.load_model("models/production_model.keras")
    feature_scaler = joblib.load("models/feature_scaler.joblib")
    target_scaler = joblib.load("models/target_scaler.joblib")
    df = pd.read_csv("data/processed/clean_data.csv")
    return rf_model, lstm_model, feature_scaler, target_scaler, df

rf_model, lstm_model, feature_scaler, target_scaler, df = load_assets()

# UPDATED: Added H2O and WATER to exactly match the trained model
features = ['HOURS', 'WHP', 'WHT', 'WLP', 'H2O', 'WATER']
targets = ['W_GAS', 'S_GAS', 'LPG_VOL', 'LPG_MASS', 'COND_VOL', 'COND_MASS']

# features = config['pipeline']['safe_features']
# targets = config['pipeline']['target_col']

# --- Helper: Root Cause Analysis (RCA) Function ---
def perform_rca(rf_model, input_row, actual_w_gas):
    """
    Rapid Grid Search: Tweaks each feature individually around its reported value 
    to see which one makes the Random Forest output match the actual W_GAS.
    """
    best_feat = None
    best_val = None
    best_err = float('inf')
    
    for feat in features:
        orig_val = input_row[feat]
        test_vals = np.linspace(max(0, orig_val * 0.1), max(10, orig_val * 3.0), 200)
        
        batch_df = pd.DataFrame([input_row]*200, columns=features)
        batch_df[feat] = test_vals
        
        preds = rf_model.predict(batch_df)
        w_gas_preds = preds[:, 0]  # Index 0 is W_GAS
        
        errors = np.abs(w_gas_preds - actual_w_gas)
        min_err_idx = np.argmin(errors)
        
        if errors[min_err_idx] < best_err:
            best_err = errors[min_err_idx]
            best_feat = feat
            best_val = test_vals[min_err_idx]
            
    return best_feat, best_val

# --- 3. Build the Interface ---
tab1, tab2, tab3 = st.tabs([
    "🎛️ Virtual Flow Meter (Physics Simulator)", 
    "📈 7-Day Forecaster (LSTM)",
    "🚨 Daily Report Analyzer (Anomaly & RCA)"
])

# ==========================================
# TAB 1: RANDOM FOREST (PHYSICS SIMULATOR)
# ==========================================
with tab1:
    st.header("Virtual Flow Meter (Multi-Output)")
    st.markdown("Use the sliders to simulate current conditions. The AI will instantly predict all 6 production metrics.")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        hours = st.slider("HOURS (Uptime)", 0.0, 24.0, 24.0)
        whp = st.slider("WHP (Wellhead Pressure)", 0.0, float(df['WHP'].max()), float(df['WHP'].median()))
    with col2:
        wht = st.slider("WHT (Wellhead Temperature)", 0.0, float(df['WHT'].max()), float(df['WHT'].median()))
        wlp = st.slider("WLP (Wellline Pressure)", 0.0, float(df['WLP'].max()), float(df['WLP'].median()))
    with col3:
        h2o = st.slider("H2O", 0.0, float(df['H2O'].max()), float(df['H2O'].median()))
        water = st.slider("WATER", 0.0, float(df['WATER'].max()), float(df['WATER'].median()))
        
    if st.button("Predict Expected Production (Random Forest)", type="primary"):
        # UPDATED: Included h2o and water in the dataframe sent to the model
        input_df = pd.DataFrame([[hours, whp, wht, wlp, h2o, water]], columns=features)
        preds = rf_model.predict(input_df)[0] 
        
        st.success("### 🎯 Expected Production Metrics")
        
        mcol1, mcol2, mcol3 = st.columns(3)
        mcol1.metric("W_GAS", f"{preds[0]:,.2f}")
        mcol2.metric("S_GAS", f"{preds[1]:,.2f}")
        mcol3.metric("LPG_VOL", f"{preds[2]:,.2f}")
        
        mcol4, mcol5, mcol6 = st.columns(3)
        mcol4.metric("LPG_MASS", f"{preds[3]:,.2f}")
        mcol5.metric("COND_VOL", f"{preds[4]:,.2f}")
        mcol6.metric("COND_MASS", f"{preds[5]:,.2f}")

# ==========================================
# TAB 2: LSTM (TIME-SERIES FORECASTER)
# ==========================================
with tab2:
    st.header("Automated Forecaster (Deep Learning)")
    st.markdown("Predict tomorrow's multi-variable production based on the last 7 days of historical data.")
    
    well_list = df['WELL'].unique()
    selected_well = st.selectbox("Select a Well to Analyze", well_list)
    
    well_data = df[df['WELL'] == selected_well].sort_values("DATE").tail(7)
    
    if len(well_data) < 7:
        st.warning("Not enough continuous historical data for a 7-day forecast.")
    else:
        st.subheader(f"Historical Data (Last 7 Days) for {selected_well}")
        st.dataframe(well_data[['DATE'] + features + targets], hide_index=True)
        
        if st.button("Forecast Tomorrow's Production (LSTM)", type="primary"):
            seq_features = well_data[features].values
            seq_scaled = feature_scaler.transform(seq_features)
            seq_3d = np.array([seq_scaled]) 
            
            pred_scaled = lstm_model.predict(seq_3d, verbose=0)
            pred_real = target_scaler.inverse_transform(pred_scaled)[0] 
            
            st.success("### 📈 Predicted Production for Tomorrow")
            
            lcol1, lcol2, lcol3 = st.columns(3)
            lcol1.metric("Tomorrow's W_GAS", f"{pred_real[0]:,.2f}")
            lcol2.metric("Tomorrow's S_GAS", f"{pred_real[1]:,.2f}")
            lcol3.metric("Tomorrow's LPG_VOL", f"{pred_real[2]:,.2f}")
            
            lcol4, lcol5, lcol6 = st.columns(3)
            lcol4.metric("Tomorrow's LPG_MASS", f"{pred_real[3]:,.2f}")
            lcol5.metric("Tomorrow's COND_VOL", f"{pred_real[4]:,.2f}")
            lcol6.metric("Tomorrow's COND_MASS", f"{pred_real[5]:,.2f}")
            
            st.markdown("---")
            st.subheader("Visual Analysis")
            plot_target = st.selectbox("Select variable to visualize trend:", targets)
            target_idx = targets.index(plot_target)
            
            fig, ax = plt.subplots(figsize=(10, 4))
            ax.plot(range(1, 8), well_data[plot_target], marker='o', color='black', label="Historical (7 Days)")
            ax.plot([7, 8], [well_data[plot_target].iloc[-1], pred_real[target_idx]], marker='o', linestyle='--', color='green', linewidth=2, label="LSTM Forecast")
            
            ax.set_title(f"{plot_target} Forecast Trend - {selected_well}")
            ax.set_xlabel("Timeline (Days)")
            ax.set_ylabel(plot_target)
            ax.grid(True, alpha=0.3)
            ax.legend()
            st.pyplot(fig)

# ==========================================
# TAB 3: DAILY REPORT UPLOAD (ANOMALY & RCA)
# ==========================================
with tab3:
    st.header("🚨 Daily Report Analyzer")
    st.markdown("Upload the daily report from the field. The system will compare it against the LSTM forecast. If the error > 15%, the Random Forest will find the fake/broken variable.")
    
    uploaded_file = st.file_uploader("Upload Daily Report (CSV or Excel)", type=["csv", "xlsx"])
    
    if uploaded_file is not None:
        try:
            if uploaded_file.name.endswith('.csv'):
                daily_df = pd.read_csv(uploaded_file)
            else:
                daily_df = pd.read_excel(uploaded_file)
                
            st.subheader("Uploaded Data")
            st.dataframe(daily_df, hide_index=True)
            
            if st.button("Run AI Anomaly Check & RCA", type="primary"):
                st.markdown("---")
                for index, row in daily_df.iterrows():
                    well = row['WELL']
                    actual_w_gas = row['W_GAS']
                    
                    well_history = df[df['WELL'] == well].sort_values("DATE").tail(7)
                    
                    if len(well_history) < 7:
                        st.warning(f"⚠️ {well}: Not enough history to verify.")
                        continue
                        
                    seq_features = well_history[features].values
                    seq_scaled = feature_scaler.transform(seq_features)
                    seq_3d = np.array([seq_scaled]) 
                    pred_scaled = lstm_model.predict(seq_3d, verbose=0)
                    lstm_pred = target_scaler.inverse_transform(pred_scaled)[0]
                    predicted_w_gas = lstm_pred[0] # Index 0 is W_GAS
                    
                    diff_pct = abs(actual_w_gas - predicted_w_gas) / max(actual_w_gas, 1)
                    
                    if diff_pct > 0.15:
                        st.error(f"### 🚨 ANOMALY DETECTED: {well}")
                        st.write(f"**LSTM Expected W_GAS:** {predicted_w_gas:,.2f} m³ | **Field Reported:** {actual_w_gas:,.2f} m³ (Error: {diff_pct*100:.2f}%)")
                        
                        with st.spinner("Running Random Forest Root Cause Analysis..."):
                            input_row = row[features]
                            culprit, expected_val = perform_rca(rf_model, input_row, actual_w_gas)
                            
                            st.warning(f"""
                            **🔍 Root Cause Diagnosis:** The field reported `{culprit}` as **{input_row[culprit]:.2f}**. 
                            However, to produce {actual_w_gas:,.2f} m³ of gas, the Random Forest calculates that `{culprit}` must actually be **~{expected_val:.2f}**. 
                            *Action: Send a team to check the {culprit} sensor/valve for {well}!*
                            """)
                    else:
                        st.success(f"### ✅ {well}: Normal Operation")
                        st.write(f"**LSTM Expected:** {predicted_w_gas:,.2f} m³ | **Field Reported:** {actual_w_gas:,.2f} m³ (Error: {diff_pct*100:.2f}%)")
                        
        except Exception as e:
            st.error(f"Error reading file: {e}. Please make sure columns match: WELL, {', '.join(features)}, W_GAS, etc.")