"""
Knowledge Base API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional

from app.schemas.knowledge import (
    CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest,
    ArticleResponse, CreateArticleRequest, UpdateArticleRequest,
)
from app.services.auth_service import get_current_user
from app.services import kb_service
from app.services import s3_service

router = APIRouter(prefix="/kb", tags=["Knowledge Base"])


# ── Helper ──────────────────────────────────────────────────────

def _require_admin(user: dict):
    if user.get("role") not in ("admin", "super_admin", "staff"):
        raise HTTPException(status_code=403, detail="Staff access required")


# ═══════════════════════════════════════════════════════════════════
# File Upload
# ═══════════════════════════════════════════════════════════════════

ALLOWED_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/png",
    "image/jpeg",
    "image/webp",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload a file to S3 (admin/staff only). Returns the S3 URL."""
    _require_admin(current_user)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"File type '{file.content_type}' not allowed")

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")

    result = s3_service.upload_file(contents, file.filename, file.content_type)
    return result


# ═══════════════════════════════════════════════════════════════════
# Categories
# ═══════════════════════════════════════════════════════════════════

@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories():
    """List all KB categories (public)."""
    return kb_service.list_categories()


@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str):
    """Get a single category by ID."""
    cat = kb_service.get_category_by_id(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(
    data: CreateCategoryRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new category (admin/staff only)."""
    _require_admin(current_user)
    return kb_service.create_category(data.name, data.description, data.icon, data.sort_order)


@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    data: UpdateCategoryRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update a category (admin/staff only)."""
    _require_admin(current_user)
    return kb_service.update_category(category_id, data.model_dump(exclude_none=True))


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a category (admin/staff only). Fails if it has articles."""
    _require_admin(current_user)
    kb_service.delete_category(category_id)
    return {"message": "Category deleted"}


# ═══════════════════════════════════════════════════════════════════
# Articles
# ═══════════════════════════════════════════════════════════════════

@router.get("/articles", response_model=list[ArticleResponse])
async def list_articles(
    category_id: Optional[str] = None,
    current_user: dict | None = None,
):
    """List articles. Students see published only; staff see all."""
    # Public endpoint — show published only by default
    return kb_service.list_articles(category_id=category_id, published_only=True)


@router.get("/articles/all", response_model=list[ArticleResponse])
async def list_all_articles(
    category_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """List ALL articles including drafts (admin/staff only)."""
    _require_admin(current_user)
    return kb_service.list_articles(category_id=category_id, published_only=False)


@router.get("/articles/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: str):
    """Get a single article and increment view count."""
    article = kb_service.get_article_by_id(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    kb_service.increment_view_count(article_id)
    return article


@router.post("/articles", response_model=ArticleResponse, status_code=201)
async def create_article(
    data: CreateArticleRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new article (admin/staff only)."""
    _require_admin(current_user)
    return kb_service.create_article(
        category_id=data.category_id,
        title=data.title,
        content=data.content,
        author_id=current_user["id"],
        tags=data.tags,
        is_published=data.is_published,
        file_url=data.file_url,
        file_name=data.file_name,
        source_type=data.source_type,
    )


@router.put("/articles/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    data: UpdateArticleRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update an article (admin/staff only)."""
    _require_admin(current_user)
    return kb_service.update_article(article_id, data.model_dump(exclude_none=True))


@router.delete("/articles/{article_id}")
async def delete_article(
    article_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an article (admin/staff only)."""
    _require_admin(current_user)
    kb_service.delete_article(article_id)
    return {"message": "Article deleted"}


@router.post("/articles/{article_id}/helpful")
async def mark_helpful(article_id: str):
    """Increment the helpful count for an article (public)."""
    kb_service.increment_helpful_count(article_id)
    return {"message": "Marked as helpful"}

