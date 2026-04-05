# src/visualize.py
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import logging
import os

# Ensure plots directory exists
os.makedirs("plots", exist_ok=True)

def plot_actual_vs_predicted(y_true, y_pred, filepath="plots/actual_vs_predicted.png"):
    """Plots actual vs predicted values."""
    logging.info("Generating Actual vs Predicted plot...")
    plt.figure(figsize=(8, 8))
    plt.scatter(y_true, y_pred, alpha=0.3, color='blue')
    
    # Plot the perfect prediction diagonal line
    max_val = max(max(y_true), max(y_pred))
    min_val = min(min(y_true), min(y_pred))
    plt.plot([min_val, max_val], [min_val, max_val], 'r--')
    
    plt.xlabel("Actual Production (W_GAS)")
    plt.ylabel("Predicted Production (W_GAS)")
    plt.title("Actual vs Predicted Production")
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(filepath)
    plt.close()
    logging.info(f"Plot saved to {filepath}")

def plot_feature_importance(model, features, filepath="plots/feature_importance.png"):
    """Plots the importance of each feature in the Random Forest model."""
    logging.info("Generating Feature Importance plot...")
    importances = model.feature_importances_
    
    # Sort features by importance
    indices = np.argsort(importances)[::-1]
    sorted_features = [features[i] for i in indices]
    sorted_importances = importances[indices]
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x=sorted_importances, y=sorted_features, palette="viridis")
    plt.title("Feature Importance (What drives production?)")
    plt.xlabel("Relative Importance")
    plt.ylabel("Operational Parameters")
    plt.tight_layout()
    plt.savefig(filepath)
    plt.close()
    logging.info(f"Plot saved to {filepath}")

def plot_well_time_series(df, well_name, target_col='W_GAS', filepath=None):
    """Plots the production profile of a specific well over time."""
    logging.info(f"Generating Time-Series plot for well: {well_name}")
    
    # Filter for the specific well
    well_data = df[df['WELL'] == well_name].copy()
    
    if well_data.empty:
        logging.warning(f"No data found for well {well_name}")
        return
        
    plt.figure(figsize=(14, 6))
    plt.plot(well_data['DATE'], well_data[target_col], label=f'Actual {target_col}', color='darkgreen')
    
    plt.title(f"Production Profile for Well: {well_name}")
    plt.xlabel("Date")
    plt.ylabel(f"Production ({target_col})")
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    if filepath is None:
        filepath = f"plots/timeseries_{well_name}.png"
        
    plt.savefig(filepath)
    plt.close()
    logging.info(f"Plot saved to {filepath}")