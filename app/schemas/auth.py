"""
Pydantic schemas for Auth and Sessions.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.schemas.user import Faculty, Campus

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    registration_number: str = Field(..., pattern=r"^[A-Z]{2}\d{8}$", description="e.g. IT24103190")
    faculty: Faculty
    campus: Campus
    phone: Optional[str] = Field(None, pattern=r"^\+?\d{9,15}$", description="e.g. +94771234567 or 0771234567")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Seconds until access token expires")

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
