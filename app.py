from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load("breast_cancer_logreg_model.pkl")
with open("breast_cancer_features_logreg.txt", "r") as f:
    feature_names = [line.strip() for line in f.readlines()]

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        values = [float(data.get(feature, 0)) for feature in feature_names]
        prediction = model.predict([values])[0]
        probability = model.predict_proba([values])[0][prediction]
        return jsonify({
            "prediction": int(prediction),
            "probability": float(probability)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/features", methods=["GET"])
def get_features():
    return jsonify({"features": feature_names})

if __name__ == "__main__":
    app.run(debug=True)
