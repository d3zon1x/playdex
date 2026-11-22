"""Offline stand-in for the RAWG API.

RAWG has not been responding since ~10.11.2026, so while `RAWG_MOCK=true` the catalog is served
from `app/data/mock_games.json` (50 popular games, approximate data). The class has the same
methods as `RawgClient` and returns payloads in RAWG's shape, so routes and services don't change.
"""

import json
from functools import cached_property
from pathlib import Path
from typing import Any

from app.services.rawg import RawgRequestError

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "mock_games.json"

GENRES = {
    1: ("Racing", "racing"),
    2: ("Shooter", "shooter"),
    3: ("Adventure", "adventure"),
    4: ("Action", "action"),
    5: ("RPG", "role-playing-games-rpg"),
    7: ("Puzzle", "puzzle"),
    10: ("Strategy", "strategy"),
    11: ("Arcade", "arcade"),
    14: ("Simulation", "simulation"),
    15: ("Sports", "sports"),
    40: ("Casual", "casual"),
    51: ("Indie", "indie"),
    59: ("Massively Multiplayer", "massively-multiplayer"),
    83: ("Platformer", "platformer"),
}

# platform id -> (name, slug, parent platform id)
PLATFORMS = {
    4: ("PC", "pc", 1),
    187: ("PlayStation 5", "playstation5", 2),
    18: ("PlayStation 4", "playstation4", 2),
    16: ("PlayStation 3", "playstation3", 2),
    186: ("Xbox Series S/X", "xbox-series-x", 3),
    1: ("Xbox One", "xbox-one", 3),
    14: ("Xbox 360", "xbox360", 3),
    3: ("iOS", "ios", 4),
    5: ("macOS", "macos", 5),
    6: ("Linux", "linux", 6),
    7: ("Nintendo Switch", "nintendo-switch", 7),
    10: ("Wii U", "wii-u", 7),
    21: ("Android", "android", 8),
}

PARENT_PLATFORMS = {
    1: ("PC", "pc"),
    2: ("PlayStation", "playstation"),
    3: ("Xbox", "xbox"),
    4: ("iOS", "ios"),
    5: ("Apple Macintosh", "mac"),
    6: ("Linux", "linux"),
    7: ("Nintendo", "nintendo"),
    8: ("Android", "android"),
}


class MockRawgClient:
    @cached_property
    def _games(self) -> list[dict[str, Any]]:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))["games"]

    def search_games(
        self,
        *,
        search: str | None,
        page: int,
        page_size: int,
        genres: str | None = None,
        platforms: str | None = None,
        parent_platforms: str | None = None,
        dates: str | None = None,
        ordering: str | None = None,
    ) -> dict[str, Any]:
        rows = self._games
        if search:
            needle = search.casefold()
            rows = [game for game in rows if needle in game["name"].casefold()]
        if genres:
            wanted = _ids(genres)
            rows = [game for game in rows if wanted & set(game["genres"])]
        if platforms:
            wanted = _ids(platforms)
            rows = [game for game in rows if wanted & set(game["platforms"])]
        if parent_platforms:
            wanted = _ids(parent_platforms)
            rows = [game for game in rows if wanted & _parents(game)]
        if dates:
            start, end = dates.split(",")
            rows = [game for game in rows if start <= game["released"] <= end]
        rows = _sorted(rows, ordering or "-added")

        offset = (page - 1) * page_size
        return {
            "count": len(rows),
            "results": [_to_rawg(game) for game in rows[offset : offset + page_size]],
        }

    def get_game(self, rawg_id: int) -> dict[str, Any]:
        game = next((game for game in self._games if game["id"] == rawg_id), None)
        if game is None:
            raise RawgRequestError(404)
        return {**_to_rawg(game), "description_raw": game["description"]}

    def list_genres(self) -> list[dict[str, Any]]:
        used = {genre for game in self._games for genre in game["genres"]}
        return [{"id": gid, "name": GENRES[gid][0], "slug": GENRES[gid][1]} for gid in sorted(used)]

    def list_parent_platforms(self) -> list[dict[str, Any]]:
        used = {parent for game in self._games for parent in _parents(game)}
        return [
            {"id": pid, "name": name, "slug": slug}
            for pid, (name, slug) in PARENT_PLATFORMS.items()
            if pid in used
        ]


def _ids(value: str) -> set[int]:
    return {int(part) for part in value.split(",") if part}


def _parents(game: dict[str, Any]) -> set[int]:
    return {PLATFORMS[pid][2] for pid in game["platforms"]}


def _sorted(rows: list[dict[str, Any]], ordering: str) -> list[dict[str, Any]]:
    descending = ordering.startswith("-")
    key = ordering.lstrip("-")
    if key not in {"name", "released", "rating", "metacritic", "added"}:
        key = "added"
    # Games without a value (e.g. no Metacritic score) always go last, like on RAWG.
    present = [game for game in rows if game.get(key) is not None]
    missing = [game for game in rows if game.get(key) is None]
    sort_key = (lambda game: game[key].casefold()) if key == "name" else (lambda game: game[key])
    return sorted(present, key=sort_key, reverse=descending) + missing


def _to_rawg(game: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": game["id"],
        "name": game["name"],
        "slug": game["slug"],
        "released": game["released"],
        "background_image": None,
        "rating": game["rating"],
        "ratings_count": game["ratings_count"],
        "metacritic": game["metacritic"],
        "esrb_rating": {"name": game["esrb_rating"]} if game["esrb_rating"] else None,
        "genres": [{"id": gid, "name": GENRES[gid][0], "slug": GENRES[gid][1]} for gid in game["genres"]],
        "platforms": [
            {"platform": {"id": pid, "name": PLATFORMS[pid][0], "slug": PLATFORMS[pid][1]}}
            for pid in game["platforms"]
        ],
    }
