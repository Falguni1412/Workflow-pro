import os
from dotenv import load_dotenv

load_dotenv()

# Use MySQL in production (Railway), SQLite for local development
DATABASE_URL = os.getenv("MYSQL_URL") or f"sqlite:///{os.path.dirname(os.path.dirname(os.path.abspath(__file__)))}/backend/workflow.sqlite"

JWT_SECRET = os.getenv("JWT_SECRET", "secret_key_12345")
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:5000")
