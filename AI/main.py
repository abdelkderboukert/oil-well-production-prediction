"""
Oil Well Production Prediction Pipeline
Trains BOTH the LSTM and Random Forest for MULTI-TARGET Regression.
"""

import logging
import json
import os
from src.utils import load_config, check_feature_leakage, notify_django_to_reload
from src.ingestion import load_raw_data
from src.preprocessing import clean_data
from src.train import train_and_evaluate_lstm, train_and_evaluate_rf
from src.model import save_lstm_model, save_rf_model
from src.visualize import plot_actual_vs_predicted, plot_well_time_series

def main():
    config = load_config()
    
    raw_df = load_raw_data(config['data']['raw_path'])
    clean_df = clean_data(raw_df)
    check_feature_leakage(clean_df)
    
    clean_df.to_csv(config['data']['processed_path'], index=False)
    logging.info("Clean data saved to processed folder.")
    
    features = config['pipeline']['safe_features']
    features_lstm = config['pipeline']['feature_cols']
    
    # Multi-target columns
    targets = config['pipeline']['target_col']
    if isinstance(targets, str):
        targets = [targets]
        
    test_size = config['model']['test_size']
    random_state = config['model']['random_state']

    all_metrics = {}

    # 1. Train and Save LSTM (The Forecaster)
    TIME_STEPS = 7
    lstm_model, lstm_y, lstm_pred, lstm_metrics = train_and_evaluate_lstm(
        clean_df, features_lstm, targets, TIME_STEPS, test_size, random_state
    )
    save_lstm_model(lstm_model, filepath="models/production_model.keras")
    all_metrics["LSTM"] = lstm_metrics

    # 2. Train and Save Random Forest (The Anomaly Detector)
    rf_model, rf_y, rf_pred, rf_metrics = train_and_evaluate_rf(
        clean_df, features, targets, test_size, random_state
    )
    save_rf_model(rf_model, filepath="models/rf_model.joblib")
    all_metrics["Random_Forest"] = rf_metrics

    # 3. Save Combined Metrics
    os.makedirs("reports", exist_ok=True)
    with open("reports/dual_model_metrics.json", "w") as f:
        json.dump(all_metrics, f, indent=4)
        
    logging.info("\n" + "*"*60 + "\n🏆 FINAL DUAL-MODEL PERFORMANCE REPORT\n" + "*"*60)
    print(f"\n{'METRIC':<30} | {'RANDOM FOREST (MULTI)':<25} | {'LSTM (MULTI)':<25}")
    print("-" * 85)
    for key in ["R2_Score", "MAE", "RMSE"]:
        print(f"{key:<30} | {rf_metrics[key]:<25} | {lstm_metrics[key]:<25}")
        
    # 4. Generate Visualizations (Plotting just the first target, usually W_GAS)
    logging.info("Generating visualizations for primary target...")
    primary_target = targets[0]
    
    # Since y is a 2D array now, we slice [:, 0] to just plot the W_GAS predictions
    plot_actual_vs_predicted(lstm_y[:, 0], lstm_pred[:, 0], filepath=f"plots/actual_vs_predicted_{primary_target}.png")
    plot_well_time_series(clean_df, well_name='TFT-302', target_col=primary_target)
    notify_django_to_reload()

    logging.info("\n🎉 Pipeline execution completed successfully! Multi-Output models are ready.")

if __name__ == "__main__":
    main()