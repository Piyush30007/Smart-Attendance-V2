# Architecture

The repository is organized into four main areas:

- `frontend/`: the Vite + React client.
- `backend/`: the FastAPI application and domain modules.
- `ai/`: detection, recognition, registration, spoofing, and training modules.
- `storage/`: runtime files such as student images, embeddings, weights, reports, and temp files.

For deep-dive documentation on pipeline speedups and latency benchmarks, see [Latency & Performance Optimization Guide](file:///c:/Users/Piyush%20Singh/Desktop/Project/smart-attendance/docs/latency_optimization_guide.md).

The current app still runs through `frontend/src/App.jsx` and `backend/app/main.py`,
but the supporting folders now match a larger production-ready structure.
