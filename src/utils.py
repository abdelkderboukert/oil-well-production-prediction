"""
Utility Module

Provides helper functions for configuration management and system setup,
including logging initialization.
"""

import logging

import yaml

# Configure logging with timestamp, level, and message format
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def load_config(config_path="config/config.yaml"):
    """
    Load and parse YAML configuration file.

    Parameters
    ----------
    config_path : str, optional
        Path to YAML configuration file (default: "config/config.yaml").

    Returns
    -------
    dict
        Parsed configuration dictionary.

    Raises
    ------
    FileNotFoundError
        If configuration file does not exist.
    yaml.YAMLError
        If YAML file is malformed.
    """
    try:
        with open(config_path, "r") as file:
            config = yaml.safe_load(file)
            logging.info("Configuration loaded successfully.")
            return config
    except Exception as e:
        logging.error(f"Error loading config file: {e}")
        raise


def check_feature_leakage(df):
    # 1. Initialization
    config = load_config()
    safe_list = []
    results = {}

    target = config["pipeline"]["target_col"]
    features = config["pipeline"]["feature_cols"]

    print(f"\n{'FEATURE':<15} | {'CORRELATION WITH ' + target:<25} | {'STATUS'}")
    print("-" * 75)

    # 2. Logic Loop (In-Memory Processing)
    for col in features:
        if col in df.columns:
            corr = df[col].corr(df[target])
            results[col] = corr

            if abs(corr) > 0.95:
                status = "❌ HIGH LEAKAGE RISK"
            elif abs(corr) > 0.80:
                status = "⚠️ STRONG DRIVER"
                # safe_list.append(col) Optional: decide if strong drivers are 'safe'
            else:
                status = "✅ OK"
                safe_list.append(col)

            print(f"{col:<15} | {corr:>25.4f} | {status}")
        else:
            print(f"{col:<15} | {'COLUMN MISSING':>25} | ⚠️")

    # 3. Persistence (Single Disk Write - Outside Loop)
    config["pipeline"]["safe_features"] = safe_list

    try:
        # Resolve path clearly - assuming 'config/config.yaml' relative to project root
        with open("config/config.yaml", "w") as file:
            yaml.dump(config, file, default_flow_style=False)
        print(f"\n🚀 Success: config.yaml updated with {len(safe_list)} safe features.")
    except Exception as e:
        logging.error(f"Failed to persist safe_features to config: {e}")

    return results
