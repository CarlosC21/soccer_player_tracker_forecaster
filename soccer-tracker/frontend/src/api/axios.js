import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // FastAPI backend

// =========================
// Players
// =========================
export const getPlayers = () => axios.get(`${API_URL}/players/`);
export const getPlayer = (id) => axios.get(`${API_URL}/players/${id}`);
export const createPlayer = (player) =>
  axios.post(`${API_URL}/players/`, player);
export const updatePlayer = (id, player) =>
  axios.put(`${API_URL}/players/${id}`, player);
export const deletePlayer = (id) => axios.delete(`${API_URL}/players/${id}`);

// =========================
// Stats
// =========================
export const getStats = (playerId) =>
  axios.get(`${API_URL}/players/${playerId}/stats/`);
export const createStat = (playerId, stat) =>
  axios.post(`${API_URL}/players/${playerId}/stats/`, stat);
export const updateStat = (playerId, statId, stat) =>
  axios.put(`${API_URL}/players/${playerId}/stats/${statId}`, stat);
export const deleteStat = (playerId, statId) =>
  axios.delete(`${API_URL}/players/${playerId}/stats/${statId}`);

// =========================
// Predictions (ML Endpoints)
// =========================
export const getInjuryPrediction = (playerId) =>
  axios.get(`${API_URL}/predict/injury/${playerId}`);

export const getInvestmentPrediction = (playerId) =>
  axios.get(`${API_URL}/predict/investment/${playerId}`);
