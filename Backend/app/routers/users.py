from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.event import Event
from app.schemas.user import UserCreate, UserOut, UserUpdateEvent
from app.core.security import hash_password, decode_token
from fastapi import Header

router = APIRouter()

# Simple token auth using Authorization: Bearer <userId> for demo (should use JWT in prod)
async def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("/", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.id == payload.userId).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = User(id=payload.userId, password_hash=payload.passwordHash)
    if payload.eventIds:
        events = db.query(Event).filter(Event.id.in_(payload.eventIds)).all()
        missing = set(payload.eventIds) - {e.id for e in events}
        if missing:
            raise HTTPException(status_code=404, detail=f"Events not found: {','.join(missing)}")
        user.events = events
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, eventIds=[e.id for e in user.events])

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(id=user.id, eventIds=[e.id for e in user.events])

@router.put("/{user_id}/events", response_model=UserOut)
def update_user_events(user_id: str, payload: UserUpdateEvent, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Add events
    if payload.addEventIds:
        events_to_add = db.query(Event).filter(Event.id.in_(payload.addEventIds)).all()
        missing = set(payload.addEventIds) - {e.id for e in events_to_add}
        if missing:
            raise HTTPException(status_code=404, detail=f"Events not found: {','.join(missing)}")
        for e in events_to_add:
            if e not in user.events:
                user.events.append(e)

    # Remove events
    if payload.removeEventIds:
        user.events = [e for e in user.events if e.id not in set(payload.removeEventIds)]

    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, eventIds=[e.id for e in user.events])
