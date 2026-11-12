# Playdex — szybki start
#
#   make            lista komend
#   make up         wszystko w Dockerze (db + backend + frontend)
#   make dev        db w Dockerze, backend i frontend lokalnie (hot reload)
#
# Klucz RAWG trzymamy w jednym miejscu: backend/.env (RAWG_API_KEY=...).
# Docker Compose czyta go stamtąd, lokalny uvicorn też.

SHELL := /bin/bash

PYTHON   ?= python3
VENV     := backend/.venv
VENV_BIN := $(VENV)/bin
ENV_FILE := backend/.env

# `=` (nie `:=`), żeby sprawdzać istnienie pliku w chwili wywołania
COMPOSE   = docker compose $(if $(wildcard $(ENV_FILE)),--env-file $(ENV_FILE))

.DEFAULT_GOAL := help

.PHONY: help env install install-backend install-frontend \
        up down restart logs ps build rebuild \
        dev db backend frontend \
        lint typecheck build-frontend clean nuke

help: ## Pokaż dostępne komendy
	@echo "Playdex — dostępne komendy:"
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

# ---------------------------------------------------------------- konfiguracja

env: $(ENV_FILE) frontend/.env ## Utwórz pliki .env z .env.example (nie nadpisuje)
	@if grep -qiE '^RAWG_MOCK=(false|0)' $(ENV_FILE) && ! grep -qE '^RAWG_API_KEY=.+' $(ENV_FILE); then \
		echo -e "\033[33m⚠  RAWG_MOCK=false, ale brak RAWG_API_KEY w $(ENV_FILE) — wyszukiwanie gier nie zadziała (klucz: https://rawg.io/apidocs)\033[0m"; \
	elif ! grep -qiE '^RAWG_MOCK=(false|0)' $(ENV_FILE); then \
		echo -e "\033[36mℹ  Katalog działa na danych przykładowych (RAWG_MOCK) — RAWG API nie odpowiada od ok. 10.11.2026.\033[0m"; \
	fi

$(ENV_FILE):
	cp backend/.env.example $@
	@echo "Utworzono $@"

frontend/.env:
	cp frontend/.env.example $@
	@echo "Utworzono $@"

install: install-backend install-frontend ## Zainstaluj zależności lokalnie (venv + npm)

install-backend: $(VENV_BIN)/.installed ## Utwórz venv i zainstaluj zależności Pythona

$(VENV_BIN)/.installed: backend/requirements.txt
	test -d $(VENV) || $(PYTHON) -m venv $(VENV)
	$(VENV_BIN)/pip install --upgrade pip -q
	$(VENV_BIN)/pip install -r backend/requirements.txt -q
	touch $@

install-frontend: frontend/node_modules/.package-lock.json ## Zainstaluj zależności npm

frontend/node_modules/.package-lock.json: frontend/package.json frontend/package-lock.json
	cd frontend && npm ci

# ---------------------------------------------------------------- docker

up: env ## Uruchom wszystko w Dockerze (w tle)
	$(COMPOSE) up -d --build
	@echo ""
	@echo "  Frontend: http://localhost:5173"
	@echo "  API:      http://localhost:8000"
	@echo "  Swagger:  http://localhost:8000/docs"
	@echo ""
	@echo "  Logi: make logs   |   Stop: make down"

down: ## Zatrzymaj kontenery
	$(COMPOSE) down

restart: down up ## Restart kontenerów

logs: ## Logi kontenerów (Ctrl+C, aby wyjść)
	$(COMPOSE) logs -f --tail=100

ps: ## Status kontenerów
	$(COMPOSE) ps

build: env ## Zbuduj obrazy
	$(COMPOSE) build

rebuild: env ## Przebuduj obrazy od zera (po zmianie requirements/package.json)
	$(COMPOSE) build --no-cache

# ---------------------------------------------------------------- lokalnie

dev: env install db ## db w Dockerze + backend i frontend lokalnie (Ctrl+C zatrzymuje oba)
	@echo "  Frontend: http://localhost:5173   API: http://localhost:8000/docs"
	@$(MAKE) --no-print-directory -j2 backend frontend

db: env ## Uruchom tylko MongoDB w Dockerze
	$(COMPOSE) up -d --wait db

backend: install-backend ## Uruchom backend lokalnie (uvicorn --reload)
	cd backend && .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

frontend: install-frontend ## Uruchom frontend lokalnie (Vite)
	cd frontend && npm run dev

# ---------------------------------------------------------------- jakość

lint: install-frontend ## Lint frontendu (oxlint)
	cd frontend && npm run lint

build-frontend: install-frontend ## Zbuduj frontend (tsc + vite build)
	cd frontend && npm run build

# ---------------------------------------------------------------- sprzątanie

clean: ## Usuń venv, node_modules i build (dane w bazie zostają)
	rm -rf $(VENV) frontend/node_modules frontend/dist

nuke: ## Zatrzymaj kontenery i USUŃ dane MongoDB (volume)
	$(COMPOSE) down -v
