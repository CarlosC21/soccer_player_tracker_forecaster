from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from .database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    position = Column(String)
    nationality = Column(String)
    team = Column(String)

    stats = relationship("Stat", back_populates="player")


class Stat(Base):
    __tablename__ = "stats"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    match_date = Column(Date)   # ✅ NEW FIELD
    goals = Column(Integer)
    assists = Column(Integer)
    minutes_played = Column(Integer)
    touches = Column(Integer)
    tackles_won = Column(Integer)

    player = relationship("Player", back_populates="stats")
