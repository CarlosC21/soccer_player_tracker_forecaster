import React, { useEffect, useState } from "react";
import {
  getStats,
  createStat,
  updateStat,
  deleteStat,
  getPlayer,
} from "../api/axios";

export default function PlayerStats({ playerId }) {
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState([]);
  const [form, setForm] = useState({
    match_date: "",
    goals: "",
    assists: "",
    minutes_played: "",
    touches: "",
    tackles_won: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: playerData } = await getPlayer(playerId);
      setPlayer(playerData);

      const { data: statsData } = await getStats(playerId);
      setStats(statsData || []);
    };
    load();
  }, [playerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      goals: Number(form.goals) || 0,
      assists: Number(form.assists) || 0,
      minutes_played: Number(form.minutes_played) || 0,
      touches: Number(form.touches) || 0,
      tackles_won: Number(form.tackles_won) || 0,
    };

    if (editingId) {
      const { data } = await updateStat(playerId, editingId, payload);
      setStats((prev) => prev.map((s) => (s.id === editingId ? data : s)));
      setEditingId(null);
    } else {
      const { data } = await createStat(playerId, payload);
      setStats((prev) => [...prev, data]);
    }

    setForm({
      match_date: "",
      goals: "",
      assists: "",
      minutes_played: "",
      touches: "",
      tackles_won: "",
    });
  };

  const handleEdit = (stat) => {
    setEditingId(stat.id);
    setForm(stat);
  };

  const handleDelete = async (id) => {
    await deleteStat(playerId, id);
    setStats((prev) => prev.filter((s) => s.id !== id));
  };

  if (!player) return <p>Loading player...</p>;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>{player.name} - Stats</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={form.match_date}
          onChange={(e) => setForm({ ...form, match_date: e.target.value })}
        />
        <input
          type="number"
          placeholder="Goals"
          value={form.goals}
          onChange={(e) => setForm({ ...form, goals: e.target.value })}
        />
        <input
          type="number"
          placeholder="Assists"
          value={form.assists}
          onChange={(e) => setForm({ ...form, assists: e.target.value })}
        />
        <input
          type="number"
          placeholder="Minutes Played"
          value={form.minutes_played}
          onChange={(e) =>
            setForm({ ...form, minutes_played: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Touches"
          value={form.touches}
          onChange={(e) => setForm({ ...form, touches: e.target.value })}
        />
        <input
          type="number"
          placeholder="Tackles Won"
          value={form.tackles_won}
          onChange={(e) =>
            setForm({ ...form, tackles_won: e.target.value })
          }
        />
        <button type="submit">{editingId ? "Update Stat" : "Add Stat"}</button>
      </form>

      <ul>
        {stats.map((s) => (
          <li key={s.id}>
            {s.match_date} | Goals: {s.goals}, Assists: {s.assists}, Minutes:{" "}
            {s.minutes_played}, Touches: {s.touches}, Tackles: {s.tackles_won}
            <button onClick={() => handleEdit(s)} style={{ marginLeft: 8 }}>
              Edit
            </button>
            <button
              onClick={() => handleDelete(s.id)}
              style={{ marginLeft: 8, color: "red" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
