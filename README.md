# Playdex

Aplikacja internetowa do odkrywania gier komputerowych i zarządzania własną biblioteką gier.

## O projekcie

Playdex to platforma umożliwiająca wyszukiwanie gier, przeglądanie ich opisów i ocen oraz filtrowanie według gatunku, platformy i daty wydania.

Użytkownicy będą mogli tworzyć własne kolekcje gier, oznaczać je jako „Do zagrania”, „W trakcie” lub „Ukończone” oraz wystawiać oceny.

Aplikacja będzie również oferować filtrowanie gier na podstawie wieku użytkownika (PEGI) oraz panel administratora umożliwiający dodawanie, edytowanie i usuwanie gier.

**Opcjonalnie:** system osiągnięć (achievementów) z poszczególnych gier.

Dane o grach będą pobierane z RAWG API.

## Zespół

| Imię i nazwisko | GitHub |
|---|---|
| Dmytro Shostak 56108 | @d3zon1x |
| Andrii Derypapa 56180 | @stilist1 |

## Technologia

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Python, FastAPI
- **Baza danych:** MongoDB
- **API:** RAWG Video Games Database
- **Dodatkowo:** React Router, Axios, TanStack Query

## Uruchomienie

### Szybki start (Makefile)

Wymagany Docker. W katalogu głównym:

```bash
make up      # db + backend + frontend w Dockerze
make dev     # db w Dockerze, backend i frontend lokalnie (hot reload)
make down    # zatrzymanie kontenerów
make         # lista wszystkich komend
```

Przy pierwszym uruchomieniu `make` utworzy `backend/.env` z `backend/.env.example` — wpisz tam `RAWG_API_KEY`.

### Baza danych

W katalogu głównym:

```bash
docker compose up -d db
```

MongoDB: `mongodb://playdex:playdex@localhost:27017/playdex?authSource=admin`

### Backend

```bash
cd backend
python -m venv .venv
```

Windows:

```bash
py -m venv .venv
.venv\Scripts\activate
```

macOS / Linux:

```bash
source .venv/bin/activate
```

Następnie:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: http://localhost:8000  
Dokumentacja: http://localhost:8000/docs

Skopiuj `backend/.env.example` do `backend/.env` i ustaw `RAWG_API_KEY` (klucz z [rawg.io/apidocs](https://rawg.io/apidocs)). Bez klucza wyszukiwanie gier nie zadziała. Przy Docker Compose ten sam klucz można podać jako zmienną `RAWG_API_KEY` albo w pliku `.env` w katalogu głównym.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikacja: http://localhost:5173
