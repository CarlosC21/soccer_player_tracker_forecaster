import { useEffect, useState } from "react";
import api from "../api";
import PlayerStats from "./PlayerStats";

function PlayerList() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await api.get("/players");
    setPlayers(res.data);
  };

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            <button onClick={() => setSelectedPlayer(p.id)}>
              {p.name} ({p.position})
            </button>
          </li>
        ))}
      </ul>

      {selectedPlayer && <PlayerStats playerId={selectedPlayer} />}
    </div>
  );
}

export default PlayerList;
