"""
Utility Module
Provides helper functions for configuration and feature leakage checking for Multi-Output models.
"""

import yaml
import logging
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def load_config(config_path="config/config.yaml"):
    try:
        with open(config_path, "r") as file:
            config = yaml.safe_load(file)
            logging.info("Configuration loaded successfully.")
            return config
    except Exception as e:
        logging.error(f"Error loading config file: {e}")
        raise

def check_feature_leakage(df):
    config = load_config()
    safe_list = []
    
    # Handle both single string and lists
    targets = config['pipeline']['target_col']
    if isinstance(targets, str):
        targets = [targets]
        
    features = config['pipeline']['feature_cols']
    
    print(f"\n{'FEATURE':<15} | {'MAX CORRELATION (ALL TARGETS)':<30} | {'STATUS'}")
    print("-" * 80)
    
    for col in features:
        if col in df.columns:
            # Check correlation against ALL target variables and pick the highest one
            max_corr = 0
            for target in targets:
                corr = abs(df[col].corr(df[target]))
                if pd.notna(corr) and corr > max_corr:
                    max_corr = corr
            
            if max_corr > 0.95:
                status = "❌ HIGH LEAKAGE RISK"
            elif max_corr > 0.80:
                status = "⚠️ STRONG DRIVER"
            else:
                status = "✅ OK"
                safe_list.append(col)
                
            print(f"{col:<15} | {max_corr:>30.4f} | {status}")
        else:
            print(f"{col:<15} | {'COLUMN MISSING':>30} | ⚠️")

    config['pipeline']['safe_features'] = safe_list
    
    try:
        with open('config/config.yaml', 'w') as file:
            yaml.dump(config, file, default_flow_style=False, sort_keys=False)
        logging.info(f"Success: config.yaml updated with {len(safe_list)} safe features.")
    except Exception as e:
        logging.error(f"Could not update config.yaml: {e}")