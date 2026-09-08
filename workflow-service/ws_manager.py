from typing import Dict, Set
from fastapi import WebSocket
import json
import asyncio

class WebSocketManager:
    """Manages active WebSocket connections, grouped by user_id."""

    def __init__(self):
        # Maps user_id (str) -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        print(f"WebSocket connected for user {user_id}. Active connections: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"WebSocket disconnected for user {user_id}.")

    async def send_to_user(self, user_id: str, message: dict):
        """Send a JSON message to all WebSocket connections for a specific user."""
        connections = self.active_connections.get(str(user_id), set())
        disconnected = set()
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception as e:
                print(f"Failed to send to user {user_id}: {e}")
                disconnected.add(ws)
        # Clean up dead connections
        for ws in disconnected:
            self.active_connections[str(user_id)].discard(ws)

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients."""
        for user_id, connections in list(self.active_connections.items()):
            for ws in list(connections):
                try:
                    await ws.send_text(json.dumps(message))
                except Exception:
                    connections.discard(ws)

# Singleton instance used across all routers
ws_manager = WebSocketManager()
