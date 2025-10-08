from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    userId: str
    userName: str  # required
    password: str  # required plain password to be hashed server-side
    eventIds: Optional[List[str]] = None

class UserOut(BaseModel):
    id: str
    userName: Optional[str] = None
    eventIds: List[str] = []

    class Config:
        from_attributes = True

class UserUpdateEvent(BaseModel):
    addEventIds: Optional[List[str]] = None
    removeEventIds: Optional[List[str]] = None


class SignUpRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    userId: str
    userName: str
    accessLevel: str
