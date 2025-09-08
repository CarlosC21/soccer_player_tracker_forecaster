import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlayer, getStats } from "../api/axios";
import PlayerStats from "./PlayerStats";
import PredictionCard from "./PredictionCard";

export default function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState([]);

  // Fetch player + stats
  useEffect(() => {
    const load = async () => {
      try {
        const { data: playerData } = await getPlayer(id);
        setPlayer(playerData);

        const { data: statsData } = await getStats(id);
        setStats(statsData || []);
      } catch (e) {
        console.error("Error loading player detail:", e);
      }
    };
    load();
  }, [id]);

  if (!player) return <p>Loading player...</p>;

  return (
    <div>
      <Link to="/">← Back to Players</Link>
      <h2>{player.name}</h2>
      <p>
        Age: {player.age} | Position: {player.position} | Team: {player.team} |{" "}
        Nationality: {player.nationality}
      </p>

      {/* Predictions */}
      <PredictionCard
        playerId={player.id}
        latestStats={stats.length > 0 ? stats[stats.length - 1] : null}
      />

      {/* Stats */}
      <PlayerStats playerId={player.id} onStatsChange={setStats} />
    </div>
  );
}
