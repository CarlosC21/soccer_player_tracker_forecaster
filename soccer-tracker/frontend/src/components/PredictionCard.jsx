import React, { useEffect, useState } from "react";
import { getPredictions } from "../api/axios";

export default function PredictionCard({ playerId, latestStats }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getPredictions(playerId);
        setPrediction(data);
      } catch (e) {
        console.error("Prediction error:", e);
        setError("Failed to fetch predictions.");
      } finally {
        setLoading(false);
      }
    };

    if (latestStats) {
      fetchPrediction();
    }
  }, [playerId, latestStats]);

  if (!latestStats) return null;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
      }}
    >
      <h4>AI Predictions</h4>
      {loading && <p>Loading predictions...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {prediction && (
        <div>
          <p>
            <strong>Injury Risk:</strong>{" "}
            {(prediction.injury.probability * 100).toFixed(1)}%
          </p>
          <p>
            <strong>Market Value Change (6 mo):</strong>{" "}
            {(prediction.investment.predicted_pct_change * 100).toFixed(1)}%
          </p>
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            Method: {prediction.investment.method}
          </p>
        </div>
      )}
    </div>
  );
}
