# Playdex

Aplikacja internetowa do odkrywania gier komputerowych i zarządzania własną biblioteką gier.

## O projekcie

**Dla kogo i po co:** Playdex jest dla graczy, którzy chcą w jednym miejscu znaleźć nowe gry i śledzić, w co grają, w co chcą zagrać i co już ukończyli — zamiast trzymać listy w notatkach i szukać informacji o grach na kilku stronach.

Dane o grach pochodzą z [RAWG API](https://rawg.io/apidocs) (przez backend, klucz nie trafia do przeglądarki).

## Funkcje

Każda funkcja jest opisana w osobnym Issue według wzoru *Co robi użytkownik / Widok / Dane / Najtrudniejsze / Gotowe, gdy* i ma jednego właściciela.

| Funkcja | Issue | Właściciel | Status |
|---|---|---|---|
| Wyszukiwarka gier | [#4](https://github.com/d3zon1x/playdex/issues/4) | @d3zon1x | ✅ zrobione |
| Filtry: gatunek, platforma, rok wydania, sortowanie | [#5](https://github.com/d3zon1x/playdex/issues/5) | @d3zon1x | ✅ zrobione |
| Strona szczegółów gry (`/games/:id`) | [#6](https://github.com/d3zon1x/playdex/issues/6) | @d3zon1x | ✅ zrobione |
| Konta użytkowników (rejestracja, logowanie, wiek w profilu) | [#7](https://github.com/d3zon1x/playdex/issues/7) | @d3zon1x | ⏳ M2 |
| Wyróżnione gry (panel administratora) | [#8](https://github.com/d3zon1x/playdex/issues/8) | @d3zon1x | ⏳ M2/M3 |
| Biblioteka ze statusami „Do zagrania” / „W trakcie” / „Ukończone” | [#9](https://github.com/d3zon1x/playdex/issues/9) | @stilist1 | 🔧 w trakcie |
| Własne oceny gier (1–5) | [#10](https://github.com/d3zon1x/playdex/issues/10) | @stilist1 | 🔧 w trakcie |
| Filtr wieku (ESRB → wiek) | [#11](https://github.com/d3zon1x/playdex/issues/11) | @stilist1 | ⏳ M2 |
| Osiągnięcia *(opcjonalnie)* | [#12](https://github.com/d3zon1x/playdex/issues/12) | @stilist1 | ⏳ M3 |

### Decyzje dotyczące zakresu

- **Wiek / PEGI:** RAWG zwraca tylko klasyfikację ESRB (bez PEGI). Mapujemy ESRB na minimalny wiek (E → 0, E10+ → 10, T → 13, M → 17, AO → 18) i porównujemy z wiekiem z profilu użytkownika. Nie przechodzimy na IGDB.
- **Panel administratora:** katalog pochodzi z RAWG, więc administrator nie dodaje ani nie edytuje gier. Zamiast tego wybiera gry wyróżnione na stronie głównej.
- **Konta użytkowników:** osobna funkcja — biblioteka, oceny i filtr wieku po jej wdrożeniu będą przypisane do zalogowanego użytkownika.
- **Osiągnięcia:** opcjonalne, na koniec projektu (dane RAWG bywają niepełne).

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
