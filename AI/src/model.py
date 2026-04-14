"""
Model Management Module (Multi-Output Architecture)
Handles creation, initialization, and persistence of both LSTM and Random Forest models.
"""

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.ensemble import RandomForestRegressor
import joblib
import logging
import os

# ==========================================
# 🧠 1. LSTM MODEL (For Forecasting)
# ==========================================
def build_lstm_model(time_steps, n_features, n_outputs):
    """Builds and compiles the LSTM Neural Network for multi-target forecasting."""
    logging.info(f"Initializing LSTM Model (Input shape: {time_steps} steps, {n_features} features, {n_outputs} outputs)")
    model = Sequential([
        LSTM(64, activation='relu', return_sequences=True, input_shape=(time_steps, n_features)),
        Dropout(0.2),
        LSTM(32, activation='relu'),
        Dropout(0.2),
        Dense(n_outputs)  # <--- Automatically adjusts to predict 6 variables!
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

def save_lstm_model(model, filepath="models/production_model.keras"):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    model.save(filepath)
    logging.info(f"LSTM Model successfully saved to {filepath}")

# ==========================================
# 🌲 2. RANDOM FOREST MODEL (For Anomalies)
# ==========================================
# def build_rf_model(n_estimators=100, random_state=42):
#     """Initializes the Random Forest model (Native Multi-Output support)."""
#     logging.info(f"Initializing Random Forest model (Trees: {n_estimators})")
#     model = RandomForestRegressor(
#         n_estimators=n_estimators, 
#         random_state=random_state, 
#         n_jobs=-1
#     )
#     return model

def build_rf_model(n_estimators=50, random_state=42):
    logging.info(f"Initializing Random Forest model (Trees: {n_estimators}) with RAM limits")
    model = RandomForestRegressor(
        n_estimators=n_estimators, # Reduced from 100 to 50
        max_depth=15,              # Stops trees from growing infinitely and eating RAM
        min_samples_split=10,      # Prevents calculating splits on tiny data fragments
        random_state=random_state, 
        n_jobs=2                   # Changed from -1. Restricts to 2 CPU cores to prevent memory duplication
    )
    return model

def save_rf_model(model, filepath="models/rf_model.joblib"):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(model, filepath)
    logging.info(f"Random Forest Model successfully saved to {filepath}")