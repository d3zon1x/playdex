from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError

from app.api.deps import MongoDb

router = APIRouter(tags=["health"])


@router.get("/health")
def health(db: MongoDb) -> dict[str, str]:
    try:
        db.command("ping")
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Baza danych niedostępna") from exc
    return {"status": "ok"}
