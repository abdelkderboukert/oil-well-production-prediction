from django.test import TestCase

# Create your tests here.
import io
import pandas as pd
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Well, WellProduction

class OilGasEnterpriseTests(APITestCase):
    
    def setUp(self):
        """
        This runs BEFORE every single test. 
        It sets up a fake database with exactly 1 Well and 1 Production row.
        """
        self.well = Well.objects.create(
            name= "TFT-302", 
            uwi= "100/01-01-010-01W1/00", 
            well_type= "OIL", 
            latitude= 51.0447, 
            longitude= -114.0719, 
            spud_date= "2026-04-01", 
            total_depth= 2500.50
        )
        
        self.production = WellProduction.objects.create(
            well=self.well,
            date="2026-04-01",
            hours=23.50,        
            whp=850.25,
            wht=95.00,
            wlp=0,
            w_gas=120.500,       
            cond_vol=45.200,    
            h2o=1.50,         
            c3=0.0450,
            c4=0.0210,
            tag=True
        )

    # ==========================================
    # 1. DATABASE MODEL TESTS
    # ==========================================
    def test_model_creation(self):
        """Verify the database properly saves and formats models."""
        self.assertEqual(Well.objects.count(), 1)
        self.assertEqual(WellProduction.objects.count(), 1)
        # Tests the __str__ method on your Well model
        self.assertEqual(str(self.well), "TFT-302 [100/01-01-010-01W1/00]")

    # ==========================================
    # 2. CRUD API TESTS (ModelViewSet)
    # ==========================================
    def test_get_well_list(self):
        """Test that the Next.js frontend can fetch wells."""
        url = reverse('well-list')  # Generated automatically by your router!
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Because DRF uses pagination by default, the data is inside 'results'
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "TFT-302")

    def test_create_new_well(self):
        """Test adding a new well via POST request."""
        url = reverse('well-list')
        payload = {
            "name": "TFT-303",
            "uwi": "UWI-99999",
            "well_type": "GAS",
            "total_depth": 2000.00
        }
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Well.objects.count(), 2) # Should now be 2 wells in DB

    # ==========================================
    # 3. DATA PIPELINE TESTS (Import/Export)
    # ==========================================
    def test_export_csv_view(self):
        """Test that downloading the CSV returns the right data formatting."""
        url = reverse('export-csv')
        response = self.client.get(url)
        
        # 1. Check it succeeds and returns a CSV file
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        
        # 2. Check that the data we put in setUp() actually made it into the CSV
        content = response.content.decode('utf-8')
        self.assertIn('TFT-302', content)
        self.assertIn('2026-04-01', content)

    def test_import_csv_success(self):
        """Test bulk uploading a CSV of production data for an existing well."""
        url = reverse('import-csv')
        
        # Create a fake CSV file in memory
        csv_content = b"WELL,DATE,HOURS,WHP,WHT\nTFT-302,2023-01-02,24,160.5,86.0\n"
        csv_file = SimpleUploadedFile("test_data.csv", csv_content, content_type="text/csv")
        
        response = self.client.post(url, {'file': csv_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Should now be 2 production rows (1 from setUp, 1 from CSV)
        self.assertEqual(WellProduction.objects.count(), 2)

    def test_import_csv_missing_well_rejection(self):
        """
        Test that the API correctly REJECTS a CSV if it contains a well
        that has not been created in the database yet.
        """
        url = reverse('import-csv')
        
        # Notice "UNKNOWN-WELL" does not exist in the DB!
        csv_content = b"WELL,DATE,HOURS\nUNKNOWN-WELL,2023-01-02,24\n"
        csv_file = SimpleUploadedFile("bad_data.csv", csv_content, content_type="text/csv")
        
        response = self.client.post(url, {'file': csv_file}, format='multipart')
        
        # Should fail with a 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Should tell us exactly which well is missing
        self.assertIn("UNKNOWN-WELL", response.data['missing_wells'])
        self.assertEqual(response.data['error'], "Missing Wells Found")
