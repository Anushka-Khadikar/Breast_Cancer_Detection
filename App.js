import React, { useEffect, useState } from "react";
import { getFeatures } from "./features";
import "./App.css";

const App = () => {
  const [features, setFeatures] = useState([]);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchFeatures = async () => {
      const data = await getFeatures();
      setFeatures(data);
      const initialInputs = {};
      data.forEach((feature) => (initialInputs[feature] = ""));
      setInputs(initialInputs);
    };
    fetchFeatures();
  }, []);

  const handleChange = (e, feature) => {
    setInputs({ ...inputs, [feature]: e.target.value });
  };

  const handleSubmit = async () => {
    const inputValues = {};
    for (const key in inputs) {
      inputValues[key] = parseFloat(inputs[key]) || 0;
    }

    setLoading(true);
    setShowPopup(false);
    setPrediction(null);

    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputValues),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setPrediction(data.prediction);
      setConfidence((data.probability * 100).toFixed(2));
      setShowPopup(true);
    } catch (err) {
      alert("Prediction failed: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">Breast Cancer Prediction</h1>
      <div className="form-grid">
        {features.map((feature, index) => (
          <div className="input-field" key={index}>
            <label>{feature}</label>
            <input
              type="number"
              value={inputs[feature] || ""}
              onChange={(e) => handleChange(e, feature)}
            />
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="predict-btn">
        {loading ? "Predicting..." : "Predict"}
      </button>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>
              {prediction === 1 ? "⚠️ Malignant" : "✅ Benign"}
            </h2>
            <p>Confidence: {confidence}%</p>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
