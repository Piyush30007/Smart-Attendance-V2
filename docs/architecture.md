# Architecture

The repository is organized into four main areas:

- `frontend/`: the Vite + React client.
- `backend/`: the FastAPI application and domain modules.
- `ai/`: detection, recognition, registration, spoofing, and training modules.
- `storage/`: runtime files such as student images, embeddings, weights, reports, and temp files.

The current app still runs through `frontend/src/App.jsx` and `backend/app/main.py`,
but the supporting folders now match a larger production-ready structure.
