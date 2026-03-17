"""
Auth endpoints — register, login, refresh, password reset.
"""
from fastapi import APIRouter, HTTPException, status, Request

from app.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
    UserRole,
)
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.services.user_service import create_user, get_user_by_email
from app.services.session_service import create_session, validate_session, revoke_session
from app.config import REFRESH_TOKEN_EXPIRE_DAYS
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, request: Request):
    """Create a new user account and return tokens."""
    user = create_user(data)

    tokens = _issue_tokens(user["id"], request)
    return tokens


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, request: Request):
    """Authenticate with email + password and receive tokens (Students only)."""
    user = get_user_by_email(data.email)
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Restrict to strictly students
    if user.get("role") != UserRole.STUDENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff must use the admin login portal.",
        )

    return _issue_tokens(user["id"], request)


@router.post("/admin-login", response_model=TokenResponse)
async def admin_login(data: LoginRequest, request: Request):
    """Authenticate with email + password and receive tokens (Staff/Admin only)."""
    user = get_user_by_email(data.email)
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Restrict to staff/admins
    if user.get("role") == UserRole.STUDENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Students cannot use the admin login portal.",
        )

    return _issue_tokens(user["id"], request)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshTokenRequest, request: Request):
    """Exchange a refresh token for a new access token."""
    payload = decode_token(data.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type — expected refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )

    # 1. Statefully validate the session in the database
    session = validate_session(data.refresh_token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or revoked. Please log in again.",
        )

    # 2. Revoke the old token (Refresh Token Rotation)
    revoke_session(data.refresh_token)

    # 3. Issue new tokens
    return _issue_tokens(user_id, request)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(data: RefreshTokenRequest):
    """Revoke a refresh token, ending the session."""
    revoke_session(data.refresh_token)
    return {"message": "Logged out successfully."}


@router.post("/password-reset", status_code=status.HTTP_200_OK)
async def request_password_reset(data: PasswordResetRequest):
    """Request a password reset email. Always returns 200 to avoid leaking user existence."""
    # In production: generate a reset token, send email, etc.
    # For now just acknowledge the request.
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
async def confirm_password_reset(data: PasswordResetConfirm):
    """Confirm a password reset with token + new password."""
    # In production: validate the reset token, update password
    return {"message": "Password has been reset successfully."}


# ── Helpers ──────────────────────────────────────────────────────

def _issue_tokens(user_id: str, request: Request) -> TokenResponse:
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Store session strictly in the DB
    create_session(
        user_id=user_id,
        refresh_token=refresh_token,
        request=request,
        expires_at=expires_at
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
