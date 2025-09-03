from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, crud, database

# Create DB tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# ✅ Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],  # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # allow all headers
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Root health check
@app.get("/")
def root():
    return {"message": "Soccer Tracker API is running!"}

# =========================
# Player Endpoints
# =========================
@app.get("/players", response_model=list[schemas.Player])
def read_players(db: Session = Depends(get_db)):
    """Get all players"""
    return crud.get_players(db)

@app.post("/players", response_model=schemas.Player)
def create_new_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    """Add a new player"""
    return crud.create_player(db, player)

@app.get("/players/{player_id}", response_model=schemas.Player)
def read_player(player_id: int, db: Session = Depends(get_db)):
    """Get one player by ID"""
    db_player = crud.get_player(db, player_id)
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    return db_player

@app.get("/players/{player_id}/stats/{stat_id}", response_model=schemas.Stat)
def read_single_stat(player_id: int, stat_id: int, db: Session = Depends(get_db)):
    """Get a single stat for a player"""
    db_stat = crud.get_stat(db, stat_id)
    if not db_stat or db_stat.player_id != player_id:
        raise HTTPException(status_code=404, detail="Stat not found for this player")
    return db_stat

# =========================
# Stat Endpoints
# =========================
@app.get("/players/{player_id}/stats", response_model=list[schemas.Stat])
def read_player_stats(player_id: int, db: Session = Depends(get_db)):
    """Get all stats for a given player"""
    if not crud.get_player(db, player_id):
        raise HTTPException(status_code=404, detail="Player not found")
    return crud.get_stats_for_player(db, player_id)

@app.post("/players/{player_id}/stats", response_model=schemas.Stat)
def create_player_stat(player_id: int, stat: schemas.StatCreate, db: Session = Depends(get_db)):
    """Add a new stat entry for a given player"""
    if not crud.get_player(db, player_id):
        raise HTTPException(status_code=404, detail="Player not found")
    return crud.create_stat_for_player(db, player_id, stat)

# =========================
# Player Endpoints
# =========================

@app.put("/players/{player_id}", response_model=schemas.Player)
def update_player(player_id: int, updated_player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    """Update an existing player"""
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

# =========================
# Stat Endpoints
# =========================

@app.put("/players/{player_id}/stats/{stat_id}", response_model=schemas.Stat)
def update_player_stat(player_id: int, stat_id: int, updated_stat: schemas.StatCreate, db: Session = Depends(get_db)):
    """Update an existing stat for a player"""
    db_stat = crud.get_stat(db, stat_id)
    if not db_stat or db_stat.player_id != player_id:
        raise HTTPException(status_code=404, detail="Stat not found for this player")

    return crud.update_stat(db, db_stat, updated_stat)

@app.delete("/players/{player_id}/stats/{stat_id}")
def delete_player_stat(player_id: int, stat_id: int, db: Session = Depends(get_db)):
    """Delete a specific stat for a given player"""
    db_stat = crud.get_stat(db, stat_id)
    if not db_stat or db_stat.player_id != player_id:
        raise HTTPException(status_code=404, detail="Stat not found for this player")
    crud.delete_stat(db, stat_id)
    return {"message": f"Stat {stat_id} deleted successfully"}

@app.put("/players/{player_id}/stats/{stat_id}", response_model=schemas.Stat)
def update_player_stat(player_id: int, stat_id: int, updated_stat: schemas.StatCreate, db: Session = Depends(get_db)):
    db_stat = crud.get_stat(db, stat_id)
    if not db_stat or db_stat.player_id != player_id:
        raise HTTPException(status_code=404, detail="Stat not found for this player")
    return crud.update_stat(db, db_stat, updated_stat)
