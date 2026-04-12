"""
Announcement service — CRUD operations against the Supabase announcements table.
"""
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import HTTPException, status
from app.database.database import get_supabase
from app.schemas.announcement import UpdateAnnouncementRequest


def create_announcement(
    title: str,
    content: str,
    priority: str,
    author_id: str,
    is_active: bool = True,
    expires_at: str | None = None,
) -> dict:
    """Insert a new announcement row into the database."""
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    row = {
        "id": str(uuid4()),
        "title": title,
        "content": content,
        "priority": priority,
        "is_active": is_active,
        "author_id": author_id,
        "expires_at": expires_at,
        "created_at": now,
        "updated_at": now,
    }

    result = sb.table("announcements").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create announcement")
    return _enrich_with_author(result.data[0])


def list_announcements(active_only: bool = False) -> list[dict]:
    """List announcements. If active_only, filter to active + non-expired."""
    sb = get_supabase()
    query = sb.table("announcements").select("*").order("created_at", desc=True)

    if active_only:
        query = query.eq("is_active", True)

    result = query.execute()
    announcements = result.data or []

    if active_only:
        now = datetime.now(timezone.utc)
        announcements = [
            a for a in announcements
            if a.get("expires_at") is None or datetime.fromisoformat(a["expires_at"].replace("Z", "+00:00")) > now
        ]

    return [_enrich_with_author(a) for a in announcements]


def get_announcement_by_id(announcement_id: str) -> dict | None:
    """Fetch a single announcement by its ID."""
    sb = get_supabase()
    result = sb.table("announcements").select("*").eq("id", announcement_id).execute()
    if not result.data:
        return None
    return _enrich_with_author(result.data[0])


def update_announcement(announcement_id: str, data: UpdateAnnouncementRequest) -> dict:
    """Partially update an announcement."""
    sb = get_supabase()
    updates = data.model_dump(exclude_none=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    # Convert enum values to strings
    for key, value in updates.items():
        if hasattr(value, "value"):
            updates[key] = value.value
    
    # Convert datetime to ISO string
    if "expires_at" in updates and updates["expires_at"] is not None:
        updates["expires_at"] = updates["expires_at"].isoformat()

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = sb.table("announcements").update(updates).eq("id", announcement_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return _enrich_with_author(result.data[0])


def delete_announcement(announcement_id: str) -> bool:
    """Delete an announcement by its ID."""
    sb = get_supabase()
    result = sb.table("announcements").delete().eq("id", announcement_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return True


def _enrich_with_author(announcement: dict) -> dict:
    """Join the author name from the users table."""
    if announcement.get("author_id"):
        sb = get_supabase()
        user_res = sb.table("users").select("full_name").eq("id", announcement["author_id"]).execute()
        if user_res.data:
            announcement["author_name"] = user_res.data[0]["full_name"]
    return announcement
