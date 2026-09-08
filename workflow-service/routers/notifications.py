from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Notification, User
from schemas import NotificationCreate, NotificationOut
from ws_manager import ws_manager
from typing import List

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint - clients connect here to receive real-time notifications."""
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive; listen for ping messages from client
            data = await websocket.receive_text()
            # Echo back pong to maintain heartbeat
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)

@router.post("/api/notify")
async def push_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    """
    Called by the Node.js backend after creating a DB Notification record.
    Pushes the notification to the user's WebSocket if they are connected.
    """
    message = {
        "event": "new_notification",
        "payload": {
            "id": payload.notificationId,
            "title": payload.title,
            "message": payload.message,
            "userId": payload.userId,
            "isRead": False
        }
    }
    await ws_manager.send_to_user(str(payload.userId), message)
    return {"status": "dispatched", "userId": payload.userId}

@router.get("/api/notifications/{user_id}", response_model=List[NotificationOut])
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    """Retrieve all notifications for a user (used as fallback for polling clients)."""
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return notifications

@router.patch("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark a single notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"status": "updated", "id": notification_id}

@router.patch("/api/notifications/user/{user_id}/read-all")
def mark_all_read(user_id: int, db: Session = Depends(get_db)):
    """Mark all notifications for a user as read."""
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "all marked as read", "userId": user_id}
