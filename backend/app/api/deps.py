from typing import Annotated

from fastapi import Depends
from pymongo.database import Database

from app.core.database import get_db

MongoDb = Annotated[Database, Depends(get_db)]
