// src/components/AppPlayer.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import AddPlayer from "./AddPlayer";
import PlayerList from "./PlayerList";

export default function AppPlayer() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/players");
      setPlayers(data || []);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Failed to fetch players.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAdd = async (formValues) => {
    try {
      const payload = { ...formValues, age: Number(formValues.age) || 0 };
      const { data } = await api.post("/players", payload);
      setPlayers((prev) => [...prev, data]);
    } catch (e) {
      console.error(e);
      setError("Failed to add player.");
    }
  };

  return (
    <div>
      <h1>Soccer Player Tracker</h1>
      <AddPlayer onAdd={handleAdd} />
      <PlayerList players={players} loading={loading} error={error} />
    </div>
  );
}
