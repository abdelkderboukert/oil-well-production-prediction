"""
Utility Module

Provides helper functions for configuration management and system setup,
including logging initialization.
"""

import yaml
import logging

# Configure logging with timestamp, level, and message format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
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