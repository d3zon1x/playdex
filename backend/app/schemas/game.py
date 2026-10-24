from datetime import date

from pydantic import BaseModel


class GameRead(BaseModel):
    id: int
    name: str
    released: date | None = None
