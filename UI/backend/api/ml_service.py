# # ml_service.py
# import os
# import joblib
# import tensorflow as tf
# from django.conf import settings

# class MLService:
#     _instance = None

#     def __new__(cls):
#         if cls._instance is None:
#             cls._instance = super().__new__(cls)
#             cls._instance._loaded = False
#         return cls._instance

#     def __init__(self):
#         if self._loaded:
#             return
            
#         # models_dir = os.path.join(settings.BASE_DIR, "models")
#         models_dir = os.path.join("/home/Bluck/rebo/oil-well-production-prediction/AI/models")

#         # Only load the AI artifacts, NOT the CSV dataset
#         self.rf_model = joblib.load(os.path.join(models_dir, "rf_model.joblib"))
#         self.lstm_model = tf.keras.models.load_model(
#             os.path.join(models_dir, "production_model.keras")
#         )
#         self.feature_scaler = joblib.load(
#             os.path.join(models_dir, "feature_scaler.joblib")
#         )
#         self.target_scaler = joblib.load(
#             os.path.join(models_dir, "target_scaler.joblib")
#         )
#         self._loaded = True

import os
import logging
import joblib
import boto3
import tempfile
import tensorflow as tf
from django.conf import settings

logger = logging.getLogger(__name__)

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
            
        # Check the environment (defaults to 'development' if not set)
        env = os.environ.get("ENVIRONMENT", "development").lower()
        
        if env == "production":
            self._load_from_s3()
        else:
            self._load_locally()
            
        self._loaded = True

    def _load_locally(self):
        """Loads models from the local filesystem during development."""
        logger.info("DEVELOPMENT: Loading models from local storage...")
        
        # PRO TIP: Using settings.BASE_DIR instead of a hardcoded "/home/Bluck/..." path 
        # means another developer can clone your repo and run it without changing the code!
        models_dir = os.path.join("/home/Bluck/rebo/oil-well-production-prediction/AI/models")#settings.BASE_DIR, "AI", "models"
        
        self.rf_model = joblib.load(os.path.join(models_dir, "rf_model.joblib"))
        self.lstm_model = tf.keras.models.load_model(os.path.join(models_dir, "production_model.keras"))
        self.feature_scaler = joblib.load(os.path.join(models_dir, "feature_scaler.joblib"))
        self.target_scaler = joblib.load(os.path.join(models_dir, "target_scaler.joblib"))
        
        logger.info("DEVELOPMENT: All models successfully loaded into memory.")

    def _load_from_s3(self):
        """Downloads models from S3 to a temp folder and loads them into memory in production."""
        logger.info("PRODUCTION: Downloading models from S3...")
        
        bucket_name = os.environ.get("S3_BUCKET_NAME")
        if not bucket_name:
            raise ValueError("S3_BUCKET_NAME environment variable is missing in production!")

        s3_client = boto3.client('s3')
        
        # This creates a secure, temporary folder that self-destructs when the 'with' block ends
        with tempfile.TemporaryDirectory() as temp_dir:
            # Map the local filenames we want to their S3 keys
            files_to_download = {
                "rf_model.joblib": "models/rf_model.joblib",
                "production_model.keras": "models/production_model.keras",
                "feature_scaler.joblib": "models/feature_scaler.joblib",
                "target_scaler.joblib": "models/target_scaler.joblib",
            }
            
            local_paths = {}
            
            # 1. Download all files to the temporary directory
            for filename, s3_key in files_to_download.items():
                local_path = os.path.join(temp_dir, filename)
                logger.info(f"Downloading {s3_key} to temporary storage...")
                
                try:
                    s3_client.download_file(bucket_name, s3_key, local_path)
                    local_paths[filename] = local_path
                except Exception as e:
                    logger.error(f"Failed to download {s3_key} from S3: {e}")
                    raise e
            
            # 2. Load them into the Singleton's memory
            self.rf_model = joblib.load(local_paths["rf_model.joblib"])
            self.lstm_model = tf.keras.models.load_model(local_paths["production_model.keras"])
            self.feature_scaler = joblib.load(local_paths["feature_scaler.joblib"])
            self.target_scaler = joblib.load(local_paths["target_scaler.joblib"])
            
        logger.info("PRODUCTION: All models loaded into memory. Temporary files deleted.")