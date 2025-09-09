// src/components/PredictionCard.jsx
import React, { useEffect, useState } from "react";
import { runPrediction } from "../api/axios";

/**
 * PredictionCard
 * Props:
 *  - playerId (number|string)
 *  - stats (array)  -- array of stat objects as returned by backend (/players/:id/stats)
 *
 * Behavior:
 *  - On mount and whenever `stats` changes, call POST /predict with { player_id, stats }.
 *  - Show loading / error states and display injury + investment info.
 */

export default function PredictionCard({ playerId, stats, horizonDays }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Normalize stats to the shape backend expects.
  const normalizeStats = (rawStats) => {
    if (!Array.isArray(rawStats)) return [];
    return rawStats.map((s) => ({
      match_date: s.match_date || s.date || s.matchDate || null,
      minutes_played: Number(s.minutes_played ?? s.minutes ?? 0),
      goals: Number(s.goals ?? 0),
      assists: Number(s.assists ?? 0),
      touches: Number(s.touches ?? 0),
      tackles_won: Number(s.tackles_won ?? s.tackles ?? 0),
    }));
  };

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!playerId) return;
      const normalized = normalizeStats(stats);
      // require at least 1 stat to run prediction (your backend also accepts provided stats)
      if (!normalized.length) {
        setPrediction(null);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await runPrediction(Number(playerId), normalized, horizonDays);
        setPrediction(res.data);
      } catch (e) {
        console.error("Prediction fetch failed:", e);
        setError(
          e?.response?.data?.detail || "Failed to fetch predictions from server."
        );
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, JSON.stringify(stats), horizonDays]); // stringify stats to trigger effect when content changes

  function renderInjury() {
    if (!prediction?.injury_risk && prediction?.injury_probability == null) return <p>No injury data</p>;
    const prob = Number(prediction.injury_probability ?? 0);
    let label = prediction.injury_risk ?? "unknown";
    // Visual traffic-light by probability if risk text missing
    if (!prediction.injury_risk) {
      label = prob >= 0.66 ? "high" : prob >= 0.33 ? "medium" : "low";
    }
    const color = label === "high" ? "#e11d48" : label === "medium" ? "#f59e0b" : "#10b981";

    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: color,
            boxShadow: "0 0 6px rgba(0,0,0,0.1)"
          }} />
          <div>
            <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{label} risk</div>
            <div style={{ fontSize: 12, color: "#555" }}>
              Probability: {(prob * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        {prediction.injury_features && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}>
            <strong>Key features:</strong>{" "}
            {Object.entries(prediction.injury_features).slice(0,5).map(([k,v]) => `${k}:${typeof v === "number" ? v.toFixed ? (Number(v).toFixed(2)) : v : v}`).join(", ")}
          </div>
        )}
      </div>
    );
  }

  function renderInvestment() {
    if (!prediction?.investment_details && prediction?.investment_forecast == null) return <p>No investment data</p>;
    const inv = prediction.investment_details ?? {};
    const pct = Number(inv.predicted_pct_change ?? 0) * 100;
    const arrow = pct > 0 ? "📈" : pct < 0 ? "📉" : "➡";
    const color = pct > 0 ? "#059669" : pct < 0 ? "#ef4444" : "#6b7280";

    return (
      <div>
        <div style={{ fontWeight: 700 }}>{arrow} Investment forecast</div>
        <div style={{ fontSize: 12, color }}>
          {pct >= 0 ? "+" : ""}{pct.toFixed(1)}% ({prediction.investment_forecast ?? inv.method ?? "trend"})
        </div>
        {inv && inv.slope_per_day != null && (
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Slope/day: {Number(inv.slope_per_day).toFixed(4)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: 12,
      maxWidth: 760,
      background: "#fff"
    }}>
      <h4 style={{ marginTop: 0 }}>Predictions</h4>

      {loading && <p>Loading predictions...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && prediction && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>{renderInjury()}</div>
          <div>{renderInvestment()}</div>
        </div>
      )}

      {!loading && !error && !prediction && (
        <p style={{ color: "#444" }}>Add at least one recent stat for this player to see predictions.</p>
      )}
    </div>
  );
}
