import enum

from pydantic import BaseModel, Field

from app.schemas.game import GameRead


class LibraryStatus(str, enum.Enum):
    backlog = "backlog"
    playing = "playing"
    completed = "completed"


class LibraryCreate(BaseModel):
    rawg_id: int = Field(ge=1)
    status: LibraryStatus = LibraryStatus.backlog


class LibraryUpdate(BaseModel):
    status: LibraryStatus | None = None
    user_rating: int | None = Field(default=None, ge=1, le=10)


class LibraryRead(BaseModel):
    id: str
    status: LibraryStatus
    user_rating: int | None = None
    game: GameRead
