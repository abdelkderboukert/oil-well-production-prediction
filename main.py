# """
# Oil Well Production Prediction Pipeline
# Executes the deep learning pipeline using LSTM.
# """

# import logging
# import json
# import os
# from src.utils import load_config, check_feature_leakage
# from src.ingestion import load_raw_data
# from src.preprocessing import clean_data
# from src.train import train_and_evaluate
# from src.model import save_model

# # Notice: plot_feature_importance is removed since LSTMs don't support it natively
# from src.visualize import plot_actual_vs_predicted, plot_well_time_series

# def main():
#     config = load_config()
    
#     raw_df = load_raw_data(config['data']['raw_path'])
#     clean_df = clean_data(raw_df)
#     check_feature_leakage(clean_df)
    
#     clean_df.to_csv(config['data']['processed_path'], index=False)
#     logging.info(f"Clean data saved to {config['data']['processed_path']}")
    
#     # --- DEEP LEARNING SETTINGS ---
#     TIME_STEPS = 7 # The LSTM will look at the past 7 days to predict the future
    
#     trained_model, y_test, predictions, metrics = train_and_evaluate(
#         df=clean_df,
#         features=config['pipeline']['safe_features'],
#         target=config['pipeline']['target_col'],
#         time_steps=TIME_STEPS,
#         test_size=config['model']['test_size'],
#         random_state=config['model']['random_state']
#     )
    
#     # Save the LSTM model to .keras
#     save_model(trained_model, filepath="models/production_model.keras")
    
#     # Save metrics report
#     os.makedirs("reports", exist_ok=True)
#     report_path = "reports/lstm_model_metrics.json"
#     with open(report_path, "w") as f:
#         json.dump(metrics, f, indent=4)
#     logging.info(f"Metrics report saved to {report_path}")

#     # Visualizations
#     logging.info("Generating visualizations...")
#     plot_actual_vs_predicted(y_test, predictions)
#     plot_well_time_series(clean_df, well_name='TFT-302', target_col=config['pipeline']['target_col'])

#     logging.info("LSTM Pipeline execution completed successfully!")

# if __name__ == "__main__":
#     main()


"""
Dual-Model Production Prediction Pipeline
Trains and saves both the LSTM (Forecaster) and Random Forest (Anomaly Detector).
"""

import logging
import json
import os
from src.utils import load_config, check_feature_leakage
from src.ingestion import load_raw_data
from src.preprocessing import clean_data
from src.train import train_and_evaluate_lstm, train_and_evaluate_rf
from src.model import save_lstm_model, save_rf_model

def main():
    config = load_config()
    
    # 1. Data Processing
    raw_df = load_raw_data(config['data']['raw_path'])
    clean_df = clean_data(raw_df)
    check_feature_leakage(clean_df)
    
    clean_df.to_csv(config['data']['processed_path'], index=False)
    logging.info("Clean data saved to processed folder.")
    
    features = config['pipeline']['safe_features']
    target = config['pipeline']['target_col']
    test_size = config['model']['test_size']
    random_state = config['model']['random_state']

    all_metrics = {}

    # 2. Train and Save LSTM (The Forecaster)
    TIME_STEPS = 7
    lstm_model, lstm_y, lstm_pred, lstm_metrics = train_and_evaluate_lstm(
        clean_df, features, target, TIME_STEPS, test_size, random_state
    )
    save_lstm_model(lstm_model, filepath="models/production_model.keras")
    all_metrics["LSTM"] = lstm_metrics

    # 3. Train and Save Random Forest (The Anomaly Detector)
    rf_model, rf_y, rf_pred, rf_metrics = train_and_evaluate_rf(
        clean_df, features, target, test_size, random_state
    )
    save_rf_model(rf_model, filepath="models/rf_model.joblib")
    all_metrics["Random_Forest"] = rf_metrics

    # 4. Save Combined Metrics
    os.makedirs("reports", exist_ok=True)
    with open("reports/dual_model_metrics.json", "w") as f:
        json.dump(all_metrics, f, indent=4)
        
    logging.info("\n--- FINAL RESULTS ---")
    for model_name, metrics in all_metrics.items():
        print(f"\n{model_name}:")
        for k, v in metrics.items():
            print(f"  {k}: {v}")

    logging.info("Dual Pipeline execution completed successfully! Both models are saved.")

if __name__ == "__main__":
    main()