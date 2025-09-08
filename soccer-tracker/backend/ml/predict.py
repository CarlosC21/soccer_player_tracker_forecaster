# backend/ml/predict.py
"""
Prediction helpers for Soccer Player Tracker.

- compute_rolling_features(stats_df): builds rolling features from per-game stats
- predict_injury_from_stats_df(stats_df, injuries_df=None): returns (probability 0..1, features)
- predict_investment_from_stats_df(stats_df, market_df=None, horizon_days=180): returns dict
- predict_injury(player_id, db): DB wrapper → probability
- predict_investment(player_id, db): DB wrapper → dict

Uses only numpy + pandas for now. Replace with real ML models later.
"""

import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from .. import crud


def _safe_to_datetime(df, col):
    if col in df.columns:
        return pd.to_datetime(df[col])
    return None


def _slope(values):
    """Return slope (first-degree) of the sequence using np.polyfit. Returns 0.0 if not enough points."""
    if values is None or len(values) < 2:
        return 0.0
    x = np.arange(len(values))
    try:
        m = np.polyfit(x, values, 1)[0]
    except Exception:
        m = 0.0
    return float(m)


def compute_rolling_features(stats_df: pd.DataFrame):
    """
    stats_df expected columns (at least some of): match_date, minutes_played, goals, assists, touches, tackles_won
    Returns a dict of simple rolling features computed relative to the last match_date in the df.
    """
    features = {
        "minutes_sum_7": 0,
        "minutes_avg_28": 0.0,
        "goals_per90_28": 0.0,
        "matches_14": 0,
        "acwr": 0.0,  # acute / chronic workload ratio (minutes)
        "minutes_slope": 0.0,
    }

    if stats_df is None or stats_df.empty:
        return features

    df = stats_df.copy()
    if "match_date" not in df.columns:
        # try to coerce a column named "date"
        if "date" in df.columns:
            df = df.rename(columns={"date": "match_date"})
        else:
            return features

    df["match_date"] = pd.to_datetime(df["match_date"])
    df = df.sort_values("match_date")

    last_date = df["match_date"].max()
    window_7 = df[df["match_date"] >= last_date - pd.Timedelta(days=7)]
    window_28 = df[df["match_date"] >= last_date - pd.Timedelta(days=28)]

    # minutes
    if "minutes_played" in df.columns:
        features["minutes_sum_7"] = int(window_7["minutes_played"].sum())
        features["minutes_avg_28"] = float(window_28["minutes_played"].mean()) if not window_28.empty else 0.0
    # goals per90 over last 28 days
    total_min_28 = int(window_28["minutes_played"].sum()) if "minutes_played" in df.columns else 0
    total_goals_28 = int(window_28["goals"].sum()) if "goals" in df.columns else 0
    if total_min_28 > 0:
        features["goals_per90_28"] = float(total_goals_28 / total_min_28 * 90.0)
    else:
        features["goals_per90_28"] = 0.0

    features["matches_14"] = int(df[df["match_date"] >= last_date - pd.Timedelta(days=14)].shape[0])

    # ACWR: acute (7-day minutes) / chronic (28-day average)
    chronic = features["minutes_avg_28"] if features["minutes_avg_28"] > 0 else 1e-6
    features["acwr"] = float(features["minutes_sum_7"] / chronic)

    # slope of minutes across last up to 8 matches
    last_n = df.tail(8)
    if "minutes_played" in last_n.columns and len(last_n) > 1:
        features["minutes_slope"] = float(_slope(last_n["minutes_played"].values))
    else:
        features["minutes_slope"] = 0.0

    return features


