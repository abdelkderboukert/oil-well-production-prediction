# main.py
import pandas as pd

# Import your custom functions from the src folder
from src.data_cleaning import clean_oil_well_data
from src.model_training import train_production_model

def main():
    print("=== Starting PFE Pipeline ===")
    
    # 1. Define paths and parameters
    input_file = "data/raw_data.csv"
    output_file = "data/clean_data.csv"
    
    useless_columns = ['Well_Name', 'Operator', 'String_ID'] # Modify based on your data
    date_col = 'Date' # Modify based on your data
    target_col = 'Volume_Oil_Produced' # The column you want to predict
    
    # 2. Clean the Data
    print("\n--- Step 1: Cleaning Data ---")
    clean_df = clean_oil_well_data(
        filepath=input_file, 
        date_column=date_col, 
        drop_cols=useless_columns
    )
    
    # Save the cleaned data so you can inspect it later
    clean_df.to_csv(output_file)
    print(f"Cleaned data saved to {output_file}")
    
    # 3. Train the Prediction Model
    print("\n--- Step 2: Training Prediction Model ---")
    # Make sure the target column exists in your data before training
    if target_col in clean_df.columns:
        model = train_production_model(clean_df, target_column=target_col)
    else:
        print(f"Error: Target column '{target_col}' not found in the dataset.")
        print(f"Available columns are: {list(clean_df.columns)}")

if __name__ == "__main__":
    main()