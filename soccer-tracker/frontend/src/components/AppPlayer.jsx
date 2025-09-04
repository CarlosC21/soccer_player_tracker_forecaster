// src/components/AppPlayer.jsx
import React, { useEffect, useState } from "react";
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from "../api/axios";
import AddPlayer from "./AddPlayer";
import PlayerList from "./PlayerList";

export default function AppPlayer() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data } = await getPlayers();
      setPlayers(data || []);
      setError("");
    } catch (e) {
      console.error("Fetch players error:", e);
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
      // ✅ ensure `age` is a number, default 0
      const payload = {
        ...formValues,
        age: formValues.age ? Number(formValues.age) : 0,
      };

      const { data } = await createPlayer(payload);
      setPlayers((prev) => [...prev, data]);
    } catch (e) {
      console.error("Add player error:", e);
      setError("Failed to add player.");
    }
  };

  const handleUpdate = async (id, formValues) => {
    try {
      const payload = {
        ...formValues,
        age: formValues.age ? Number(formValues.age) : 0,
      };
      const { data } = await updatePlayer(id, payload);
      setPlayers((prev) => prev.map((p) => (p.id === id ? data : p)));
    } catch (e) {
      console.error("Update player error:", e);
      setError("Failed to update player.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePlayer(id);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Delete player error:", e);
      setError("Failed to delete player.");
    }
  };

  return (
    <div>
      <h1>Soccer Player Tracker</h1>
      <AddPlayer onAdd={handleAdd} />
      <PlayerList
        players={players}
        loading={loading}
        error={error}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
