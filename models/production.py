# Sneak peek of your future GUI code
import joblib
import pandas as pd

# 1. Load the sleeping model from the hard drive
my_model = joblib.load("models/production_model.joblib")

# 2. When the user types numbers into the GUI and clicks "Predict":
user_input = pd.DataFrame({"HOURS": [24], "WHP": [150], "WHT": [60], "WLP": [40]})
prediction = my_model.predict(user_input)

print(f"Predicted Gas Production: {prediction}")