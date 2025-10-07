from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventOut
from app.models.user import User
from app.core.security import decode_token

router = APIRouter()

async def require_auth(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    user_id = decode_token(token)
    print('user_id:', user_id)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("/", response_model=EventOut, status_code=201, dependencies=[Depends(require_auth)])
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    event = Event(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        max_attendees=payload.max_attendees,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/getAllEvents", response_model=list[EventOut])
def get_all_events(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    if not events:
        raise HTTPException(status_code=404, detail="No events found")
    for event in events:
        event.attendeeCount = len(event.users)
    return events

@router.get('/get_by_category/{categories}', response_model=list[EventOut])
def get_events_by_category(categories: str, db: Session = Depends(get_db)):
    # Split categories by comma and strip whitespace
    category_list = [cat.strip() for cat in categories.split(',')]
    
    events = db.query(Event).filter(Event.category.in_(category_list)).all()
    if not events:
        raise HTTPException(status_code=404, detail="No events found for the specified categories")
    for event in events:
        event.attendeeCount = len(event.users)
    return events

@router.get("/get_by_id/{event_id}", response_model=EventOut)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
