"""
Notification service — CRUD operations against the Supabase notifications table.
"""
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import HTTPException, status
from app.database.database import get_supabase


def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str,
    reference_type: str | None = None,
    reference_id: str | None = None,
) -> dict:
    """Insert a new notification row into the database."""
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    row = {
        "id": str(uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "reference_type": reference_type,
        "reference_id": reference_id,
        "is_read": False,
        "created_at": now,
    }

    result = sb.table("notifications").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create notification")
    return result.data[0]


def get_user_notifications(user_id: str, limit: int = 30) -> list[dict]:
    """Fetch the most recent notifications for a user, newest first."""
    sb = get_supabase()
    result = (
        sb.table("notifications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


def get_unread_count(user_id: str) -> int:
    """Return the count of unread notifications for a user."""
    sb = get_supabase()
    result = (
        sb.table("notifications")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("is_read", False)
        .execute()
    )
    return result.count or 0


def mark_as_read(notification_id: str, user_id: str) -> dict:
    """Mark a single notification as read."""
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    result = (
        sb.table("notifications")
        .update({"is_read": True, "read_at": now})
        .eq("id", notification_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return result.data[0]


def mark_all_as_read(user_id: str) -> int:
    """Mark all unread notifications as read. Returns number of updated rows."""
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    result = (
        sb.table("notifications")
        .update({"is_read": True, "read_at": now})
        .eq("user_id", user_id)
        .eq("is_read", False)
        .execute()
    )
    return len(result.data) if result.data else 0


# ── Convenience triggers ────────────────────────────────────────────────────

def notify_ticket_status_change(student_user_id: str, ticket_id: str, ticket_subject: str, new_status: str):
    """Auto-notify a student when their ticket status changes."""
    status_labels = {
        "in_progress": "is now being reviewed",
        "resolved": "has been resolved",
        "closed": "has been closed",
        "escalated": "has been escalated",
        "open": "has been reopened",
    }
    label = status_labels.get(new_status, f"status changed to {new_status}")

    create_notification(
        user_id=student_user_id,
        title=f"Ticket {label}",
        message=f'Your ticket "{ticket_subject}" {label}.',
        notification_type="ticket_update" if new_status not in ("resolved",) else "ticket_resolved",
        reference_type="ticket",
        reference_id=ticket_id,
    )


def notify_new_comment(recipient_user_id: str, ticket_id: str, ticket_subject: str, author_name: str):
    """Auto-notify when a new public comment is posted on a ticket."""
    create_notification(
        user_id=recipient_user_id,
        title="New reply on your ticket",
        message=f'{author_name} replied to "{ticket_subject}".',
        notification_type="ticket_update",
        reference_type="ticket",
        reference_id=ticket_id,
    )


def notify_ticket_assigned(staff_user_id: str, ticket_id: str, ticket_subject: str):
    """Auto-notify when a ticket is assigned to a staff member."""
    create_notification(
        user_id=staff_user_id,
        title="Ticket assigned to you",
        message=f'You have been assigned to ticket "{ticket_subject}".',
        notification_type="ticket_assigned",
        reference_type="ticket",
        reference_id=ticket_id,
    )
