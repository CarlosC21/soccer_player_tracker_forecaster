// src/components/EditPlayer.jsx
import React, { useState, useEffect } from "react";

export default function EditPlayer({ player, onUpdate, onCancel }) {
  const [form, setForm] = useState(player);

  useEffect(() => {
    setForm(player);
  }, [player]);

  const submit = async (e) => {
    e.preventDefault();
    await onUpdate(player.id, form);
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 16 }}>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Age"
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
        onChange={(e) => setForm({ ...form, nationality: e.target.value })}
      />
      <input
        placeholder="Team"
        value={form.team}
        onChange={(e) => setForm({ ...form, team: e.target.value })}
      />
      <button type="submit">Update Player</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>
        Cancel
      </button>
    </form>
  );
}
