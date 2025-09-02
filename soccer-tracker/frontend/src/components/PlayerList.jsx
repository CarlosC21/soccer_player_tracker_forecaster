// src/components/PlayerList.jsx
import React from "react";

export default function PlayerList({ players, loading, error }) {
  if (loading) return <p>Loading players…</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name} ({p.age}) — {p.position} — {p.team}
          </li>
        ))}
      </ul>
    </div>
  );
}
