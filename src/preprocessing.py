"""
Data Preprocessing Module

Performs comprehensive data cleaning and transformation including handling missing
values, date formatting, and removal of invalid data points.
"""

import pandas as pd
import numpy as np
import logging


def clean_data(df):
    """
    Clean and preprocess oil well production dataset.
    
    Processing steps:
    1. Remove irrelevant columns
    2. Convert date strings to datetime objects
    3. Sort records chronologically by well and date
    4. Replace negative values with NaN (physically invalid)
    5. Impute missing values using forward-fill and back-fill by well
    6. Fill remaining NaN values with 0
    
    Parameters
    ----------
    df : pd.DataFrame
        Raw dataframe containing oil well production data.
    
    Returns
    -------
    pd.DataFrame
        Cleaned dataframe ready for modeling.
    """
    logging.info("Starting data preprocessing...")
    
    # Remove irrelevant columns
    df = df.drop(columns=['prodindex'], errors='ignore')
    
    # Convert DATE column to datetime format
    df['DATE'] = pd.to_datetime(df['DATE'])
    
    # Sort data chronologically by well and date for time series consistency
    df = df.sort_values(by=['WELL', 'DATE']).reset_index(drop=True)
    
    # Replace physically impossible negative values with NaN
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        df.loc[df[col] < 0, col] = np.nan
    
    # Impute missing values using forward-fill then back-fill within each well group
    logging.info("Filling missing values by well...")
    cols_to_fill = df.columns.drop(['WELL', 'DATE'])
    df[cols_to_fill] = df.groupby('WELL')[cols_to_fill].ffill().bfill()
    
    # # Fill any remaining NaN values with 0
    # df_clean = df.fillna(0)
    
    logging.info("Preprocessing complete.")
    return df

def prepare_for_lstm(df):
    """
    Step 2: Model-specific preparation.
    LSTMs cannot handle NaNs, so we fill them with 0 here.
    """
    logging.info("Prepare for LSTM : Fill any remaining NaN values with 0")
    return df.fillna(0)