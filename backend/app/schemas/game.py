from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class GenreRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class PlatformRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class GameRead(BaseModel):
    id: int
    name: str
    slug: str
    released: date | None = None
    background_image: str | None = None
    rating: float | None = None
    ratings_count: int = 0
    metacritic: int | None = None
    esrb_rating: str | None = None
    genres: list[GenreRead] = Field(default_factory=list)
    platforms: list[PlatformRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class GameDetail(GameRead):
    description: str | None = None


class GameSearchResult(BaseModel):
    count: int
    page: int
    page_size: int
    results: list[GameRead]
