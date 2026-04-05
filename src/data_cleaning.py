import pandas as pd
import numpy as np

def clean_my_dataset(filepath):
    print("Loading dataset...")
    df = pd.read_csv(filepath)
    
    # 1. Drop the completely empty column
    print("Dropping 'prodindex' (100% missing)...")
    df = df.drop(columns=['prodindex'], errors='ignore')
    
    # 2. Convert DATE to actual datetime format
    print("Formatting dates...")
    df['DATE'] = pd.to_datetime(df['DATE'])
    
    # 3. Sort by WELL first, then by DATE chronologically
    df = df.sort_values(by=['WELL', 'DATE']).reset_index(drop=True)
    
    # 4. Remove physical impossibilities (Negative pressures/volumes become NaN)
    print("Removing impossible negative values...")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        df.loc[df[col] < 0, col] = np.nan
        
    # 5. Fill missing values SMARTLY (Well by Well)
    print("Filling missing sensor data for each well individually...")
    # This takes the previous day's reading for THAT specific well
    df_clean = df.groupby('WELL', group_keys=False).apply(lambda group: group.ffill().bfill())
    
    # 6. Fill any wells that are missing a sensor entirely with 0
    df_clean = df_clean.fillna(0)
    
    print("\n--- Cleaning Complete ---")
    print(f"Final Shape: {df_clean.shape}")
    print("\nRemaining Missing Values:")
    print(df_clean.isnull().sum())
    
    return df_clean

# --- RUN THE FUNCTION ---
# Replace 'data.csv' with your actual file path if it's different
cleaned_data = clean_my_dataset('data.csv')

# Save the cleaned data to a new file so you don't have to clean it again
cleaned_data.to_csv('cleaned_well_data.csv', index=False)
print("\nSaved to 'cleaned_well_data.csv'!")