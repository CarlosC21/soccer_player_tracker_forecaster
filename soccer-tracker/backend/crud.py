from sqlalchemy.orm import Session
from . import models, schemas

# =========================
# Player CRUD
# =========================
def get_players(db: Session):
    return db.query(models.Player).all()

def get_player(db: Session, player_id: int):
    return db.query(models.Player).filter(models.Player.id == player_id).first()

def create_player(db: Session, player: schemas.PlayerCreate):
    db_player = models.Player(
        name=player.name,
        age=player.age,
        position=player.position,
        nationality=player.nationality,
        team=player.team,
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

def update_player(db: Session, db_player: models.Player, updated_player: schemas.PlayerCreate):
    """Update an existing player"""
    db_player.name = updated_player.name
    db_player.age = updated_player.age
    db_player.position = updated_player.position
    db_player.nationality = updated_player.nationality
    db_player.team = updated_player.team

    db.commit()
    db.refresh(db_player)
    return db_player

def delete_player(db: Session, player: models.Player):
    db.delete(player)
    db.commit()
    return {"message": f"Player with id {player.id} deleted successfully"}

# =========================
# Stat CRUD
# =========================
def get_stats_for_player(db: Session, player_id: int):
    return db.query(models.Stat).filter(models.Stat.player_id == player_id).all()

def get_stat(db: Session, stat_id: int):
    """Get a stat by ID"""
    return db.query(models.Stat).filter(models.Stat.id == stat_id).first()

def create_stat_for_player(db: Session, player_id: int, stat: schemas.StatCreate):
    db_stat = models.Stat(
        player_id=player_id,
        match_date=stat.match_date,
        goals=stat.goals,
        assists=stat.assists,
        minutes_played=stat.minutes_played,
        touches=stat.touches,
        tackles_won=stat.tackles_won,
    )
    db.add(db_stat)
    db.commit()
    db.refresh(db_stat)
    return db_stat

def delete_stat(db: Session, stat_id: int):
    """Delete a stat by ID"""
    db_stat = get_stat(db, stat_id)
    if db_stat:
        db.delete(db_stat)
        db.commit()
    return db_stat

def update_stat(db: Session, db_stat: models.Stat, updated_stat: schemas.StatCreate):
    """Update an existing stat"""
    db_stat.match_date = updated_stat.match_date
    db_stat.goals = updated_stat.goals
    db_stat.assists = updated_stat.assists
    db_stat.minutes_played = updated_stat.minutes_played
    db_stat.touches = updated_stat.touches
    db_stat.tackles_won = updated_stat.tackles_won

    db.commit()
    db.refresh(db_stat)
    return db_stat
