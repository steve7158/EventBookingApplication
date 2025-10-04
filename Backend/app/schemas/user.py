from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    userId: str
    passwordHash: str
    eventIds: Optional[List[str]] = None

class UserOut(BaseModel):
    id: str
    eventIds: List[str] = []

    class Config:
        from_attributes = True

class UserUpdateEvent(BaseModel):
    addEventIds: Optional[List[str]] = None
    removeEventIds: Optional[List[str]] = None
