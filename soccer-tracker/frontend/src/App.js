import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    position: "",
    nationality: "",
    team: "",
  });

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/players").then((res) => {
      setPlayers(res.data);
    });
  }, []);

  const addPlayer = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/players", form).then((res) => {
      setPlayers([...players, res.data]);
      setForm({ name: "", age: "", position: "", nationality: "", team: "" });
    });
  };

  return (
    <div>
      <h1>Soccer Player Tracker</h1>
      <form onSubmit={addPlayer}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
        <input placeholder="Age" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} />
        <input placeholder="Position" value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} />
        <input placeholder="Nationality" value={form.nationality} onChange={(e) => setForm({...form, nationality: e.target.value})} />
        <input placeholder="Team" value={form.team} onChange={(e) => setForm({...form, team: e.target.value})} />
        <button type="submit">Add Player</button>
      </form>

      <h2>Players</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.name} ({p.age}) - {p.position} - {p.team}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
