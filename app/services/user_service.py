"""
User CRUD operations against Supabase.
"""
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import HTTPException, status
from app.database.database import get_supabase
from app.schemas import RegisterRequest, UserUpdateRequest, AdminUserUpdateRequest
from app.services.auth_service import hash_password


def create_user(data: RegisterRequest) -> dict:
    """Register a new student user. Returns the created row with profile."""
    sb = get_supabase()

    # Check for duplicate email
    existing = sb.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Check for duplicate registration number
    existing_reg = (
        sb.table("student_profiles")
        .select("id")
        .eq("registration_number", data.registration_number)
        .execute()
    )
    if existing_reg.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Registration number already in use",
        )

    now = datetime.now(timezone.utc).isoformat()
    user_id = str(uuid4())
    
    # 1. Insert Base User
    user_row = {
        "id": user_id,
        "email": data.email,
        "hashed_password": hash_password(data.password),
        "full_name": data.full_name,
        "phone": data.phone,
        "role": "student",
        "is_active": True,
        "is_verified": False,
        "profile_picture": None,
        "created_at": now,
        "updated_at": now,
    }
    sb.table("users").insert(user_row).execute()

    # 2. Insert Student Profile
    student_profile_row = {
        "id": str(uuid4()),
        "user_id": user_id,
        "registration_number": data.registration_number,
        "faculty": data.faculty.value,
        "campus": data.campus.value,
        "created_at": now,
        "updated_at": now,
    }
    sb.table("student_profiles").insert(student_profile_row).execute()

    return _get_user_with_profile(user_id)


def _get_user_with_profile(user_id: str) -> dict | None:
    """Helper to fetch a user and their corresponding profile."""
    sb = get_supabase()
    user_res = sb.table("users").select("*").eq("id", user_id).execute()
    if not user_res.data:
        return None
        
    user = user_res.data[0]
    
    if user["role"] == "student":
        prof_res = sb.table("student_profiles").select("registration_number, faculty, campus").eq("user_id", user_id).execute()
        if prof_res.data:
            user["student_profile"] = prof_res.data[0]
    else:
        prof_res = sb.table("staff_profiles").select("employee_id, department, position").eq("user_id", user_id).execute()
        if prof_res.data:
            user["staff_profile"] = prof_res.data[0]
            
    return user


def get_user_by_email(email: str) -> dict | None:
    sb = get_supabase()
    result = sb.table("users").select("id").eq("email", email).execute()
    if not result.data:
        return None
    return _get_user_with_profile(result.data[0]["id"])


def get_user_by_id(user_id: str) -> dict | None:
    return _get_user_with_profile(user_id)


def update_user(user_id: str, data: UserUpdateRequest | AdminUserUpdateRequest) -> dict:
    sb = get_supabase()
    
    # We must fetch the user to know their role and whether to update a profile table
    user_res = sb.table("users").select("role").eq("id", user_id).execute()
    if not user_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    role = user_res.data[0]["role"]

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

    # Identify which columns belong to the base 'users' table
    base_user_fields = {"full_name", "phone", "profile_picture", "role", "is_active", "is_verified"}
    
    base_updates = {k: v for k, v in updates.items() if k in base_user_fields}
    profile_updates = {k: v for k, v in updates.items() if k not in base_user_fields}

    now = datetime.now(timezone.utc).isoformat()
    
    # Update base users table if needed
    if base_updates:
        base_updates["updated_at"] = now
        sb.table("users").update(base_updates).eq("id", user_id).execute()
        
    # Update profile table if needed
    if profile_updates:
        profile_updates["updated_at"] = now
        if role == "student":
            sb.table("student_profiles").update(profile_updates).eq("user_id", user_id).execute()
        elif role in ("staff", "admin", "super_admin"):
            sb.table("staff_profiles").update(profile_updates).eq("user_id", user_id).execute()

    return _get_user_with_profile(user_id)


def list_all_users() -> list[dict]:
    """Return all users with their profiles (admin use)."""
    sb = get_supabase()
    result = sb.table("users").select("*").order("created_at", desc=True).execute()
    users = []
    for u in result.data:
        uid = u["id"]
        if u["role"] == "student":
            prof = sb.table("student_profiles").select("registration_number, faculty, campus").eq("user_id", uid).execute()
            if prof.data:
                u["student_profile"] = prof.data[0]
        else:
            prof = sb.table("staff_profiles").select("employee_id, department, position").eq("user_id", uid).execute()
            if prof.data:
                u["staff_profile"] = prof.data[0]
        users.append(u)
    return users


def create_staff_user(email: str, full_name: str, password: str, role: str, employee_id: str, department: str, position: str | None = None) -> dict:
    """Create a staff/admin user with staff_profile."""
    sb = get_supabase()

    existing = sb.table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    now = datetime.now(timezone.utc).isoformat()
    user_id = str(uuid4())

    user_row = {
        "id": user_id,
        "email": email,
        "hashed_password": hash_password(password),
        "full_name": full_name,
        "role": role,
        "is_active": True,
        "is_verified": True,
        "created_at": now,
        "updated_at": now,
    }
    sb.table("users").insert(user_row).execute()

    staff_row = {
        "id": str(uuid4()),
        "user_id": user_id,
        "employee_id": employee_id,
        "department": department,
        "position": position,
        "created_at": now,
        "updated_at": now,
    }
    sb.table("staff_profiles").insert(staff_row).execute()

    return _get_user_with_profile(user_id)


def delete_user(user_id: str) -> bool:
    """Delete a user and their profile. Returns True on success."""
    sb = get_supabase()

    user_res = sb.table("users").select("role").eq("id", user_id).execute()
    if not user_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    role = user_res.data[0]["role"]

    # Delete profile first (FK constraint)
    if role == "student":
        sb.table("student_profiles").delete().eq("user_id", user_id).execute()
    else:
        sb.table("staff_profiles").delete().eq("user_id", user_id).execute()

    # Delete related data
    sb.table("notifications").delete().eq("user_id", user_id).execute()
    sb.table("sessions").delete().eq("user_id", user_id).execute()

    # Delete user
    sb.table("users").delete().eq("id", user_id).execute()
    return True
