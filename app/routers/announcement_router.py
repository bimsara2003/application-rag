"""
Announcement API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.announcement import (
    AnnouncementResponse,
    CreateAnnouncementRequest,
    UpdateAnnouncementRequest,
)
from app.services.auth_service import get_current_user
from app.services import announcement_service

router = APIRouter(prefix="/announcements", tags=["Announcements"])


# ── Helper ──────────────────────────────────────────────────────

def _require_admin(user: dict):
    if user.get("role") not in ("admin", "super_admin", "staff"):
        raise HTTPException(status_code=403, detail="Staff access required")


# ═══════════════════════════════════════════════════════════════════
# Public endpoints
# ═══════════════════════════════════════════════════════════════════

@router.get("/active", response_model=list[AnnouncementResponse])
async def get_active_announcements():
    """Get all active, non-expired announcements (public for students)."""
    return announcement_service.list_announcements(active_only=True)


# ═══════════════════════════════════════════════════════════════════
# Admin endpoints
# ═══════════════════════════════════════════════════════════════════

@router.get("/", response_model=list[AnnouncementResponse])
async def list_all_announcements(
    current_user: dict = Depends(get_current_user),
):
    """List ALL announcements including inactive/expired (admin/staff only)."""
    _require_admin(current_user)
    return announcement_service.list_announcements(active_only=False)


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement(
    announcement_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single announcement by ID (admin/staff only)."""
    _require_admin(current_user)
    ann = announcement_service.get_announcement_by_id(announcement_id)
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return ann


@router.post("/", response_model=AnnouncementResponse, status_code=201)
async def create_announcement(
    data: CreateAnnouncementRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new announcement (admin/staff only)."""
    _require_admin(current_user)
    return announcement_service.create_announcement(
        title=data.title,
        content=data.content,
        priority=data.priority.value,
        author_id=current_user["id"],
        is_active=data.is_active,
        expires_at=data.expires_at.isoformat() if data.expires_at else None,
    )


@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: str,
    data: UpdateAnnouncementRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update an announcement (admin/staff only)."""
    _require_admin(current_user)
    return announcement_service.update_announcement(announcement_id, data)


@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an announcement (admin/staff only)."""
    _require_admin(current_user)
    announcement_service.delete_announcement(announcement_id)
    return {"message": "Announcement deleted"}
