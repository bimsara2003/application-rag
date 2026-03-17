"""
Pydantic schemas for User Notifications.
"""
from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import Optional

class NotificationType(str, Enum):
    TICKET_UPDATE = "ticket_update"
    TICKET_ASSIGNED = "ticket_assigned"
    TICKET_RESOLVED = "ticket_resolved"
    SYSTEM = "system"
    ANNOUNCEMENT = "announcement"

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: NotificationType
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    is_read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
