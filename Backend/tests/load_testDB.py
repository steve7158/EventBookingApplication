"""Utility script to populate the local SQLite test database (app.db) with sample users and events.

Run with: python -m tests.load_testDB
"""
from datetime import date, time, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import SessionLocal
from app.database.init_db import init_db
from app.models.user import User
from app.models.event import Event
from app.core.security import hash_password


def reset_db(session: Session):
    # Danger: deletes all data
    session.query(User).delete()
    session.query(Event).delete()
    session.execute(text("DELETE FROM user_events"))
    session.commit()


def seed_users(session: Session):
    users = [
    User(password_hash=hash_password("password1"), user_name="alice"),
    User(password_hash=hash_password("password2"), user_name="bob"),
    User(password_hash=hash_password("password3"), user_name="carol"),
    User(password_hash=hash_password("admin"), user_name="admin", access_level="admin"),
    ]
    session.add_all(users)
    session.commit()
    return users


def seed_events(session: Session):
    today = date.today()
    events = [
        Event(
            title="Morning Yoga",
            description="Start your day with relaxing yoga.",
            category="Cat 1",
            max_attendees=25,
            date=today,
            start_time=time(7, 0),
            end_time=time(8, 0),
        ),
        Event(
            title="Tech Talk",
            description="Latest trends in AI.",
            category="Cat 2",
            max_attendees=100,
            date=today + timedelta(days=1),
            start_time=time(17, 0),
            end_time=time(18, 30),
        ),
        Event(
            title="Cooking Workshop",
            description="Learn to make pasta from scratch.",
            category="Cat 3",
            max_attendees=15,
            date=today + timedelta(days=2),
            start_time=time(11, 0),
            end_time=time(13, 0),
        ),
    ]
    session.add_all(events)
    session.commit()
    return events


def link_users_events(session: Session, users, events):
    # Simple linking pattern
    if users and events:
        users[0].events.extend(events[:2])  # first user attends first two events
        if len(users) > 1:
            users[1].events.append(events[1])  # second user attends second
        if len(users) > 2:
            users[2].events.extend(events)  # third user attends all
        session.commit()


def main():
    init_db()
    db: Session = SessionLocal()
    try:
        reset_db(db)
        users = seed_users(db)
        events = seed_events(db)
        link_users_events(db, users, events)
        print("Seed completed. Users:")
        for u in users:
            print(f" - {u.id} (events: {[e.title for e in u.events]})")
        print("Events:")
        for e in events:
            print(f" - {e.id}: {e.title} (attendees: {len(e.users)})")
    finally:
        db.close()


if __name__ == "__main__":
    main()
