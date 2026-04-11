"""
Data Ingestion Module

Handles loading and initial import of raw data from CSV files for subsequent
processing and analysis.
"""

import logging

import pandas as pd


def load_raw_data(filepath):
    """
    Load raw CSV data into a Pandas DataFrame.

    Parameters
    ----------
    filepath : str
        Path to the CSV file containing raw data.

    Returns
    -------
    pd.DataFrame
        Loaded dataframe with raw data.

    Raises
    ------
    FileNotFoundError
        If the specified file does not exist.
    """
    logging.info(f"Loading raw data from {filepath}...")
    df = pd.read_csv(filepath)
    logging.info(f"Data loaded successfully. Shape: {df.shape}")
    return df
