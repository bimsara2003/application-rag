"""
Pydantic schemas for Knowledge Base Categories and Articles.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


# ── Category Schemas ─────────────────────────────────────────────

class CreateCategoryRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int = 0


class UpdateCategoryRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Article Schemas ──────────────────────────────────────────────

class CreateArticleRequest(BaseModel):
    category_id: str
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    tags: Optional[List[str]] = None
    is_published: bool = False
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    source_type: str = "manual"


class UpdateArticleRequest(BaseModel):
    category_id: Optional[str] = None
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    source_type: Optional[str] = None


class ArticleResponse(BaseModel):
    id: str
    category_id: str
    title: str
    content: str
    author_id: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: bool
    view_count: int
    helpful_count: int
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    source_type: Optional[str] = "manual"
    created_at: datetime
    updated_at: datetime

    # Joined fields
    category_name: Optional[str] = None
    author_name: Optional[str] = None

    model_config = {"from_attributes": True}
