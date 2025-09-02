// src/components/AddPlayer.jsx
import React, { useState } from "react";

export default function AddPlayer({ onAdd }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    position: "",
    nationality: "",
    team: "",
  });

  const submit = async (e) => {
    e.preventDefault();
    await onAdd(form);
    setForm({ name: "", age: "", position: "", nationality: "", team: "" });
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 16 }}>
      <input placeholder="Name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Age" value={form.age}
        onChange={(e) => setForm({ ...form, age: e.target.value })} />
      <input placeholder="Position" value={form.position}
        onChange={(e) => setForm({ ...form, position: e.target.value })} />
      <input placeholder="Nationality" value={form.nationality}
        onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
      <input placeholder="Team" value={form.team}
        onChange={(e) => setForm({ ...form, team: e.target.value })} />
      <button type="submit">Add Player</button>
    </form>
  );
}
