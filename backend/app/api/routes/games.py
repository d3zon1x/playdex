import re

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import MongoDb
from app.schemas.game import GameDetail, GameSearchResult
from app.services.catalog import detail_from_document, summary_from_rawg, upsert_game
from app.services.rawg import RawgNotConfiguredError, RawgRequestError, raise_for_rawg, rawg_client

router = APIRouter(tags=["games"])

_ID_LIST = re.compile(r"^\d+(,\d+)*$")
_DATES = re.compile(r"^\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}$")
_ORDERING = {
    "name",
    "-name",
    "released",
    "-released",
    "rating",
    "-rating",
    "metacritic",
    "-metacritic",
    "added",
    "-added",
}


@router.get("/games", response_model=GameSearchResult)
def list_games(
    search: str | None = Query(default=None, max_length=200),
    page: int = Query(default=1, ge=1, le=500),
    page_size: int = Query(default=12, ge=1, le=40),
    genres: str | None = Query(default=None, description="Comma-separated RAWG genre ids"),
    platforms: str | None = Query(default=None, description="Comma-separated RAWG platform ids"),
    dates: str | None = Query(default=None, description="Release window, YYYY-MM-DD,YYYY-MM-DD"),
    ordering: str | None = Query(default=None),
) -> GameSearchResult:
    """Search RAWG. An empty query returns popular games."""
    query = search.strip() if search else None
    genre_ids = _id_list(genres, "genres")
    platform_ids = _id_list(platforms, "platforms")
    if dates and not _DATES.fullmatch(dates):
        raise HTTPException(status_code=422, detail="Parametr dates musi mieć format YYYY-MM-DD,YYYY-MM-DD")
    if ordering and ordering not in _ORDERING:
        raise HTTPException(status_code=422, detail="Nieobsługiwane sortowanie")

    try:
        payload = rawg_client.search_games(
            search=query,
            page=page,
            page_size=page_size,
            genres=genre_ids,
            platforms=platform_ids,
            dates=dates,
            ordering=ordering,
        )
    except (RawgNotConfiguredError, RawgRequestError) as exc:
        raise_for_rawg(exc)

    results = []
    for item in payload.get("results") or []:
        if not isinstance(item, dict) or not isinstance(item.get("id"), int) or not isinstance(item.get("name"), str):
            continue
        results.append(summary_from_rawg(item))

    count = payload.get("count")
    return GameSearchResult(
        count=count if isinstance(count, int) else 0,
        page=page,
        page_size=page_size,
        results=results,
    )


@router.get("/games/{rawg_id}", response_model=GameDetail)
def get_game(rawg_id: int, db: MongoDb) -> GameDetail:
    """Fetch a game from RAWG and store it in MongoDB."""
    try:
        payload = rawg_client.get_game(rawg_id)
    except (RawgNotConfiguredError, RawgRequestError) as exc:
        raise_for_rawg(exc)

    description = payload.get("description_raw")
    try:
        document = upsert_game(db, payload, description if isinstance(description, str) else None)
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="Nie udało się pobrać danych z RAWG") from exc
    return detail_from_document(document)


def _id_list(value: str | None, name: str) -> str | None:
    if value is None or not value.strip():
        return None
    normalized = ",".join(part.strip() for part in value.split(",") if part.strip())
    if not _ID_LIST.fullmatch(normalized):
        raise HTTPException(status_code=422, detail=f"Parametr {name} musi być listą identyfikatorów")
    return normalized
