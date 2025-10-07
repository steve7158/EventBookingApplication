from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    max_attendees: int
    date: date
    start_time: time
    end_time: time

class EventOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    max_attendees: int
    date: date
    start_time: time
    end_time: time

    class Config:
        from_attributes = True
