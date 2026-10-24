from fastapi import APIRouter

from app.schemas.game import GameRead

router = APIRouter(tags=["games"])


@router.get("/games", response_model=list[GameRead])
def list_games() -> list[GameRead]:
    return []
