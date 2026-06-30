import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

# Load dataset
df = pd.read_csv("../dataset/products_dataset_cleaned.csv")

# Encode categorical columns
encoders = {}

for col in ["category", "supplier", "status"]:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# Features
X = df[
    [
        "category",
        "per_cost",
        "threshold",
        "supplier"
    ]
]

# Target
y = df["quantity"]

# Train/Test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Model
model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# Save model
joblib.dump(model, "model.pkl")
joblib.dump(encoders, "encoders.pkl")

print("✅ Model trained successfully!")