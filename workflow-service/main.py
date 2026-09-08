from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import notifications

# Initialize DB tables if not already created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Enterprise Workflow Notification Service",
    description="Handles real-time WebSocket notifications and workflow event dispatching.",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount notification router (includes WebSocket + REST endpoints)
app.include_router(notifications.router)

@app.get("/")
def health_check():
    return {"status": "online", "service": "Workflow Notification Service"}
