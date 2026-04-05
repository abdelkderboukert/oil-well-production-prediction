# main.py
import logging
from src.utils import load_config
from src.ingestion import load_raw_data
from src.preprocessing import clean_data
from src.model import build_model
from src.train import train_and_evaluate

from src.visualize import plot_actual_vs_predicted, plot_feature_importance, plot_well_time_series

def main():
    config = load_config()
    raw_df = load_raw_data(config['data']['raw_path'])
    clean_df = clean_data(raw_df)
    
    clean_df.to_csv(config['data']['processed_path'], index=False)
    logging.info(f"Clean data saved to {config['data']['processed_path']}")
    
    model = build_model(
        n_estimators=config['model']['n_estimators'],
        random_state=config['model']['random_state']
    )

    trained_model, y_test, predictions = train_and_evaluate(
        model=model,
        df=clean_df,
        features=config['pipeline']['feature_cols'],
        target=config['pipeline']['target_col'],
        test_size=config['model']['test_size'],
        random_state=config['model']['random_state']
    )

    logging.info("Starting Visualizations...")
    
    plot_actual_vs_predicted(y_test, predictions)

    plot_feature_importance(trained_model, config['pipeline']['feature_cols'])
    
    plot_well_time_series(clean_df, well_name='TFT-302', target_col=config['pipeline']['target_col'])
    
    logging.info("Pipeline execution completed successfully!")

if __name__ == "__main__":
    main()