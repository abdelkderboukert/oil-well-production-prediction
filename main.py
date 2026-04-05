"""
Oil Well Production Prediction Pipeline

This module orchestrates the end-to-end machine learning pipeline for predicting
oil well production rates. It handles data ingestion, preprocessing, model training,
evaluation, and visualization of results.
"""

import logging
import json
import os
from src.utils import load_config
from src.ingestion import load_raw_data
from src.preprocessing import clean_data
from src.model import build_model, save_model
from src.train import train_and_evaluate
from src.visualize import plot_actual_vs_predicted, plot_feature_importance, plot_well_time_series


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
    clean_df = clean_data(raw_df)
    
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
        features=config['pipeline']['feature_cols'],
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

    logging.info("Pipeline execution completed successfully!")

if __name__ == "__main__":
    main()