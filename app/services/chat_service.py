"""
Chat service – manages chat sessions and messages in Supabase.
"""
from app.database.database import get_supabase


def create_session(user_id: str, title: str = None) -> dict:
    """Create a new chat session."""
    data = {"user_id": user_id}
    if title:
        data["title"] = title
    result = get_supabase().table("chat_sessions").insert(data).execute()
    return result.data[0] if result.data else None


def list_sessions(user_id: str) -> list[dict]:
    """List all chat sessions for a user, newest first."""
    result = (
        get_supabase().table("chat_sessions")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


def get_session(session_id: str) -> dict | None:
    """Get a single chat session."""
    result = (
        get_supabase().table("chat_sessions")
        .select("*")
        .eq("id", session_id)
        .single()
        .execute()
    )
    return result.data


def save_message(
    session_id: str,
    role: str,
    content: str,
    source_documents: list | None = None,
    confidence_score: float | None = None,
) -> dict:
    """Save a chat message."""
    import json

    data = {
        "session_id": session_id,
        "role": role,
        "content": content,
    }
    if source_documents is not None:
        data["source_documents"] = json.dumps(source_documents) if isinstance(source_documents, list) else source_documents
    if confidence_score is not None:
        data["confidence_score"] = confidence_score

    result = get_supabase().table("chat_messages").insert(data).execute()
    return result.data[0] if result.data else None


def get_messages(session_id: str) -> list[dict]:
    """Get all messages for a session, oldest first."""
    result = (
        get_supabase().table("chat_messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data or []


def update_session_title(session_id: str, title: str) -> dict | None:
    """Update session title (auto-set from first question)."""
    result = (
        get_supabase().table("chat_sessions")
        .update({"title": title})
        .eq("id", session_id)
        .execute()
    )
    return result.data[0] if result.data else None


def end_session(session_id: str) -> dict | None:
    """Mark a session as ended."""
    from datetime import datetime, timezone

    result = (
        get_supabase().table("chat_sessions")
        .update({"is_active": False, "ended_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", session_id)
        .execute()
    )
    return result.data[0] if result.data else None
