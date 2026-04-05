from sklearn.ensemble import RandomForestRegressor
import logging

def build_model(n_estimators=50, random_state=42):
    """Returns the compiled Machine Learning model."""
    logging.info(f"Initializing RandomForest (Trees: {n_estimators})")
    model = RandomForestRegressor(
        n_estimators=n_estimators, 
        random_state=random_state, 
        n_jobs=-1
    )
    return model