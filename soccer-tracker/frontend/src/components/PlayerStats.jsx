// frontend/src/components/PlayerStats.jsx
import { useState, useEffect } from "react";
import api from "../api";
import AddStat from "./AddStat";

function PlayerStats({ playerId }) {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchStats();
  }, [playerId]);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/players/${playerId}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleStatAdded = (newStat) => {
    setStats([...stats, newStat]);
  };

  return (
    <div>
      <h2>Player Stats</h2>
      <AddStat playerId={playerId} onStatAdded={handleStatAdded} />
      <ul>
        {stats.map((s) => (
          <li key={s.id}>
            {s.match_date} - {s.goals} goals, {s.assists} assists,{" "}
            {s.minutes_played} minutes, {s.touches} touches,{" "}
            {s.tackles_won} tackles won
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerStats;
