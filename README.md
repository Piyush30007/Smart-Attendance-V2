# Smart Attendance System

A face-recognition attendance project organized into clear frontend, backend,
AI, storage, docs, scripts, and tests modules.

## Structure

```text
smart-attendance/
├── README.md
├── .gitignore
├── docker-compose.yml
├── .env.example
├── docs/
├── frontend/
├── backend/
├── ai/
├── storage/
├── scripts/
└── tests/
```

## Key folders

- `frontend/src/` now includes `assets`, `components`, `layouts`, `pages`,
  `routes`, `services`, `hooks`, `contexts`, `utils`, and `styles`.
- `backend/app/` now includes `api`, `core`, `database`, `models`, `schemas`,
  `repositories`, `services`, `middleware`, and `utils`.
- `ai/` now includes `detection`, `recognition`, `registration`,
  `spoof_detection`, `training`, and `utils`.
- `storage/` now includes `students`, `embeddings`, `checkpoints`, `weights`,
  `reports`, and `temp`.
- `tests/` now includes top-level `backend`, `frontend`, and `ai` folders.

## Running locally

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker-compose up --build
```

- API docs: http://localhost:8000/docs
- Frontend: http://localhost:5173
