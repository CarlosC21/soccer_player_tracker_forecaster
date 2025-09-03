// frontend/src/components/AddStat.jsx
import { useState } from "react";
import api from "../api";

function AddStat({ playerId, onStatAdded }) {
  const [form, setForm] = useState({
    match_date: "",
    goals: "",
    assists: "",
    minutes_played: "",
    touches: "",
    tackles_won: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/players/${playerId}/stats`, form);
      onStatAdded(res.data);
      setForm({
        match_date: "",
        goals: "",
        assists: "",
        minutes_played: "",
        touches: "",
        tackles_won: "",
      });
    } catch (err) {
      console.error("Error adding stat:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        name="match_date"
        value={form.match_date}
        onChange={handleChange}
      />
      <input
        name="goals"
        placeholder="Goals"
        value={form.goals}
        onChange={handleChange}
      />
      <input
        name="assists"
        placeholder="Assists"
        value={form.assists}
        onChange={handleChange}
      />
      <input
        name="minutes_played"
        placeholder="Minutes Played"
        value={form.minutes_played}
        onChange={handleChange}
      />
      <input
        name="touches"
        placeholder="Touches"
        value={form.touches}
        onChange={handleChange}
      />
      <input
        name="tackles_won"
        placeholder="Tackles Won"
        value={form.tackles_won}
        onChange={handleChange}
      />
      <button type="submit">Add Stat</button>
    </form>
  );
}

export default AddStat;
