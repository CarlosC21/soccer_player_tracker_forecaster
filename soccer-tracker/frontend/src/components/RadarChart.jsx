// src/components/RadarChart.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getRadarData } from "../api/axios";

export default function RadarChart({ playerId, refreshKey }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ useCallback so that loadData is memoized and doesn't trigger ESLint warning
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getRadarData(playerId);
      setData(data || []);
      setError("");
    } catch (e) {
      console.error("Failed loading radar data:", e);
      setError("Could not load scouting metrics");
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    if (playerId) loadData();
  }, [playerId, refreshKey, loadData]); // ✅ no more missing dependency warning

  if (loading) return <p>Loading scouting metrics...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data.length) return <p>No scouting metrics available.</p>;

  return (
    <div style={{ width: "100%", height: 420 }}>
      <h3 style={{ textAlign: "center", marginBottom: 12 }}>Scouting Metrics</h3>
      <ResponsiveContainer>
        <ReRadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis />
          <Tooltip formatter={(value) => Number(value).toFixed(1)} />
          <Legend />
          <Radar
            name="Player"
            dataKey="player"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Radar
            name="Team Avg"
            dataKey="team_avg"
            stroke="#f97316"
            fill="#fb923c"
            fillOpacity={0.4}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
