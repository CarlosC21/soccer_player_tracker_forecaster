// frontend/src/api/predict.js
const API_BASE = "http://localhost:8000";

// Run prediction with custom stats payload (doesn't need DB player)
export async function runPrediction(payload) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Prediction failed: ${res.statusText}`);
  return res.json();
}

// Run injury prediction for a player stored in DB
export async function predictInjury(playerId) {
  const res = await fetch(`${API_BASE}/predict/injury/${playerId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Injury prediction failed: ${res.statusText}`);
  return res.json();
}

// Run investment prediction for a player stored in DB
export async function predictInvestment(playerId, horizonDays = 180) {
  const res = await fetch(
    `${API_BASE}/predict/investment/${playerId}?horizon_days=${horizonDays}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`Investment prediction failed: ${res.statusText}`);
  return res.json();
}
