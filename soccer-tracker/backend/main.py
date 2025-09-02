from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, crud, database

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

@app.get("/")
def root():
    return {"message": "Soccer Tracker API is running!"}

@app.get("/players", response_model=list[schemas.Player])
def read_players(db: Session = Depends(get_db)):
    return crud.get_players(db)

@app.post("/players", response_model=schemas.Player)
def create_new_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    return crud.create_player(db, player)
