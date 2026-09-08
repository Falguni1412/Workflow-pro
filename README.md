# Enterprise Workflow Automation Platform

A full-stack workflow automation system with approvals, role-based access, and real-time notifications.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS, served via nginx
- **Backend:** Node.js 20 + Express + Sequelize (MySQL in production, SQLite locally)
- **Workflow Service:** Python 3.11 + FastAPI + SQLAlchemy (WebSocket notifications)
- **Database:** MySQL 8.0

## Local Development

```bash
# Local uses SQLite — no MySQL needed
cd backend && npm install && npm start          # http://localhost:5000
cd workflow-service && pip install -r requirements.txt && uvicorn main:app --reload  # http://localhost:8000
cd frontend && npm install && npm run dev       # http://localhost:5173
```

## Railway Deployment

This project is set up to deploy three services on Railway. Each has its own `railway.toml` and `Dockerfile`.

### One-time setup

1. Push the repo to GitHub.
2. In Railway, click **New Project → Deploy from GitHub Repo** and select this repo. Railway will scan the repo and detect the three subprojects. You may need to add each as a separate service pointing at `backend/`, `workflow-service/`, and `frontend/`.

### Service order

1. **MySQL database** — `+ New` → `Database` → `MySQL`. Railway auto-creates a `MYSQL_URL` and a `DATABASE_URL` variable.
2. **Backend (`backend/`)** — set env vars:
   - `MYSQL_URL` = `mysql://${{MySQL.MYSQL_USER}}:${{MySQL.MYSQL_PASSWORD}}@${{MySQL.MYSQL_HOST}}:${{MySQL.MYSQL_PORT}}/railway`
   - `PORT` = `5000`
   - `JWT_SECRET` = (generate a random string)
   - `WORKFLOW_SERVICE_URL` = `https://${{workflow-service.RAILWAY_PUBLIC_DOMAIN}}`
3. **Workflow Service (`workflow-service/`)** — set env vars:
   - `MYSQL_URL` = (same MySQL connection string)
   - `JWT_SECRET` = (same as backend)
   - `NODE_API_URL` = `https://${{workflow-backend.RAILWAY_PUBLIC_DOMAIN}}`
4. **Frontend (`frontend/`)** — set Docker build args (Railway exposes `RAILWAY_PUBLIC_DOMAIN` for each service):
   - `BACKEND_URL` = `https://${{workflow-backend.RAILWAY_PUBLIC_DOMAIN}}`
   - `WORKFLOW_SERVICE_URL` = `https://${{workflow-service.RAILWAY_PUBLIC_DOMAIN}}`

### Verify

- Frontend URL: `https://<your-frontend>.up.railway.app`
- Backend health: `https://<your-backend>.up.railway.app/`
- Workflow service: `https://<your-wf>.up.railway.app/`

## File Layout

```
.
├── backend/            # Node.js Express API
├── workflow-service/   # Python FastAPI + WebSockets
├── frontend/           # React + Vite + nginx
└── docker-compose.yml  # Local multi-service orchestration
```
