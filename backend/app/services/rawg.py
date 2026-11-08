from typing import Any, NoReturn

import httpx
from fastapi import HTTPException

from app.core.config import settings

RAWG_BASE_URL = "https://api.rawg.io/api"


class RawgNotConfiguredError(Exception):
    pass


class RawgRequestError(Exception):
    def __init__(self, status_code: int) -> None:
        self.status_code = status_code
        super().__init__(f"RAWG request failed with status {status_code}")


class RawgClient:
    def __init__(self) -> None:
        self._client = httpx.Client(timeout=20.0)

    def search_games(
        self,
        *,
        search: str | None,
        page: int,
        page_size: int,
        genres: str | None = None,
        platforms: str | None = None,
        dates: str | None = None,
        ordering: str | None = None,
    ) -> dict[str, Any]:
        params: dict[str, str | int] = {"page": page, "page_size": page_size}
        if search:
            params["search"] = search
        if genres:
            params["genres"] = genres
        if platforms:
            params["platforms"] = platforms
        if dates:
            params["dates"] = dates
        if ordering:
            params["ordering"] = ordering
        return self._get("/games", params)

    def get_game(self, rawg_id: int) -> dict[str, Any]:
        return self._get(f"/games/{rawg_id}", {})

    def _get(self, path: str, params: dict[str, str | int]) -> dict[str, Any]:
        api_key = settings.rawg_api_key.strip()
        if not api_key:
            raise RawgNotConfiguredError
        try:
            response = self._client.get(f"{RAWG_BASE_URL}{path}", params={**params, "key": api_key})
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise RawgRequestError(exc.response.status_code) from exc
        except httpx.HTTPError as exc:
            raise RawgRequestError(0) from exc

        data = response.json()
        if not isinstance(data, dict):
            raise RawgRequestError(response.status_code)
        return data


rawg_client = RawgClient()


def raise_for_rawg(exc: Exception) -> NoReturn:
    if isinstance(exc, RawgNotConfiguredError):
        raise HTTPException(status_code=503, detail="Brak klucza RAWG_API_KEY") from exc
    if isinstance(exc, RawgRequestError):
        if exc.status_code == 404:
            raise HTTPException(status_code=404, detail="Nie znaleziono gry") from exc
        raise HTTPException(status_code=502, detail="Nie udało się pobrać danych z RAWG") from exc
    raise exc
