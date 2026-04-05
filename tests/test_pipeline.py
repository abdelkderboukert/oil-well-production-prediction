"""
Unit Tests - Test Suite

Comprehensive test suite covering data ingestion, preprocessing, model building,
and training functionality.
"""

import pytest
import pandas as pd
import numpy as np
import tempfile
import os
from src.ingestion import load_raw_data
from src.preprocessing import clean_data
from src.model import build_model, save_model
from src.train import train_and_evaluate


class TestDataIngestion:
    """Test cases for data ingestion module."""

    @pytest.fixture
    def sample_csv(self):
        """Create a temporary sample CSV file for testing."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write("DATE,WELL,HOURS,WHP,WHT,WLP,W_GAS\n")
            f.write("2023-01-01,TFT-301,100,150.5,85.2,50.1,1500.0\n")
            f.write("2023-01-02,TFT-301,105,155.0,86.1,51.0,1550.0\n")
            f.write("2023-01-03,TFT-302,110,160.0,87.0,52.0,1600.0\n")
            filepath = f.name
        yield filepath
        os.unlink(filepath)

    def test_load_raw_data(self, sample_csv):
        """Test loading raw data from CSV."""
        df = load_raw_data(sample_csv)
        assert isinstance(df, pd.DataFrame)
        assert not df.empty
        assert df.shape[0] == 3


class TestDataPreprocessing:
    """Test cases for data preprocessing module."""

    @pytest.fixture
    def sample_dataframe(self):
        """Create sample dataframe for testing."""
        data = {
            'DATE': pd.to_datetime(['2023-01-01', '2023-01-02', '2023-01-03']),
            'WELL': ['TFT-301', 'TFT-301', 'TFT-302'],
            'HOURS': [100, 105, 110],
            'WHP': [150.5, 155.0, 160.0],
            'WHT': [85.2, 86.1, 87.0],
            'WLP': [50.1, 51.0, 52.0],
            'W_GAS': [1500.0, 1550.0, 1600.0],
            'prodindex': [1, 2, 3]
        }
        return pd.DataFrame(data)

    def test_clean_data_removes_columns(self, sample_dataframe):
        """Test that unnecessary columns are removed."""
        cleaned = clean_data(sample_dataframe)
        assert 'prodindex' not in cleaned.columns

    def test_clean_data_handles_negatives(self):
        """Test that negative values are replaced with NaN."""
        data = {
            'DATE': pd.to_datetime(['2023-01-01']),
            'WELL': ['TFT-301'],
            'HOURS': [-100],  # Invalid negative
            'WHP': [150.5],
            'WHT': [85.2],
            'WLP': [50.1],
            'W_GAS': [1500.0]
        }
        df = pd.DataFrame(data)
        cleaned = clean_data(df)
        assert pd.isna(cleaned.loc[0, 'HOURS'])


class TestModelBuild:
    """Test cases for model building."""

    def test_build_model_returns_estimator(self):
        """Test that build_model returns a valid sklearn estimator."""
        from sklearn.ensemble import RandomForestRegressor
        model = build_model()
        assert isinstance(model, RandomForestRegressor)

    def test_build_model_parameters(self):
        """Test that model is built with correct parameters."""
        model = build_model(n_estimators=100, random_state=42)
        assert model.n_estimators == 100
        assert model.random_state == 42

    def test_save_model(self):
        """Test model saving functionality."""
        with tempfile.TemporaryDirectory() as tmpdir:
            model = build_model()
            filepath = os.path.join(tmpdir, 'test_model.joblib')
            save_model(model, filepath)
            assert os.path.exists(filepath)


class TestTraining:
    """Test cases for model training."""

    @pytest.fixture
    def training_data(self):
        """Create sample training data."""
        n_samples = 100
        data = {
            'HOURS': np.random.randint(50, 150, n_samples),
            'WHP': np.random.uniform(140, 170, n_samples),
            'WHT': np.random.uniform(80, 90, n_samples),
            'WLP': np.random.uniform(45, 55, n_samples),
            'W_GAS': np.random.uniform(1000, 2000, n_samples),
            'WELL': np.random.choice(['TFT-301', 'TFT-302'], n_samples)
        }
        return pd.DataFrame(data)

    def test_train_and_evaluate(self, training_data):
        """Test training and evaluation workflow."""
        model = build_model(n_estimators=10, random_state=42)
        features = ['HOURS', 'WHP', 'WHT', 'WLP']
        target = 'W_GAS'

        trained_model, y_test, predictions, metrics = train_and_evaluate(
            model=model,
            df=training_data,
            features=features,
            target=target,
            test_size=0.2,
            random_state=42
        )

        assert trained_model is not None
        assert len(predictions) > 0
        assert isinstance(metrics, dict)
        assert 'R2_Score' in metrics
        assert 'Mean_Absolute_Error_MAE' in metrics


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
