from sqlalchemy import Column, String, Table, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.session import Base
import uuid

# Association table for many-to-many between users and events (list of eventIds per user)
user_events = Table(
    "user_events",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id"), primary_key=True),
    Column("event_id", String, ForeignKey("events.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("user_name", name="uq_users_user_name"),
    )
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    password_hash = Column(String, nullable=False)
    # Optional display / login name for the user
    user_name = Column(String, nullable=False, index=True)
    # Access level for the user (e.g., 'user', 'admin')
    access_level = Column(String, nullable=False, default='user')
    # events: list of Event objects (we'll expose only their IDs via API)
    events = relationship("Event", secondary=user_events, back_populates="users")
