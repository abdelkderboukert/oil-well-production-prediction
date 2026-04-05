import pandas as pd
import numpy as np
import logging

def clean_data(df):
    """Cleans the oil well dataset."""
    logging.info("Starting data preprocessing...")
    
    # 1. Drop useless columns
    df = df.drop(columns=['prodindex'], errors='ignore')
    
    # 2. Date formatting
    df['DATE'] = pd.to_datetime(df['DATE'])
    
    # 3. Sort chronologically by Well
    df = df.sort_values(by=['WELL', 'DATE']).reset_index(drop=True)
    
    # 4. Remove physical impossibilities (negatives)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        df.loc[df[col] < 0, col] = np.nan
        
    # 5. Smart filling by well
    logging.info("Filling missing values by well...")
    cols_to_fill = df.columns.drop(['WELL', 'DATE'])
    df[cols_to_fill] = df.groupby('WELL')[cols_to_fill].ffill().bfill()
    
    # FIXED LINE: We use df instead of df_clean here
    df_clean = df.fillna(0)
    
    logging.info("Preprocessing complete.")
    return df_clean