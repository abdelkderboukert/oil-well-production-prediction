# ml_service.py
import os
import joblib
import tensorflow as tf
from django.conf import settings

class MLService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    def __init__(self):
        if self._loaded:
            return
            
        # models_dir = os.path.join(settings.BASE_DIR, "models")
        models_dir = os.path.join("/home/Bluck/rebo/oil-well-production-prediction/AI/models")

        # Only load the AI artifacts, NOT the CSV dataset
        self.rf_model = joblib.load(os.path.join(models_dir, "rf_model.joblib"))
        self.lstm_model = tf.keras.models.load_model(
            os.path.join(models_dir, "production_model.keras")
        )
        self.feature_scaler = joblib.load(
            os.path.join(models_dir, "feature_scaler.joblib")
        )
        self.target_scaler = joblib.load(
            os.path.join(models_dir, "target_scaler.joblib")
        )
        self._loaded = True