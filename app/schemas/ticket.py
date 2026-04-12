"""
Pydantic schemas for Support Tickets, Comments, and Attachments.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional, List
from app.schemas.user import Faculty, Campus

class Department(str, Enum):
    ACADEMIC = "academic"
    FINANCE = "financial"
    TECHNICAL = "technical"
    ADMINISTRATIVE = "administrative"
    LIBRARY = "library"
    OTHER = "other"

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"
    ESCALATED = "escalated"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class CreateTicketRequest(BaseModel):
    subject: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=10)
    department: Department

class StudentInfo(BaseModel):
    full_name: str
    registration_number: Optional[str] = None
    faculty: Optional[Faculty] = None
    campus: Optional[Campus] = None
    phone: Optional[str] = None

class TicketResponse(BaseModel):
    id: str
    user_id: str
    assigned_to: Optional[str] = None
    subject: str
    message: str
    department: Department
    status: TicketStatus = TicketStatus.OPEN
    priority: TicketPriority = TicketPriority.MEDIUM
    admin_note: Optional[str] = None
    resolution: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    student: Optional[StudentInfo] = None
    comments: List["CommentResponse"] = []
    # AI Routing fields
    ai_routed: bool = False
    ai_priority_reason: Optional[str] = None
    ai_assigned_to_name: Optional[str] = None
    student_selected_department: Optional[str] = None

    model_config = {"from_attributes": True}

class UpdateTicketStatusRequest(BaseModel):
    status: TicketStatus
    priority: Optional[TicketPriority] = None
    assigned_to: Optional[str] = None
    admin_note: Optional[str] = None
    resolution: Optional[str] = None

class CommentResponse(BaseModel):
    id: str
    ticket_id: str
    user_id: str
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    content: str
    is_internal: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class CreateCommentRequest(BaseModel):
    content: str = Field(..., min_length=1)
    is_internal: bool = False
