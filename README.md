# Note Keeper App

## Overview
Note Keeper App is a private, login-free space for jotting down notes you can review, edit, or delete on demand.

## Architecture

### Backend (FastAPI + SQLModel)
- FastAPI exposes CRUD endpoints for notes.
- SQLite stores notes persistently in `notes.db`.
- No authentication—just a simple JSON API for your personal use.

### Frontend (React)
- Built with Create React App and styled with modern CSS.
- Axios powers the API calls.
- All interactions happen in a single page: create, edit, delete, and view notes instantly.

## Installation

### Backend
1. `cd backend`
2. `python -m venv .venv` (optional but recommended)
3. `pip install -r requirements.txt`
4. `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
5. Visit `http://localhost:8000/docs` to explore the API (Swagger UI).

The SQLite database (`notes.db`) is created automatically next to `backend/app` when the server starts.

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`
4. Open `http://localhost:3000` to use the interface.

If the backend does not run on `http://localhost:8000`, set the `REACT_APP_API_BASE` environment variable before starting the frontend (for example `REACT_APP_API_BASE=http://127.0.0.1:9000 npm start`).

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/notes` | Returns all notes sorted by most recently edited. |
| `POST` | `/notes` | Creates a new note. Expects JSON payload `{"title": "...", "content": "..."}`. |
| `PUT` | `/notes/{id}` | Updates an existing note. |
| `DELETE` | `/notes/{id}` | Deletes the note with the specified ID. |

## Next Steps

- Add search or tagging to quickly find notes.
- Bundle the stack with Docker if you want to move it between machines.
- Connect a password or encryption layer later if you ever want to share the notes safely.
