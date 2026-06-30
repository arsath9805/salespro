from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model
model = joblib.load("model.pkl")
encoders = joblib.load("encoders.pkl")


@app.route("/")
def home():
    return "Sales Forecasting API Running!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json
    print("Received data:", data)

    category = data["category"]
    per_cost = float(data["per_cost"])
    threshold = float(data["threshold"])
    supplier = data["supplier"]

    print("Category:", category)
    print("Supplier:", supplier)

    # Encode text values
    category_encoded = encoders["category"].transform([category])[0]
    supplier_encoded = encoders["supplier"].transform([supplier])[0]

    features = np.array([
        [
            category_encoded,
            per_cost,
            threshold,
            supplier_encoded
        ]
    ])

    print("Features:", features)

    prediction = model.predict(features)[0]

    print("Prediction:", prediction)

    return jsonify({
        "predicted_quantity": round(float(prediction), 2)
    })

if __name__ == "__main__":
    app.run(debug=True)