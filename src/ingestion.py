import pandas as pd
import logging

def load_raw_data(filepath):
    """Loads raw CSV data into a Pandas DataFrame."""
    logging.info(f"Loading raw data from {filepath}...")
    df = pd.read_csv(filepath)
    logging.info(f"Data loaded successfully. Shape: {df.shape}")
    return df