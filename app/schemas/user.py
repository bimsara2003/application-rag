"""
Pydantic schemas for User profiles and roles.
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum
from typing import Optional


class UserRole(str, Enum):
    STUDENT = "student"
    STAFF = "staff"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class Faculty(str, Enum):
    COMPUTING = "computing"
    BUSINESS = "business"
    ENGINEERING = "engineering"
    HUMANITIES = "humanities"


class Campus(str, Enum):
    MALABE = "malabe"
    METRO = "metro"
    MATARA = "matara"
    KANDY = "kandy"
    KURUNEGALA = "kurunegala"
    JAFFNA = "jaffna"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.STUDENT


class StudentProfile(BaseModel):
    registration_number: str
    faculty: Faculty
    campus: Campus

    model_config = {"from_attributes": True}


class StaffProfile(BaseModel):
    employee_id: str
    department: str
    position: Optional[str] = None

    model_config = {"from_attributes": True}


class UserResponse(UserBase):
    """Returned to the client (never includes password)."""
    id: str
    is_active: bool = True
    is_verified: bool = False
    profile_picture: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Nested profiles based on role
    student_profile: Optional[StudentProfile] = None
    staff_profile: Optional[StaffProfile] = None

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    """Fields a user can update on their own profile."""
    full_name: Optional[str] = Field(None, min_length=3, max_length=100)
    phone: Optional[str] = Field(None, pattern=r"^\+94\d{9}$")
    profile_picture: Optional[str] = None
    
    # Profile specific
    faculty: Optional[Faculty] = None
    campus: Optional[Campus] = None
    department: Optional[str] = None
    position: Optional[str] = None


class AdminUserUpdateRequest(UserUpdateRequest):
    """Extra fields only admins can change."""
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class CreateStaffRequest(BaseModel):
    """Schema for admins to create a new staff/admin user."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.STAFF
    employee_id: str = Field(..., min_length=1)
    department: str = Field(..., min_length=1)
    position: Optional[str] = None
