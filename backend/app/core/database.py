from collections.abc import Generator

from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import settings

client = MongoClient(settings.database_url)
db = client.get_default_database()


def get_db() -> Generator[Database, None, None]:
    yield db
