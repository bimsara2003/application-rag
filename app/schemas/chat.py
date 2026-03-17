"""
Pydantic schemas for RAG Chat Sessions and Messages.
"""
from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

class ChatRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class ChatFeedback(str, Enum):
    HELPFUL = "helpful"
    NOT_HELPFUL = "not_helpful"

class ChatSessionResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: Optional[str] = None
    is_active: bool
    created_at: datetime
    ended_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: ChatRole
    content: str
    source_documents: Optional[List[Dict[str, Any]]] = None
    confidence_score: Optional[float] = None
    feedback: Optional[ChatFeedback] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class CreateMessageRequest(BaseModel):
    content: str
