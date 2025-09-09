// src/components/PerformanceChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PerformanceChart({ stats }) {
  if (!stats || stats.length === 0) {
    return <p style={{ marginTop: 16 }}>No stats yet for this player.</p>;
  }

  // Sort by match_date
  const data = [...stats].sort(
    (a, b) => new Date(a.match_date) - new Date(b.match_date)
  );

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Performance Trends</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="match_date" />
          
          {/* Y-Axis for minutes (0–120, continuous) */}
          <YAxis
            yAxisId="minutes"
            domain={[0, 120]}
            label={{
              value: "Minutes",
              angle: -90,
              position: "insideLeft",
            }}
          />
          
          {/* Y-Axis for goals (whole numbers only) */}
          <YAxis
            yAxisId="goals"
            allowDecimals={false}
            label={{
              value: "Goals",
              angle: -90,
              position: "insideRight",
            }}
            orientation="right"
          />

          <Tooltip />
          <Legend />

          {/* Line for minutes played */}
          <Line
            yAxisId="minutes"
            type="monotone"
            dataKey="minutes_played"
            stroke="#0ea5e9"
            name="Minutes Played"
            dot={true}
          />

          {/* Line for goals */}
          <Line
            yAxisId="goals"
            type="monotone"
            dataKey="goals"
            stroke="#f43f5e"
            name="Goals"
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
