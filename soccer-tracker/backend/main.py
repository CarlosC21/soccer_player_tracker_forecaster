# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd

# app modules
from . import models, schemas, crud, database

# Import ML helpers (relative import)
from .ml.predict import (
    predict_injury_from_stats_df,
    predict_investment_from_stats_df,
    predict_injury,
    predict_investment,
)

# Create DB tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Soccer Tracker API")

# CORS - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency: DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------------------
# Health
# ------------------------------
@app.get("/")
def root():
    return {"message": "Soccer Player Tracker API is running!"}

# ------------------------------
# Player endpoints (CRUD)
# ------------------------------
@app.get("/players", response_model=List[schemas.Player])
def read_players(db: Session = Depends(get_db)):
    return crud.get_players(db)

@app.post("/players", response_model=schemas.Player)
def create_new_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    return crud.create_player(db, player)

@app.get("/players/{player_id}", response_model=schemas.Player)
def read_player(player_id: int, db: Session = Depends(get_db)):
    db_player = crud.get_player(db, player_id)
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    return db_player

@app.put("/players/{player_id}", response_model=schemas.Player)
def update_player(player_id: int, updated_player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    db_player = crud.get_player(db, player_id)
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    return crud.update_player(db, db_player, updated_player)

@app.delete("/players/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db)):
    db_player = crud.get_player(db, player_id=player_id)
    if db_player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return crud.delete_player(db, db_player)

# ------------------------------
# Stat endpoints (per-player)
# ------------------------------
@app.get("/players/{player_id}/stats", response_model=List[schemas.Stat])
def read_player_stats(player_id: int, db: Session = Depends(get_db)):
    if not crud.get_player(db, player_id):
        raise HTTPException(status_code=404, detail="Player not found")
    return crud.get_stats_for_player(db, player_id)

@app.post("/players/{player_id}/stats", response_model=schemas.Stat)
def create_player_stat(player_id: int, stat: schemas.StatCreate, db: Session = Depends(get_db)):
    if not crud.get_player(db, player_id):
        raise HTTPException(status_code=404, detail="Player not found")
    return crud.create_stat_for_player(db, player_id, stat)

@app.get("/players/{player_id}/stats/{stat_id}", response_model=schemas.Stat)
def read_single_stat(player_id: int, stat_id: int, db: Session = Depends(get_db)):
    db_stat = crud.get_stat(db, stat_id)
    if not db_stat or db_stat.player_id != player_id:
        raise HTTPException(status_code=404, detail="Stat not found for this player")
    return db_stat

@app.put("/players/{player_id}/stats/{stat_id}", response_model=schemas.Stat)
def update_player_stat(player_id: int, stat_id: int, updated_stat: schemas.StatCreate, db: Session = Depends(get_db)):
    db_stat = crud.get_stat(db, stat_id)
    if not db_stat or db_stat.player_id != player_id:
        raise HTTPException(status_code=404, detail="Stat not found for this player")
    return crud.update_stat(db, db_stat, updated_stat)

@app.delete("/players/{player_id}/stats/{stat_id}")
def delete_player_stat(player_id: int, stat_id: int, db: Session = Depends(get_db)):
    db_stat = crud.get_stat(db, stat_id)
    if not db_stat or db_stat.player_id != player_id:
        raise HTTPException(status_code=404, detail="Stat not found for this player")
    crud.delete_stat(db, stat_id)
    return {"message": f"Stat {stat_id} deleted successfully"}

# ------------------------------
# Radar Chart endpoint
# ------------------------------
@app.get("/players/{player_id}/radar")
def get_radar_data(player_id: int, db: Session = Depends(get_db)):
    """
    Returns radar chart data: player averages vs. team averages
    across key scouting metrics in array format for frontend.
    """
    player = crud.get_player(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Get player's stats
    player_stats = crud.get_stats_for_player(db, player_id)
    if not player_stats:
        raise HTTPException(status_code=404, detail="No stats for this player")

    def avg(values):
        return sum(values) / len(values) if values else 0

    player_avg = {
        "goals": avg([s.goals for s in player_stats]),
        "assists": avg([s.assists for s in player_stats]),
        "touches": avg([s.touches for s in player_stats]),
        "tackles_won": avg([s.tackles_won for s in player_stats]),
    }

    # Team averages
    team_players = db.query(models.Player).filter(models.Player.team == player.team).all()
    team_ids = [p.id for p in team_players]
    team_stats = db.query(models.Stat).filter(models.Stat.player_id.in_(team_ids)).all()

    team_avg = {
        "goals": avg([s.goals for s in team_stats]),
        "assists": avg([s.assists for s in team_stats]),
        "touches": avg([s.touches for s in team_stats]),
        "tackles_won": avg([s.tackles_won for s in team_stats]),
    }

    # ✅ Transform into frontend-friendly array
    radar_data = [
        {"metric": "Goals", "player": player_avg["goals"], "team_avg": team_avg["goals"]},
        {"metric": "Assists", "player": player_avg["assists"], "team_avg": team_avg["assists"]},
        {"metric": "Touches", "player": player_avg["touches"], "team_avg": team_avg["touches"]},
        {"metric": "Tackles Won", "player": player_avg["tackles_won"], "team_avg": team_avg["tackles_won"]},
    ]

    return radar_data

# ------------------------------
# ML Prediction endpoints
# ------------------------------
class StatIn(BaseModel):
    match_date: str
    minutes_played: Optional[int] = 0
    goals: Optional[int] = 0
    assists: Optional[int] = 0
    touches: Optional[int] = 0
    tackles_won: Optional[int] = 0

class PredictRequest(BaseModel):
    player_id: int
    stats: List[StatIn]

@app.post("/predict")
def run_prediction(req: PredictRequest):
    """
    Runs both injury risk + investment forecast based on given stats (payload).
    This endpoint doesn't require the player to exist in DB - it uses the provided stats list.
    """
    try:
        stats_df = pd.DataFrame([s.dict() for s in req.stats])
        if stats_df.empty:
            raise HTTPException(status_code=400, detail="No stats provided")

        injury_prob, injury_feats = predict_injury_from_stats_df(stats_df)
        if injury_prob > 0.7:
            injury_risk = "high"
        elif injury_prob > 0.4:
            injury_risk = "medium"
        else:
            injury_risk = "low"

        inv = predict_investment_from_stats_df(stats_df)
        inv_forecast = "rise" if inv.get("predicted_pct_change", 0) >= 0 else "fall"

        return {
            "injury_risk": injury_risk,
            "injury_probability": float(injury_prob),
            "injury_features": injury_feats,
            "investment_forecast": inv_forecast,
            "investment_details": inv,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

@app.post("/predict/injury/{player_id}")
def predict_injury_for_player(player_id: int, db: Session = Depends(get_db)):
    """
    Run injury prediction for a player using stats stored in DB.
    """
    # get stats from DB
    stats = crud.get_stats_for_player(db, player_id)
    if not stats:
        raise HTTPException(status_code=404, detail="No stats found for this player")
    # convert stats (ORM objects) to dataframe
    rows = []
    for s in stats:
        rows.append({
            "match_date": getattr(s, "match_date", None),
            "minutes_played": getattr(s, "minutes_played", None),
            "goals": getattr(s, "goals", None),
            "assists": getattr(s, "assists", None),
            "touches": getattr(s, "touches", None),
            "tackles_won": getattr(s, "tackles_won", None),
        })
    stats_df = pd.DataFrame(rows)
    prob, feats = predict_injury_from_stats_df(stats_df)
    risk = "low" if prob < 0.33 else "medium" if prob < 0.66 else "high"
    return {"player_id": player_id, "probability": float(prob), "risk": risk, "features": feats}

@app.post("/predict/investment/{player_id}")
def predict_investment_for_player(player_id: int, db: Session = Depends(get_db), horizon_days: int = 180):
    """
    Run investment forecast for a player using stats stored in DB.
    """
    stats = crud.get_stats_for_player(db, player_id)
    if not stats:
        raise HTTPException(status_code=404, detail="No stats found for this player")
    rows = []
    for s in stats:
        rows.append({
            "match_date": getattr(s, "match_date", None),
            "minutes_played": getattr(s, "minutes_played", None),
            "goals": getattr(s, "goals", None),
            "assists": getattr(s, "assists", None),
            "touches": getattr(s, "touches", None),
            "tackles_won": getattr(s, "tackles_won", None),
        })
    stats_df = pd.DataFrame(rows)
    result = predict_investment_from_stats_df(stats_df, horizon_days=horizon_days)
    return {"player_id": player_id, "horizon_days": horizon_days, **result}
