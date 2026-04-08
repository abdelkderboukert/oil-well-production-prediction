"""
Model Management Module (Deep Learning)
Handles creation, initialization, and persistence of the LSTM model.
"""

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import logging
import os

def build_model(time_steps, n_features):
    """
    Builds and compiles the LSTM Neural Network.
    
    Parameters
    ----------
    time_steps : int
        The number of past days the model looks at (e.g., 7 days).
    n_features : int
        The number of input variables (WHP, WHT, etc.).
    """
    logging.info(f"Initializing LSTM Model (Input shape: {time_steps} steps, {n_features} features)")
    
    model = Sequential([
        # First LSTM layer with Dropout to prevent overfitting
        LSTM(64, activation='relu', return_sequences=True, input_shape=(time_steps, n_features)),
        Dropout(0.2),
        
        # Second LSTM layer
        LSTM(32, activation='relu'),
        Dropout(0.2),
        
        # Output layer (Predicting 1 continuous value: W_GAS)
        Dense(1)
    ])
    
    # Compile the neural network
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

def save_model(model, filepath="models/production_model.keras"):
    """Saves the trained LSTM model to the hard drive."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    # LSTMs use .keras format instead of .joblib
    model.save(filepath)
    logging.info(f"LSTM Model successfully saved to {filepath}")