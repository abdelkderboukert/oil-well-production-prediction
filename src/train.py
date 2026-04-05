from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import logging

def train_and_evaluate(model, df, features, target, test_size, random_state):
    """Splits data, trains the model, and evaluates it."""
    logging.info("Splitting dataset into train and test sets...")
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    logging.info("Training the model...")
    model.fit(X_train, y_train)
    
    logging.info("Evaluating the model...")
    predictions = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    logging.info(f"--- RESULTS ---")
    logging.info(f"MAE: {mae:.4f}")
    logging.info(f"R2 Score: {r2:.4f}")
    
    return model, y_test, predictions