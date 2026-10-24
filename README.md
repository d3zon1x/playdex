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
- **Baza danych:** PostgreSQL
- **API:** RAWG Video Games Database
- **Dodatkowo:** React Router, Axios, TanStack Query, SQLAlchemy

## Uruchomienie

### Baza danych

W katalogu głównym:

```bash
docker compose up -d
```

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

Skopiuj `backend/.env.example` do `backend/.env`, jeśli chcesz zmienić adres bazy albo CORS.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikacja: http://localhost:5173
