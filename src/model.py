"""
Model Management Module

Handles creation, initialization, and persistence of machine learning models.
Utilizes scikit-learn's Random Forest regressor for production prediction tasks.
"""

import logging
import os

import joblib
from sklearn.ensemble import RandomForestRegressor


def build_model(n_estimators=50, random_state=42):
    """
    Initialize and configure a Random Forest regression model.

    Parameters
    ----------
    n_estimators : int, optional
        Number of decision trees in the forest (default: 50).
    random_state : int, optional
        Seed for reproducibility (default: 42).

    Returns
    -------
    RandomForestRegressor
        Configured but untrained Random Forest model.
    """
    logging.info(f"Initializing Random Forest model (Trees: {n_estimators})")
    model = RandomForestRegressor(
        n_estimators=n_estimators,
        random_state=random_state,
        n_jobs=-1,  # Use all available processors
    )
    return model


def save_model(model, filepath="models/production_model.joblib"):
    """
    Persist trained model to disk using joblib serialization.

    Parameters
    ----------
    model : RandomForestRegressor
        Trained model instance to save.
    filepath : str, optional
        Output file path for model storage (default: "models/production_model.joblib").

    Returns
    -------
    None
        Creates or updates the serialized model file.
    """
    # Create parent directory if it doesn't exist
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    # Serialize and save model
    joblib.dump(model, filepath)
    logging.info(f"Model successfully saved to {filepath}")
