from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, Query, Response
from pymongo import DESCENDING
from pymongo.errors import DuplicateKeyError

from app.api.deps import MongoDb
from app.schemas.game import GameRead
from app.schemas.library import LibraryCreate, LibraryRead, LibraryStatus, LibraryUpdate
from app.services.catalog import public_game, upsert_game
from app.services.rawg import RawgNotConfiguredError, RawgRequestError, raise_for_rawg, rawg_client

router = APIRouter(tags=["library"])


@router.get("/library", response_model=list[LibraryRead])
def list_library(
    db: MongoDb,
    status: LibraryStatus | None = Query(default=None),
) -> list[LibraryRead]:
    query: dict = {}
    if status is not None:
        query["status"] = status.value
    entries = list(db.library.find(query).sort("created_at", DESCENDING))
    game_ids = [entry["game_id"] for entry in entries]
    games = {game["_id"]: game for game in db.games.find({"_id": {"$in": game_ids}})}
    result: list[LibraryRead] = []
    for entry in entries:
        game = games.get(entry["game_id"])
        if game is None:
            continue
        result.append(_to_read(entry, game))
    return result


@router.post("/library", response_model=LibraryRead, status_code=201)
def add_to_library(body: LibraryCreate, db: MongoDb) -> LibraryRead:
    if db.library.find_one({"game_id": body.rawg_id}, {"_id": 1}):
        raise HTTPException(status_code=409, detail="Gra jest już w bibliotece")

    try:
        payload = rawg_client.get_game(body.rawg_id)
    except (RawgNotConfiguredError, RawgRequestError) as exc:
        raise_for_rawg(exc)

    description = payload.get("description_raw")
    try:
        game = upsert_game(db, payload, description if isinstance(description, str) else None)
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="Nie udało się pobrać danych z RAWG") from exc

    now = datetime.now(timezone.utc)
    entry = {
        "game_id": body.rawg_id,
        "status": body.status.value,
        "user_rating": None,
        "created_at": now,
        "updated_at": now,
    }
    try:
        inserted = db.library.insert_one(entry)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Gra jest już w bibliotece") from exc
    entry["_id"] = inserted.inserted_id
    return _to_read(entry, game)


@router.patch("/library/{entry_id}", response_model=LibraryRead)
def update_library_entry(entry_id: str, body: LibraryUpdate, db: MongoDb) -> LibraryRead:
    entry = _get_entry(db, entry_id)
    changes = body.model_dump(exclude_unset=True)
    updates: dict = {"updated_at": datetime.now(timezone.utc)}
    if isinstance(changes.get("status"), LibraryStatus):
        updates["status"] = changes["status"].value
    if "user_rating" in changes:
        updates["user_rating"] = changes["user_rating"]
    db.library.update_one({"_id": entry["_id"]}, {"$set": updates})
    entry.update(updates)
    game = db.games.find_one({"_id": entry["game_id"]})
    if game is None:
        raise HTTPException(status_code=404, detail="Nie znaleziono gry")
    return _to_read(entry, game)


@router.delete("/library/{entry_id}", status_code=204)
def delete_library_entry(entry_id: str, db: MongoDb) -> Response:
    entry = _get_entry(db, entry_id)
    db.library.delete_one({"_id": entry["_id"]})
    return Response(status_code=204)


def _get_entry(db: MongoDb, entry_id: str) -> dict:
    try:
        oid = ObjectId(entry_id)
    except InvalidId as exc:
        raise HTTPException(status_code=404, detail="Nie znaleziono wpisu w bibliotece") from exc
    entry = db.library.find_one({"_id": oid})
    if entry is None:
        raise HTTPException(status_code=404, detail="Nie znaleziono wpisu w bibliotece")
    return entry


def _to_read(entry: dict, game: dict) -> LibraryRead:
    return LibraryRead(
        id=str(entry["_id"]),
        status=entry["status"],
        user_rating=entry.get("user_rating"),
        game=GameRead.model_validate(public_game(game)),
    )
