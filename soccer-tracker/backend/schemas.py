from pydantic import BaseModel

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
