// src/components/InsightsDashboard.jsx
import React, { useEffect, useState } from "react";
import { getTopUndervalued, compareInjuryToTeam } from "../api/axios";

export default function InsightsDashboard({ selectedPlayerId }) {
  const [undervalued, setUndervalued] = useState([]); // always array
  const [injuryComparison, setInjuryComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      setError("");
      try {
        const undervaluedRes = await getTopUndervalued(23, 5); // default: U23 top 5
        // ✅ ensure data is array
        setUndervalued(Array.isArray(undervaluedRes.data) ? undervaluedRes.data : []);

        if (selectedPlayerId) {
          const injuryRes = await compareInjuryToTeam(selectedPlayerId);
          // ✅ ensure object with numeric properties
          const data = injuryRes.data || {};
          setInjuryComparison({
            player_risk: Number(data.player_risk ?? 0),
            team_avg: Number(data.team_avg ?? 0),
          });
        } else {
          setInjuryComparison(null);
        }
      } catch (err) {
        console.error("Failed to fetch insights:", err);
        setError("Failed to fetch insights.");
        setUndervalued([]);
        setInjuryComparison(null);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [selectedPlayerId]);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
        background: "#fff",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Insights</h3>

      {loading && <p>Loading insights...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Top undervalued players */}
          <div style={{ marginBottom: 20 }}>
            <h4>Top U23 Undervalued Players</h4>
            {undervalued.length === 0 ? (
              <p>No data available.</p>
            ) : (
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={{ padding: 6, border: "1px solid #ddd" }}>Name</th>
                    <th style={{ padding: 6, border: "1px solid #ddd" }}>Age</th>
                    <th style={{ padding: 6, border: "1px solid #ddd" }}>Undervalue Score</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(undervalued) &&
                    undervalued.map((p) => (
                      <tr key={p.id}>
                        <td style={{ padding: 6, border: "1px solid #ddd" }}>{p.name}</td>
                        <td style={{ padding: 6, border: "1px solid #ddd" }}>{p.age}</td>
                        <td style={{ padding: 6, border: "1px solid #ddd" }}>
                          {p.undervalue_score != null ? p.undervalue_score.toFixed(2) : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Injury comparison */}
          {injuryComparison && (
            <div>
              <h4>Injury Risk Comparison</h4>
              <p>
                Player risk:{" "}
                <strong>{(injuryComparison.player_risk * 100).toFixed(1)}%</strong>
              </p>
              <p>
                Team avg risk:{" "}
                <strong>{(injuryComparison.team_avg * 100).toFixed(1)}%</strong>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