def predict_injury_from_stats_df(stats_df: pd.DataFrame, injuries_df: pd.DataFrame = None):
    """
    Return (probability, features). Probability is a heuristic logistic of ACWR / slope / match density +
    small bump for recent injuries. Good for demo; replace with model later.
    """
    feats = compute_rolling_features(stats_df)
    recent_injuries = 0
    if injuries_df is not None and not injuries_df.empty:
        injuries_df = injuries_df.copy()
        if "start_date" in injuries_df.columns:
            injuries_df["start_date"] = pd.to_datetime(injuries_df["start_date"])
            last_date = stats_df["match_date"].max() if "match_date" in stats_df.columns else pd.to_datetime("today")
            recent_injuries = int(injuries_df[injuries_df["start_date"] >= last_date - pd.Timedelta(days=365)].shape[0])
    feats["injuries_365"] = recent_injuries

    # Heuristic scoring: tune the coefficients later
    acwr = feats.get("acwr", 1.0)
    slope = feats.get("minutes_slope", 0.0)
    matches_14 = feats.get("matches_14", 0)

    raw = -0.4 * (1.0 - acwr) + 0.08 * matches_14 + 0.05 * slope
    # convert to probability via logistic
    prob = 1.0 / (1.0 + np.exp(-raw))
    # give small extra bump per prior injury
    prob = float(np.clip(prob + 0.05 * recent_injuries, 0.0, 1.0))

    return prob, feats


def predict_investment_from_stats_df(stats_df: pd.DataFrame, market_df: pd.DataFrame = None, horizon_days: int = 180):
    """
    Return a dict with a predicted_pct_change and additional debug info.
    If market_df exists and has 'market_value' (and date), use linear extrapolation on market value.
    Otherwise fall back to a simple performance trend heuristic based on goals slope.
    """
    feats = compute_rolling_features(stats_df)

    # Use market values if available
    if market_df is not None and not market_df.empty and "market_value" in market_df.columns:
        mdf = market_df.copy()
        if "date" in mdf.columns:
            mdf["date"] = pd.to_datetime(mdf["date"])
        elif "match_date" in mdf.columns:
            mdf = mdf.rename(columns={"match_date": "date"})
            mdf["date"] = pd.to_datetime(mdf["date"])
        else:
            mdf["date"] = pd.to_datetime(mdf.index)

        mdf = mdf.sort_values("date")
        if len(mdf) > 1:
            x = (mdf["date"] - mdf["date"].min()).dt.days.values.astype(float)
            y = mdf["market_value"].values.astype(float)
            # linear fit y ~ x
            try:
                slope_val = float(np.polyfit(x, y, 1)[0])  # value per day
            except Exception:
                slope_val = 0.0
            last_val = float(y[-1])
            predicted = last_val + slope_val * horizon_days
            predicted_pct = float((predicted - last_val) / last_val) if last_val > 0 else 0.0
            return {
                "predicted_pct_change": predicted_pct,
                "method": "market_trend",
                "slope_per_day": slope_val,
                "last_value": last_val,
            }

    # Fallback: use goals slope across last matches
    if "goals" in stats_df.columns and not stats_df.empty:
        last_goals = stats_df["goals"].values[-8:] if len(stats_df) >= 1 else np.array([])
        if len(last_goals) > 1:
            goals_slope = _slope(last_goals)
            # map slope to a bounded pct (heuristic): tanh to bound, scaled to ~ +/- 20%
            predicted_pct = float(np.tanh(goals_slope / 4.0) * 0.2)
            return {
                "predicted_pct_change": predicted_pct,
                "method": "performance_trend",
                "goals_slope": float(goals_slope),
            }

    # Nothing to do
    return {"predicted_pct_change": 0.0, "method": "no_data"}


# ================================
# DB Wrappers for FastAPI endpoints
# ================================

def _stats_to_df(stats):
    """Convert list of Stat ORM objects into a pandas DataFrame."""
    if not stats:
        return pd.DataFrame()
    data = []
    for s in stats:
        row = {
            "match_date": getattr(s, "match_date", None),
            "minutes_played": getattr(s, "minutes_played", None),
            "goals": getattr(s, "goals", None),
            "assists": getattr(s, "assists", None),
            "touches": getattr(s, "touches", None),
            "tackles_won": getattr(s, "tackles_won", None),
        }
        data.append(row)
    return pd.DataFrame(data)


def predict_injury(player_id: int, db: Session):
    """Fetch stats from DB and run injury prediction. Returns probability."""
    stats = crud.get_stats_for_player(db, player_id)
    stats_df = _stats_to_df(stats)
    prob, _ = predict_injury_from_stats_df(stats_df)
    return prob


def predict_investment(player_id: int, db: Session):
    """Fetch stats from DB and run investment forecast. Returns dict."""
    stats = crud.get_stats_for_player(db, player_id)
    stats_df = _stats_to_df(stats)
    result = predict_investment_from_stats_df(stats_df)
    return result
