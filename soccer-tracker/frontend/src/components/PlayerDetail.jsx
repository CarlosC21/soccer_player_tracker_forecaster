// src/components/PlayerDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlayer, getStats } from "../api/axios";
import PlayerStats from "./PlayerStats";
import PredictionCard from "./PredictionCard";
import PerformanceChart from "./PerformanceChart";
import PlayerRadarChart from "./RadarChart";

export default function PlayerDetail() {
  const { id } = useParams(); // route: /players/:id
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // ✅ for radar auto-refresh

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: playerData }, { data: statsData }] = await Promise.all([
        getPlayer(id),
        getStats(id),
      ]);
      setPlayer(playerData);
      setStats(statsData || []);
      setError("");
    } catch (e) {
      console.error("Failed loading player detail:", e);
      setError("Failed to load player or stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Called by PlayerStats when stats change (add/edit/delete)
  const handleStatsChange = (newStats) => {
    setStats(newStats || []);
    setRefreshKey((k) => k + 1); // 🚀 trigger radar refresh
  };

  if (loading) return <p>Loading player...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!player) return <p>Player not found</p>;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      {/* Header with player info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{player.name}</h2>
          <div style={{ color: "#555" }}>
            Age: {player.age} • {player.position} • {player.team} •{" "}
            {player.nationality}
          </div>
        </div>
        <div>
          <Link to="/" style={{ textDecoration: "none", color: "#0ea5e9" }}>
            ← Back
          </Link>
        </div>
      </div>

      {/* Main layout: stats + predictions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 16,
          marginTop: 20,
        }}
      >
        <div>
          {/* Player stats table + editor */}
          <PlayerStats playerId={id} onStatsChange={handleStatsChange} />

          {/* Performance trend chart */}
          <PerformanceChart stats={stats} />
        </div>

        <aside>
          <PredictionCard playerId={id} stats={stats} />
          <div style={{ marginTop: 20 }}>
            {/* ✅ Radar chart refreshes automatically when stats change */}
            <PlayerRadarChart playerId={id} refreshKey={refreshKey} />
          </div>
        </aside>
      </div>
    </div>
  );
}
