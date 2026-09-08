from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationCreate(BaseModel):
    userId: int
    title: str
    message: str
    notificationId: Optional[int] = None

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    event: str
    payload: dict
