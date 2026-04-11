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

import json
import logging
import os
from src.utils import load_config , check_feature_leakage
from src.ingestion import load_raw_data
from src.model import build_model, save_model
from src.preprocessing import clean_data, prepare_for_lstm
from src.train import train_and_evaluate
from src.utils import check_feature_leakage, load_config
from src.visualize import (plot_actual_vs_predicted, plot_feature_importance,
                           plot_well_time_series)


def main():
    """
    Execute the complete production prediction pipeline.
    
    Workflow:
    1. Load configuration from YAML file
    2. Ingest and clean raw data
    3. Build and train Random Forest model
    4. Evaluate model performance and generate metrics
    5. Generate visualization reports
    """
    # Load configuration
    config = load_config()
    
    # Data ingestion and preprocessing
    raw_df = load_raw_data(config['data']['raw_path'])
    df = clean_data(raw_df)
    clean_df = prepare_for_lstm(df)

    check_feature_leakage(clean_df)
    
    # Save processed data
    clean_df.to_csv(config['data']['processed_path'], index=False)
    logging.info(f"Clean data saved to {config['data']['processed_path']}")
    
    # Model initialization
    model = build_model(
        n_estimators=config['model']['n_estimators'],
        random_state=config['model']['random_state']
    )

    # Train model and compute evaluation metrics
    trained_model, y_test, predictions, metrics = train_and_evaluate(
        model=model,
        df=clean_df,
        features=config['pipeline']['safe_features'],
        target=config['pipeline']['target_col'],
        test_size=config['model']['test_size'],
        random_state=config['model']['random_state']
    )
    
    # Save trained model
    save_model(trained_model, filepath="models/production_model.joblib")
    
    # Generate and save performance metrics report
    os.makedirs("reports", exist_ok=True)
    report_path = "reports/model_metrics.json"
    with open(report_path, "w") as f:
        json.dump(metrics, f, indent=4)
    logging.info(f"Metrics report saved to {report_path}")

    # Generate visualization outputs
    logging.info("Generating visualizations...")
    plot_actual_vs_predicted(y_test, predictions)
    plot_feature_importance(trained_model, config['pipeline']['feature_cols'])
    plot_well_time_series(clean_df, well_name='TFT-302', target_col=config['pipeline']['target_col'])

    logging.info("Dual Pipeline execution completed successfully! Both models are saved.")



if __name__ == "__main__":
    main()
