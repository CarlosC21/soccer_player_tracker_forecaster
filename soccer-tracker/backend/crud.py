from sqlalchemy.orm import Session
from . import models, schemas

def get_players(db: Session):
    return db.query(models.Player).all()

def create_player(db: Session, player: schemas.PlayerCreate):
    db_player = models.Player(
        name=player.name,
        age=player.age,
        position=player.position,
        nationality=player.nationality,
        team=player.team
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player
