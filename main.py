"""
Oil Well Production Prediction Pipeline
Executes the deep learning pipeline using LSTM.
"""

import logging
import json
import os
from src.utils import load_config, check_feature_leakage
from src.ingestion import load_raw_data
from src.preprocessing import clean_data
from src.train import train_and_evaluate
from src.model import save_model

# Notice: plot_feature_importance is removed since LSTMs don't support it natively
from src.visualize import plot_actual_vs_predicted, plot_well_time_series

def main():
    config = load_config()
    
    raw_df = load_raw_data(config['data']['raw_path'])
    clean_df = clean_data(raw_df)
    check_feature_leakage(clean_df)
    
    clean_df.to_csv(config['data']['processed_path'], index=False)
    logging.info(f"Clean data saved to {config['data']['processed_path']}")
    
    # --- DEEP LEARNING SETTINGS ---
    TIME_STEPS = 7 # The LSTM will look at the past 7 days to predict the future
    
    trained_model, y_test, predictions, metrics = train_and_evaluate(
        df=clean_df,
        features=config['pipeline']['safe_features'],
        target=config['pipeline']['target_col'],
        time_steps=TIME_STEPS,
        test_size=config['model']['test_size'],
        random_state=config['model']['random_state']
    )
    
    # Save the LSTM model to .keras
    save_model(trained_model, filepath="models/production_model.keras")
    
    # Save metrics report
    os.makedirs("reports", exist_ok=True)
    report_path = "reports/lstm_model_metrics.json"
    with open(report_path, "w") as f:
        json.dump(metrics, f, indent=4)
    logging.info(f"Metrics report saved to {report_path}")

    # Visualizations
    logging.info("Generating visualizations...")
    plot_actual_vs_predicted(y_test, predictions)
    plot_well_time_series(clean_df, well_name='TFT-302', target_col=config['pipeline']['target_col'])

    logging.info("LSTM Pipeline execution completed successfully!")

if __name__ == "__main__":
    main()