"""
Support ticket CRUD operations against Supabase.
"""
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.database.database import get_supabase
from app.schemas import CreateTicketRequest, UpdateTicketStatusRequest
from app.services.notification_service import (
    notify_ticket_status_change,
    notify_new_comment,
    notify_ticket_assigned,
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _format_ticket(ticket: dict) -> dict:
    """Reshape the Supabase nested select result into a clean ticket dict."""
    if "users" in ticket:
        users_data = ticket.pop("users") or {}
        student_profiles = users_data.get("student_profiles") or {}

        ticket["student"] = {
            "full_name": users_data.get("full_name", "Unknown"),
            "phone": users_data.get("phone"),
            "registration_number": student_profiles.get("registration_number"),
            "faculty": student_profiles.get("faculty"),
            "campus": student_profiles.get("campus"),
        }

    # Flatten comments — attach author info from nested users relation
    raw_comments = ticket.pop("ticket_comments", []) or []
    ticket["comments"] = []
    for c in raw_comments:
        author = c.pop("users", None) or {}
        ticket["comments"].append({
            "id": c["id"],
            "ticket_id": c["ticket_id"],
            "user_id": c["user_id"],
            "content": c["content"],
            "is_internal": c.get("is_internal", False),
            "created_at": c["created_at"],
            "author_name": author.get("full_name"),
            "author_role": author.get("role"),
        })

    return ticket


# Select string reused across queries — fetches ticket + student info + comments
_TICKET_SELECT = (
    "*, "
    "users!tickets_user_id_fkey(full_name, phone, student_profiles(registration_number, faculty, campus)), "
    "ticket_comments(id, ticket_id, user_id, content, is_internal, created_at, users(full_name, role))"
)


# ─── Ticket CRUD ──────────────────────────────────────────────────────────────

def create_ticket(user_id: str, data: CreateTicketRequest) -> dict:
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    ticket_row = {
        "id": str(uuid4()),
        "user_id": user_id,
        "subject": data.subject,
        "message": data.message,
        "department": data.department.value,
        "status": "open",
        "priority": "medium",
        "created_at": now,
        "updated_at": now,
    }

    result = sb.table("tickets").insert(ticket_row).execute()
    return get_ticket_by_id(result.data[0]["id"])


def get_user_tickets(user_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("tickets")
        .select(_TICKET_SELECT)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [_format_ticket(t) for t in result.data]


def get_all_tickets() -> list[dict]:
    """Admin: fetch all tickets."""
    sb = get_supabase()
    result = (
        sb.table("tickets")
        .select(_TICKET_SELECT)
        .order("created_at", desc=True)
        .execute()
    )
    return [_format_ticket(t) for t in result.data]


def get_ticket_by_id(ticket_id: str) -> dict | None:
    sb = get_supabase()
    result = (
        sb.table("tickets")
        .select(_TICKET_SELECT)
        .eq("id", ticket_id)
        .execute()
    )
    return _format_ticket(result.data[0]) if result.data else None


def update_ticket_status(ticket_id: str, data: UpdateTicketStatusRequest) -> dict:
    sb = get_supabase()
    updates = {
        "status": data.status.value,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if data.priority:
        updates["priority"] = data.priority.value
    if data.assigned_to is not None:
        updates["assigned_to"] = data.assigned_to if data.assigned_to != "" else None
    if data.admin_note is not None:
        updates["admin_note"] = data.admin_note
    if data.resolution is not None:
        updates["resolution"] = data.resolution

    if data.status.value in ("resolved", "closed"):
        updates["resolved_at"] = datetime.now(timezone.utc).isoformat()
    elif data.status.value in ("open", "in_progress", "escalated"):
        updates["resolved_at"] = None

    result = sb.table("tickets").update(updates).eq("id", ticket_id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    updated_ticket = get_ticket_by_id(ticket_id)

    # Auto-notify student of status change
    try:
        if updated_ticket and updated_ticket.get("user_id"):
            notify_ticket_status_change(
                student_user_id=updated_ticket["user_id"],
                ticket_id=ticket_id,
                ticket_subject=updated_ticket.get("subject", "Support Ticket"),
                new_status=data.status.value,
            )
        # Notify assigned staff member if newly assigned
        if data.assigned_to and data.assigned_to != "":
            notify_ticket_assigned(
                staff_user_id=data.assigned_to,
                ticket_id=ticket_id,
                ticket_subject=updated_ticket.get("subject", "Support Ticket"),
            )
    except Exception:
        pass  # Don't fail the update if notification fails

    return updated_ticket


# ─── Comments ─────────────────────────────────────────────────────────────────

def add_comment(ticket_id: str, user_id: str, content: str, is_internal: bool = False) -> dict:
    """Insert a new comment into ticket_comments and return the formatted comment."""
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    # Verify ticket exists
    ticket = sb.table("tickets").select("id").eq("id", ticket_id).execute()
    if not ticket.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    row = {
        "id": str(uuid4()),
        "ticket_id": ticket_id,
        "user_id": user_id,
        "content": content,
        "is_internal": is_internal,
        "created_at": now,
    }
    result = sb.table("ticket_comments").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save comment")

    comment = result.data[0]

    # Fetch author info
    user_data = sb.table("users").select("full_name, role").eq("id", user_id).execute()
    author = user_data.data[0] if user_data.data else {}

    return {
        **comment,
        "author_name": author.get("full_name"),
        "author_role": author.get("role"),
    }


def add_comment_with_notification(
    ticket_id: str, user_id: str, content: str, is_internal: bool = False
) -> dict:
    """Add a comment and trigger a notification to the other party."""
    comment = add_comment(ticket_id, user_id, content, is_internal)

    # Only notify on public (non-internal) comments
    if not is_internal:
        try:
            ticket = get_ticket_by_id(ticket_id)
            if ticket:
                author_name = comment.get("author_name", "Someone")
                author_role = comment.get("author_role", "")
                # If staff posted → notify student owner
                if author_role in ("admin", "staff", "super_admin"):
                    notify_new_comment(
                        recipient_user_id=ticket["user_id"],
                        ticket_id=ticket_id,
                        ticket_subject=ticket.get("subject", "Support Ticket"),
                        author_name=author_name,
                    )
                else:
                    # Student posted → notify assigned staff (if any)
                    if ticket.get("assigned_to"):
                        notify_new_comment(
                            recipient_user_id=ticket["assigned_to"],
                            ticket_id=ticket_id,
                            ticket_subject=ticket.get("subject", "Support Ticket"),
                            author_name=author_name,
                        )
        except Exception:
            pass  # Don't fail the comment if notification fails

    return comment
