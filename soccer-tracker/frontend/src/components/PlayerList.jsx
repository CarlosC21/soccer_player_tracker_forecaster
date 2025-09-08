// src/components/PlayerList.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function PlayerList({ players, loading, error, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    position: "",
    nationality: "",
    team: "",
  });

  if (loading) return <p>Loading players...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!players.length) return <p>No players yet, but add one!</p>;

  const handleEditClick = (player) => {
    setEditingId(player.id);
    setForm({
      name: player.name,
      age: player.age,
      position: player.position,
      nationality: player.nationality,
      team: player.team,
    });
  };

  const handleSave = (id) => {
    onUpdate(id, form);
    setEditingId(null);
    setForm({ name: "", age: "", position: "", nationality: "", team: "" });
  };

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id} style={{ marginBottom: "8px" }}>
            {editingId === p.id ? (
              <>
                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  placeholder="Age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
                <input
                  placeholder="Position"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
                <input
                  placeholder="Nationality"
                  value={form.nationality}
                  onChange={(e) =>
                    setForm({ ...form, nationality: e.target.value })
                  }
                />
                <input
                  placeholder="Team"
                  value={form.team}
                  onChange={(e) => setForm({ ...form, team: e.target.value })}
                />
                <button onClick={() => handleSave(p.id)} style={{ marginLeft: 8 }}>
                  Save
                </button>
                <button onClick={() => setEditingId(null)} style={{ marginLeft: 8 }}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <Link to={`/players/${p.id}`} style={{ textDecoration: "none" }}>
                  <button>
                    {p.name} ({p.position}) - {p.team}
                  </button>
                </Link>
                <button
                  onClick={() => handleEditClick(p)}
                  style={{ marginLeft: 8 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  style={{ marginLeft: 8, color: "red" }}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
