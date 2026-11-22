from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    database_url: str = "mongodb://playdex:playdex@localhost:27017/playdex?authSource=admin"
    cors_origins: str = "http://localhost:5173"
    rawg_api_key: str = ""
    rawg_base_url: str = "https://api.rawg.io/api"
    # Tryb awaryjny: katalog z danych przykładowych (app/data/mock_games.json) zamiast RAWG.
    # Przydaje się bez klucza RAWG albo gdy RAWG nie działa (tak było 10–21.11.2026).
    rawg_mock: bool = False

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
