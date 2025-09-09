// frontend/src/components/PredictionPanel.jsx
import React, { useEffect, useState } from "react";
import { predictInjury, predictInvestment } from "../api/predict";

export default function PredictionPanel({ playerId, refreshKey }) {
  const [injury, setInjury] = useState(null);
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const [injuryRes, investRes] = await Promise.all([
          predictInjury(playerId),
          predictInvestment(playerId),
        ]);

        setInjury(injuryRes);
        setInvestment(investRes);
      } catch (e) {
        console.error("Prediction error:", e);
        setError("Could not load predictions");
      } finally {
        setLoading(false);
      }
    }
    if (playerId) load();
  }, [playerId, refreshKey]);

  if (loading) return <p>Loading predictions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white mt-4">
      <h3 className="text-lg font-semibold mb-2">Predictions</h3>

      {/* Injury Risk */}
      {injury && (
        <div className="mb-2">
          <p>
            <strong>Injury Risk:</strong>{" "}
            <span
              style={{
                color:
                  injury.risk === "high"
                    ? "red"
                    : injury.risk === "medium"
                    ? "orange"
                    : "green",
              }}
            >
              {injury.risk.toUpperCase()}
            </span>{" "}
            ({(injury.probability * 100).toFixed(1)}%)
          </p>
        </div>
      )}

      {/* Investment Forecast */}
      {investment && (
        <div>
          <p>
            <strong>Investment Forecast:</strong>{" "}
            {investment.predicted_pct_change > 0 ? "📈 Rise" : "📉 Fall"}
          </p>
          <p className="text-sm text-gray-500">
            Expected Change (next {investment.horizon_days} days):{" "}
            {(investment.predicted_pct_change * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
