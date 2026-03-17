"""
Notification API endpoints.
"""
from fastapi import APIRouter, Depends, status

from app.schemas import NotificationResponse
from app.services.auth_service import get_current_user
from app.services.notification_service import (
    get_user_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_as_read,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=list[NotificationResponse])
async def list_notifications(current_user: dict = Depends(get_current_user)):
    """Get the current user's notifications (newest first, max 30)."""
    return get_user_notifications(current_user["id"])


@router.get("/unread-count")
async def unread_count(current_user: dict = Depends(get_current_user)):
    """Get the number of unread notifications."""
    count = get_unread_count(current_user["id"])
    return {"count": count}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def read_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a single notification as read."""
    return mark_as_read(notification_id, current_user["id"])


@router.put("/read-all", status_code=status.HTTP_200_OK)
async def read_all_notifications(current_user: dict = Depends(get_current_user)):
    """Mark all unread notifications as read."""
    updated = mark_all_as_read(current_user["id"])
    return {"updated": updated}
