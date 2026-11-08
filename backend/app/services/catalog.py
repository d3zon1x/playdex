from datetime import date

from pymongo.database import Database

from app.schemas.game import GameDetail, GameRead


def parse_released(value: object) -> date | None:
    if not isinstance(value, str) or len(value) < 10:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def summary_from_rawg(payload: dict) -> GameRead:
    return GameRead.model_validate(public_game(game_document(payload, None)))


def upsert_game(db: Database, payload: dict, description: str | None) -> dict:
    document = game_document(payload, description)
    db.games.replace_one({"_id": document["_id"]}, document, upsert=True)
    return document


def detail_from_document(document: dict) -> GameDetail:
    return GameDetail.model_validate(public_game(document))


def game_document(payload: dict, description: str | None) -> dict:
    rawg_id = payload.get("id")
    name = payload.get("name")
    if not isinstance(rawg_id, int) or not isinstance(name, str) or not name.strip():
        raise ValueError("Incomplete RAWG game payload")

    esrb = payload.get("esrb_rating") or {}
    released = parse_released(payload.get("released"))
    return {
        "_id": rawg_id,
        "name": name.strip(),
        "slug": _slug(payload, rawg_id),
        "released": released.isoformat() if released else None,
        "background_image": _as_str(payload.get("background_image")),
        "rating": _as_float(payload.get("rating")),
        "ratings_count": _as_int(payload.get("ratings_count")) or 0,
        "metacritic": _as_int(payload.get("metacritic")),
        "esrb_rating": _as_str(esrb.get("name")) if isinstance(esrb, dict) else None,
        "description": description.strip() if isinstance(description, str) and description.strip() else None,
        "genres": [_tag(row) for row in _named_rows(payload.get("genres"))],
        "platforms": [_tag(row) for row in _named_rows(raw_platforms(payload))],
    }


def public_game(document: dict) -> dict:
    return {
        "id": document["_id"],
        "name": document["name"],
        "slug": document.get("slug") or str(document["_id"]),
        "released": document.get("released"),
        "background_image": document.get("background_image"),
        "rating": document.get("rating"),
        "ratings_count": document.get("ratings_count") or 0,
        "metacritic": document.get("metacritic"),
        "esrb_rating": document.get("esrb_rating"),
        "genres": document.get("genres") or [],
        "platforms": document.get("platforms") or [],
        "description": document.get("description"),
    }


def raw_platforms(payload: dict) -> list[dict]:
    rows: list[dict] = []
    for item in payload.get("platforms") or []:
        if not isinstance(item, dict):
            continue
        platform = item.get("platform", item)
        if isinstance(platform, dict):
            rows.append(platform)
    return rows


def _named_rows(value: object) -> list[dict]:
    if not isinstance(value, list):
        return []
    rows: list[dict] = []
    seen: set[int] = set()
    for item in value:
        if not isinstance(item, dict):
            continue
        row_id = item.get("id")
        row_name = item.get("name")
        if not isinstance(row_id, int) or not isinstance(row_name, str) or row_id in seen:
            continue
        seen.add(row_id)
        rows.append(item)
    return rows


def _tag(row: dict) -> dict:
    row_id = row["id"]
    slug = row.get("slug")
    return {
        "id": row_id,
        "name": row["name"],
        "slug": slug.strip() if isinstance(slug, str) and slug.strip() else str(row_id),
    }


def _slug(payload: dict, rawg_id: int) -> str:
    slug = payload.get("slug")
    if isinstance(slug, str) and slug.strip():
        return slug.strip()
    return str(rawg_id)


def _as_str(value: object) -> str | None:
    if isinstance(value, str) and value.strip():
        return value
    return None


def _as_float(value: object) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    return float(value)


def _as_int(value: object) -> int | None:
    if isinstance(value, bool) or not isinstance(value, int):
        return None
    return value
