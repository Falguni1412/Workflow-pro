from sqlalchemy import Column, Integer, String, Boolean, Text, JSON, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="In-App")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    department_id = Column(Integer, nullable=True)
    status = Column(Enum("Active", "Suspended"), default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workflow_id = Column(Integer, nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(Enum("Pending", "Approved", "Rejected", "Sent_Back"), default="Pending")
    current_step_number = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
