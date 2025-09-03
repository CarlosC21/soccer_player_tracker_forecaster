from pydantic import BaseModel
from datetime import date

# ----- Player -----
class PlayerBase(BaseModel):
    name: str
    age: int
    position: str
    nationality: str
    team: str

class PlayerCreate(PlayerBase):
    pass

class Player(PlayerBase):
    id: int

    class Config:
        orm_mode = True


# ----- Stat -----
class StatBase(BaseModel):
    match_date: date   # ✅ new field
    goals: int
    assists: int
    minutes_played: int
    touches: int
    tackles_won: int

class StatCreate(StatBase):
    pass

class Stat(StatBase):
    id: int
    player_id: int

    class Config:
        orm_mode = True
