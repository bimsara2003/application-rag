"""
User profile endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas import (
    UserResponse,
    UserUpdateRequest,
    AdminUserUpdateRequest,
    ChangePasswordRequest,
)
from app.schemas.user import CreateStaffRequest
from app.services.auth_service import (
    get_current_user,
    hash_password,
    verify_password,
)
from app.services.user_service import (
    get_user_by_id,
    update_user,
    list_all_users,
    create_staff_user,
    delete_user,
)
from app.database.database import get_supabase

router = APIRouter(prefix="/users", tags=["Users"])


# ── Self-service endpoints ──────────────────────────────────────

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get the authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    data: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update the authenticated user's own profile."""
    return update_user(current_user["id"], data)


@router.put("/me/password")
async def change_my_password(
    data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    """Change the authenticated user's password."""
    if not verify_password(data.current_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    sb = get_supabase()
    sb.table("users").update(
        {"hashed_password": hash_password(data.new_password)}
    ).eq("id", current_user["id"]).execute()

    return {"message": "Password updated successfully"}


# ── Admin endpoints ──────────────────────────────────────────────

def _require_admin(user: dict):
    if user.get("role") not in ("admin", "super_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


@router.get("/", response_model=list[UserResponse])
async def list_users(current_user: dict = Depends(get_current_user)):
    """List all users (admin only)."""
    _require_admin(current_user)
    return list_all_users()


@router.post("/staff", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(
    data: CreateStaffRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new staff/admin user (admin only)."""
    _require_admin(current_user)
    return create_staff_user(
        email=data.email,
        full_name=data.full_name,
        password=data.password,
        role=data.role.value,
        employee_id=data.employee_id,
        department=data.department,
        position=data.position,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get a user by ID (admin only)."""
    _require_admin(current_user)
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_id: str,
    data: AdminUserUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update any user's profile (admin only)."""
    _require_admin(current_user)
    return update_user(user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def admin_delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a user (admin only). Cannot delete yourself."""
    _require_admin(current_user)
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    delete_user(user_id)
    return {"message": "User deleted successfully"}
