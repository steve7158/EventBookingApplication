from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.event import Event
from app.schemas.user import UserCreate, UserOut, UserUpdateEvent, SignUpRequest, LoginRequest, AuthResponse
from app.schemas.event import EventOut
from app.core.security import hash_password, verify_password, decode_token, create_access_token
from fastapi import Header
from typing import List

router = APIRouter()

# Simple token auth using Authorization: Bearer <userId> for demo (should use JWT in prod)
async def get_current_user(authorization: str = Header(None, alias="Authorization"), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        print('logger info: ', authorization)
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
    # Support optional user_name if provided in payload (ignore if not present to keep backward compat)
    user = User(
        id=payload.userId,
        user_name=payload.userName,
        password_hash=hash_password(payload.password),
    )
    if payload.eventIds:
        events = db.query(Event).filter(Event.id.in_(payload.eventIds)).all()
        missing = set(payload.eventIds) - {e.id for e in events}
        if missing:
            raise HTTPException(status_code=404, detail=f"Events not found: {','.join(missing)}")
        user.events = events
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, userName=user.user_name, eventIds=[e.id for e in user.events])


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(payload: SignUpRequest, db: Session = Depends(get_db)):
    # Ensure unique user_name
    existing = db.query(User).filter(User.user_name == payload.userName).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(user_name=payload.userName, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return AuthResponse(accessToken=token, userId=user.id, userName=user.user_name, accessLevel=user.access_level)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_name == payload.userName).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.id)
    return AuthResponse(accessToken=token, userId=user.id, userName=user.user_name, accessLevel=user.access_level)

@router.get("/{user_id}/getUserEvents", response_model=List[EventOut])
def get_user_events(user_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return all events associated with this user
    return user.events

@router.put("/{user_id}/updateUserEvents", response_model=UserOut)
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
    return UserOut(id=user.id, userName=user.user_name, eventIds=[e.id for e in user.events])

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(id=user.id, userName=user.user_name, eventIds=[e.id for e in user.events])

