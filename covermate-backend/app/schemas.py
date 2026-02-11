from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional, Dict


# ----------- Base User Schema -----------
class UserBase(BaseModel):
    name: str
    email: EmailStr
    dob: Optional[date] = None


# ----------- Signup Schema -----------
class UserCreate(UserBase):
    password: str


# ----------- Login Schema -----------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ----------- Response Schema -----------
class UserResponse(UserBase):
    id: int
    risk_profile: Optional[Dict] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[date] = None
    risk_profile: Optional[Dict] = None
