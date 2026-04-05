import yaml
import logging

# Set up basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_config(config_path="config/config.yaml"):
    """Loads the YAML configuration file."""
    try:
        with open(config_path, "r") as file:
            config = yaml.safe_load(file)
            logging.info("Configuration loaded successfully.")
            return config
    except Exception as e:
        logging.error(f"Error loading config file: {e}")
        raise