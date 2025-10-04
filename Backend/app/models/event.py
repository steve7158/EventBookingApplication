from sqlalchemy import Column, String, Integer, Date, Time
from sqlalchemy.orm import relationship
from app.database.session import Base
import uuid
from .user import user_events  # circular-safe import for association table


class Event(Base):
    __tablename__ = "events"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=True)
    max_attendees = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    users = relationship("User", secondary=user_events, back_populates="events")
