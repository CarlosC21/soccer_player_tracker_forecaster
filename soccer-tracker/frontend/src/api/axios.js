// src/api/axios.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // change if your backend is elsewhere

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
  axios.get(`${API_URL}/players/${playerId}/stats`);
export const createStat = (playerId, stat) =>
  axios.post(`${API_URL}/players/${playerId}/stats`, stat);
export const updateStat = (playerId, statId, stat) =>
  axios.put(`${API_URL}/players/${playerId}/stats/${statId}`, stat);
export const deleteStat = (playerId, statId) =>
  axios.delete(`${API_URL}/players/${playerId}/stats/${statId}`);

// =========================
// Radar
// =========================
export const getRadarData = (playerId) =>
  axios.get(`${API_URL}/players/${playerId}/radar`);

// =========================
// Predictions
// - Primary method: POST /predict (send stats array + optional horizon_days)
// - Convenience wrappers for player-specific endpoints also provided
// =========================
export const runPrediction = (playerId, stats, horizon_days = undefined) => {
  const payload = { player_id: playerId, stats: stats || [] };
  if (typeof horizon_days === "number") payload.horizon_days = horizon_days;
  return axios.post(`${API_URL}/predict`, payload);
};

export const getInjuryPredictionByPlayer = (playerId) =>
  axios.post(`${API_URL}/predict/injury/${playerId}`);

export const getInvestmentPredictionByPlayer = (playerId, horizon_days = 180) =>
  axios.post(`${API_URL}/predict/investment/${playerId}`, null, {
    params: { horizon_days },
  });

// =========================
// Insights
// =========================
export const getTopUndervalued = (maxAge = 21, topN = 5) =>
  axios.get(`${API_URL}/insights/top_undervalued`, {
    params: { max_age: maxAge, top_n: topN },
  });

export const compareInjuryToTeam = (playerId) =>
  axios.get(`${API_URL}/insights/injury_compare/${playerId}`);

// =========================
// Helper: generic axios instance (optional)
// =========================
export const apiInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
