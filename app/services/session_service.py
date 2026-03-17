"""
Database session tracking.
"""
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import Request

from app.database.database import get_supabase

def create_session(user_id: str, refresh_token: str, request: Request, expires_at: datetime) -> None:
    """Register a newly issued refresh token in the database."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    sb = get_supabase()
    
    session_row = {
        "id": str(uuid4()),
        "user_id": user_id,
        "refresh_token": refresh_token,
        "ip_address": client_ip,
        "user_agent": user_agent,
        "is_active": True,
        "expires_at": expires_at.isoformat(),
        "last_used_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    sb.table("sessions").insert(session_row).execute()


def validate_session(refresh_token: str) -> dict | None:
    """
    Check if a refresh token is valid and active in the database.
    Updates the 'last_used_at' timestamp if valid.
    Returns the session row if valid, None otherwise.
    """
    sb = get_supabase()
    now = datetime.now(timezone.utc)
    
    # Check token exists, is active, and hasn't expired yet
    res = sb.table("sessions").select("*").eq("refresh_token", refresh_token).eq("is_active", True).execute()
    
    if not res.data:
        return None
        
    session = res.data[0]
    
    # Parse expiration to ensure it hasn't expired
    expires_at = datetime.fromisoformat(session["expires_at"].replace("Z", "+00:00"))
    if now > expires_at:
        # Auto-revoke expired token
        revoke_session(refresh_token)
        return None
        
    # Update last used
    sb.table("sessions").update({"last_used_at": now.isoformat()}).eq("id", session["id"]).execute()
    
    return session


def revoke_session(refresh_token: str) -> None:
    """Mark a specific refresh token as inactive (Logout)."""
    sb = get_supabase()
    sb.table("sessions").update({"is_active": False}).eq("refresh_token", refresh_token).execute()


def revoke_all_sessions(user_id: str) -> None:
    """Log a user out of all devices by marking all their sessions inactive."""
    sb = get_supabase()
    sb.table("sessions").update({"is_active": False}).eq("user_id", user_id).execute()
