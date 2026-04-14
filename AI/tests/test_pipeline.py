"""
Unit Tests - Test Suite (Multi-Output / Dual-Architecture)

Comprehensive test suite covering data ingestion, preprocessing (resampling), 
3D sequence generation, model building, and training for both LSTM and RF.
"""

import pytest
import pandas as pd
import numpy as np
import tempfile
import os
from sklearn.ensemble import RandomForestRegressor
from tensorflow.keras.models import Sequential

# Import your pipeline functions
from src.ingestion import load_raw_data
from src.preprocessing import clean_data
from src.model import build_lstm_model, build_rf_model, save_lstm_model, save_rf_model
from src.train import create_sequences, train_and_evaluate_lstm, train_and_evaluate_rf

# --- CONSTANTS FOR TESTING ---
FEATURES = ['HOURS', 'WHP', 'WHT', 'WLP']
TARGETS = ['W_GAS', 'S_GAS', 'LPG_VOL', 'LPG_MASS', 'COND_VOL', 'COND_MASS']

class TestDataIngestion:
    """Test cases for data ingestion module."""

    @pytest.fixture
    def sample_csv(self):
        """Create a temporary sample CSV file for testing."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write("DATE,WELL,HOURS,WHP,WHT,WLP,W_GAS,S_GAS,LPG_VOL,LPG_MASS,COND_VOL,COND_MASS\n")
            f.write("2023-01-01,TFT-301,24,150.5,85.2,50.1,1500,100,50,25,10,5\n")
            f.write("2023-01-02,TFT-301,24,155.0,86.1,51.0,1550,110,55,27,11,6\n")
            filepath = f.name
        yield filepath
        os.unlink(filepath)

    def test_load_raw_data(self, sample_csv):
        df = load_raw_data(sample_csv)
        assert isinstance(df, pd.DataFrame)
        assert not df.empty
        assert df.shape[0] == 2
        assert 'COND_MASS' in df.columns


class TestDataPreprocessing:
    """Test cases for data preprocessing module."""

    def test_clean_data_removes_columns_and_negatives(self):
        """Test column removal and negative value handling."""
        data = {
            'DATE': pd.to_datetime(['2023-01-01']),
            'WELL': ['TFT-301'],
            'HOURS': [-24],  # Invalid negative
            'WHP': [150.5],
            'WHT': [85.2],
            'prodindex': [1] # Irrelevant column
        }
        df = pd.DataFrame(data)
        cleaned = clean_data(df)
        
        assert 'prodindex' not in cleaned.columns
        assert pd.isna(cleaned.loc[0, 'HOURS']) or cleaned.loc[0, 'HOURS'] == 0

    def test_clean_data_handles_date_gaps_and_imputation(self):
        """Test that date gaps are resampled and missing values are forward-filled."""
        # Missing Jan 2nd
        data = {
            'DATE': ['2023-01-01', '2023-01-03'], 
            'WELL': ['TFT-301', 'TFT-301'],
            'WHP': [150.0, 140.0],
            'W_GAS': [1000.0, 900.0]
        }
        df = pd.DataFrame(data)
        cleaned = clean_data(df)
        
        # Check that Jan 2nd was created (Total 3 days)
        assert len(cleaned) == 3
        dates = cleaned['DATE'].dt.strftime('%Y-%m-%d').tolist()
        assert '2023-01-02' in dates
        
        # Check that Jan 2nd values were forward-filled from Jan 1st
        jan_2_data = cleaned[cleaned['DATE'] == '2023-01-02'].iloc[0]
        assert jan_2_data['WHP'] == 150.0


class TestModelBuild:
    """Test cases for building and saving models."""

    def test_build_lstm_model(self):
        model = build_lstm_model(time_steps=7, n_features=4, n_outputs=6)
        assert isinstance(model, Sequential)
        # Check output shape matches 6 targets
        assert model.output_shape == (None, 6) 

    def test_build_rf_model(self):
        model = build_rf_model(n_estimators=10)
        assert isinstance(model, RandomForestRegressor)
        assert model.n_estimators == 10

    def test_save_models(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            lstm_model = build_lstm_model(7, 4, 6)
            rf_model = build_rf_model(10)
            
            lstm_path = os.path.join(tmpdir, 'test_lstm.keras')
            rf_path = os.path.join(tmpdir, 'test_rf.joblib')
            
            save_lstm_model(lstm_model, lstm_path)
            save_rf_model(rf_model, rf_path)
            
            assert os.path.exists(lstm_path)
            assert os.path.exists(rf_path)


class TestTraining:
    """Test cases for sequence generation and model training workflows."""

    @pytest.fixture
    def multi_target_data(self):
        """Create sample dataset with multiple targets and enough rows for LSTM sequencing."""
        n_samples = 50 # Enough days to create sequences and do validation split
        
        # Generate sequential dates for one well
        dates = pd.date_range(start='2023-01-01', periods=n_samples)
        
        data = {
            'DATE': dates,
            'WELL': ['TFT-301'] * n_samples,
            'HOURS': np.random.uniform(20, 24, n_samples),
            'WHP': np.random.uniform(140, 170, n_samples),
            'WHT': np.random.uniform(80, 90, n_samples),
            'WLP': np.random.uniform(45, 55, n_samples),
            'W_GAS': np.random.uniform(1000, 2000, n_samples),
            'S_GAS': np.random.uniform(100, 200, n_samples),
            'LPG_VOL': np.random.uniform(50, 100, n_samples),
            'LPG_MASS': np.random.uniform(25, 50, n_samples),
            'COND_VOL': np.random.uniform(10, 20, n_samples),
            'COND_MASS': np.random.uniform(5, 10, n_samples)
        }
        return pd.DataFrame(data)

    def test_create_sequences(self, multi_target_data):
        time_steps = 7
        X, y = create_sequences(multi_target_data, FEATURES, TARGETS, time_steps)
        
        # Total samples = 50. Sequences = 50 - 7 = 43.
        assert X.shape == (43, 7, 4)  # (samples, time_steps, features)
        assert y.shape == (43, 6)     # (samples, targets)

    def test_train_and_evaluate_rf(self, multi_target_data):
        """Test Multi-Output Random Forest training."""
        model, y_test, preds, metrics = train_and_evaluate_rf(
            df=multi_target_data,
            features=FEATURES,
            targets=TARGETS,
            test_size=0.2,
            random_state=42
        )
        assert isinstance(model, RandomForestRegressor)
        assert preds.shape[1] == 6 # Must predict 6 outputs
        assert 'R2_Score' in metrics

    def test_train_and_evaluate_lstm(self, multi_target_data):
        """Test Multi-Output LSTM training."""
        model, y_test, preds, metrics = train_and_evaluate_lstm(
            df=multi_target_data,
            features=FEATURES,
            targets=TARGETS,
            time_steps=7,
            test_size=0.2,
            random_state=42
        )
        assert isinstance(model, Sequential)
        assert preds.shape[1] == 6 # Must predict 6 outputs
        assert 'RMSE' in metrics

if __name__ == '__main__':
    pytest.main([__file__, '-v'])