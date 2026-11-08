import sys
import time
from collections.abc import Generator

from pymongo import DESCENDING, MongoClient
from pymongo.database import Database
from pymongo.errors import PyMongoError

from app.core.config import settings

client = MongoClient(settings.database_url, serverSelectionTimeoutMS=2000)


def get_database() -> Database:
    database = client.get_default_database()
    if database is None:
        raise RuntimeError("DATABASE_URL must include a database name")
    return database


def get_db() -> Generator[Database, None, None]:
    yield get_database()


def init_db() -> None:
    for attempt in range(10):
        try:
            database = get_database()
            client.admin.command("ping")
            database.library.create_index("game_id", unique=True)
            database.library.create_index("status")
            database.library.create_index([("created_at", DESCENDING)])
            return
        except PyMongoError:
            if attempt == 9:
                raise
            print(
                f"Database not ready, retrying ({attempt + 1}/10)...",
                file=sys.stderr,
            )
            time.sleep(2)
