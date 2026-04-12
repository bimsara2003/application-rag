"""
Pydantic schemas for Announcements.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class AnnouncementPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class CreateAnnouncementRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    content: str = Field(..., min_length=10)
    priority: AnnouncementPriority = AnnouncementPriority.NORMAL
    is_active: bool = True
    expires_at: Optional[datetime] = None

    @field_validator("expires_at")
    @classmethod
    def expiration_must_be_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v and v < datetime.now(timezone.utc):
            raise ValueError("Expiration date must be in the future")
        return v


class UpdateAnnouncementRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    content: Optional[str] = Field(None, min_length=10)
    priority: Optional[AnnouncementPriority] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None

    @field_validator("expires_at")
    @classmethod
    def expiration_must_be_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v and v < datetime.now(timezone.utc):
            raise ValueError("Expiration date must be in the future")
        return v


class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    priority: AnnouncementPriority
    is_active: bool
    author_id: Optional[str] = None
    author_name: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
