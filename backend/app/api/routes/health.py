from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError

from app.api.deps import MongoDb
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health(db: MongoDb) -> dict[str, str]:
    try:
        db.command("ping")
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Baza danych niedostępna") from exc
    # "mock" = katalog z danych przykładowych zamiast RAWG (frontend pokazuje wtedy baner)
    return {"status": "ok", "catalog": "mock" if settings.rawg_mock else "rawg"}
