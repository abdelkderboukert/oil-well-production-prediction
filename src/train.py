"""
Model Training and Evaluation Module (Deep Learning)
Handles scaling, 3D sequence generation, training, and evaluation.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib
import logging
import os
from src.model import build_model

def create_sequences(df, features, target, time_steps):
    """Creates 3D time windows safely grouped by WELL."""
    X, y = [], []
    
    # Group by well to ensure dates from different wells never mix!
    for well_name, group in df.groupby('WELL'):
        group_features = group[features].values
        group_target = group[target].values
        
        for i in range(len(group) - time_steps):
            X.append(group_features[i : i + time_steps])
            y.append(group_target[i + time_steps])
            
    return np.array(X), np.array(y)

def train_and_evaluate(df, features, target, time_steps, test_size, random_state):
    logging.info("Scaling features and target to (0, 1)...")
    
    # Initialize and apply scalers
    feature_scaler = MinMaxScaler()
    target_scaler = MinMaxScaler()
    
    df_scaled = df.copy()
    df_scaled[features] = feature_scaler.fit_transform(df[features])
    df_scaled[[target]] = target_scaler.fit_transform(df[[target]])
    
    # Save scalers for your future Next.js GUI
    os.makedirs("models", exist_ok=True)
    joblib.dump(feature_scaler, "models/feature_scaler.joblib")
    joblib.dump(target_scaler, "models/target_scaler.joblib")
    logging.info("Scalers saved to models/ folder.")
    
    # Create Time Windows
    logging.info(f"Creating time sequences (Window={time_steps} days)...")
    X, y = create_sequences(df_scaled, features, target, time_steps)
    logging.info(f"Generated {X.shape[0]} valid time sequences.")
    
    # Split data (shuffle=False keeps chronological order for time-series evaluation)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, shuffle=False
    )
    
    # Build and Train the LSTM
    model = build_model(time_steps=time_steps, n_features=len(features))
    
    logging.info("Training LSTM model (this might take a minute)...")
    # Using validation_split to monitor overfitting during training
    model.fit(X_train, y_train, epochs=15, batch_size=64, validation_split=0.1, verbose=1)
    
    logging.info("Evaluating model...")
    predictions_scaled = model.predict(X_test)
    
    # Inverse transform to get real gas production numbers back
    y_test_real = target_scaler.inverse_transform(y_test.reshape(-1, 1))
    predictions_real = target_scaler.inverse_transform(predictions_scaled)
    
    # Calculate Metrics
    mae = mean_absolute_error(y_test_real, predictions_real)
    mse = mean_squared_error(y_test_real, predictions_real)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test_real, predictions_real)
    
    metrics = {
        "Model_Type": "LSTM Neural Network",
        "Time_Steps_Window": time_steps,
        "R2_Score": round(r2, 4),
        "Mean_Absolute_Error_MAE": round(mae, 4),
        "Root_Mean_Squared_Error_RMSE": round(rmse, 4)
    }
    
    logging.info("--- EVALUATION RESULTS ---")
    print(f"\n{'METRIC':<30} | {'VALUE':<25}")
    print("-" * 60)
    for key, value in metrics.items():
        print(f"{key:<30} | {value:<25}")
        
    return model, y_test_real.flatten(), predictions_real.flatten(), metrics