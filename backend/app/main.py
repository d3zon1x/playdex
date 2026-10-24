from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.games import router as games_router
from app.api.routes.health import router as health_router
from app.core.config import settings

app = FastAPI(title="Playdex API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(games_router, prefix="/api")
