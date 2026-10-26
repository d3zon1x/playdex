# Docker — run & debug

Frontend, backend, and the database run as **separate** services from different Dockerfiles.

| Service    | Dockerfile             | Ports                      |
|------------|------------------------|----------------------------|
| `db`       | `mongo:7` image        | `27017`                    |
| `backend`  | `backend/Dockerfile`   | `8000`, `5678` (debug)     |
| `frontend` | `frontend/Dockerfile`  | `5173`                     |

## Start

From the repo root:

```bash
# MongoDB only
docker compose up db

# Backend only (also starts db via depends_on)
docker compose up backend

# Frontend only
docker compose up frontend

# Everything
docker compose up
```

Detached:

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

After changes to a `Dockerfile`, `requirements.txt`, or `package.json`:

```bash
docker compose build
docker compose up
```

### URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- MongoDB: `mongodb://playdex:playdex@localhost:27017/playdex?authSource=admin`

Source is mounted via volumes — host changes are picked up without rebuilding (`--reload` on the backend, HMR on the frontend).

## Debug the backend (debugpy)

The backend container starts with **debugpy** listening on port **5678**.

### VS Code / Cursor

1. Start the backend:

```bash
docker compose up backend
```

2. Open **Run and Debug** (`Cmd+Shift+D` / `Ctrl+Shift+D`).
3. Select **Attach: Playdex backend (Docker)** (see `.vscode/launch.json`).
4. Press **Start Debugging** (F5).
5. Set breakpoints under `backend/` — the debugger attaches to the process inside the container.

Path mapping in the launch config:

- local: `backend/`
- container: `/app`

### If the launch config is missing

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach: Playdex backend (Docker)",
      "type": "debugpy",
      "request": "attach",
      "connect": {
        "host": "localhost",
        "port": 5678
      },
      "pathMappings": [
        {
          "localRoot": "${workspaceFolder}/backend",
          "remoteRoot": "/app"
        }
      ],
      "justMyCode": true
    }
  ]
}
```

Requires the **Python** extension (debugpy).

### Wait for the client before start (optional)

If the API should not start until a debugger attaches, add `--wait-for-client` to the CMD in `backend/Dockerfile`:

```dockerfile
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", \
     "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

By default `--wait-for-client` is **off**: the server starts immediately and you can attach at any time.
