"""
Model Training and Evaluation Module

Handles model training on training data and comprehensive evaluation using
multiple performance metrics.
"""

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import logging


def train_and_evaluate(model, df, features, target, test_size, random_state):
    """
    Train model on dataset and evaluate performance.
    
    Splits data into training and test sets, trains the model, generates
    predictions, and calculates comprehensive performance metrics.
    
    Parameters
    ----------
    model : RandomForestRegressor
        Uninitialized model instance.
    df : pd.DataFrame
        Preprocessed dataset containing features and target.
    features : list
        List of feature column names for model input.
    target : str
        Target column name for prediction.
    test_size : float
        Proportion of data to use for testing (0-1).
    random_state : int
        Random seed for reproducible train-test split.
    
    Returns
    -------
    tuple
        (trained_model, y_test, predictions, metrics_dict)
    """
    logging.info("Splitting dataset into train and test sets...")
    X = df[features]
    y = df[target]
    
    # Split data maintaining temporal coherence
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    logging.info("Training the model...")
    model.fit(X_train, y_train)
    
    logging.info("Evaluating the model...")
    predictions = model.predict(X_test)
    
    # Calculate comprehensive performance metrics
    mae = mean_absolute_error(y_test, predictions)
    mse = mean_squared_error(y_test, predictions)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, predictions)
    
    # Aggregate metrics into a structured dictionary
    metrics = {
        "Model_Type": "RandomForestRegressor",
        "R2_Score": round(r2, 4),
        "Mean_Absolute_Error_MAE": round(mae, 4),
        "Mean_Squared_Error_MSE": round(mse, 4),
        "Root_Mean_Squared_Error_RMSE": round(rmse, 4)
    }
    
    logging.info("--- EVALUATION RESULTS ---")
    for key, value in metrics.items():
        logging.info(f"{key}: {value}")
    
    return model, y_test, predictions, metrics