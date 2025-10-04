from fastapi import FastAPI
from app.routers import users, events

app = FastAPI(title="Event Booking API")

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(events.router, prefix="/events", tags=["events"])

@app.get("/health")
async def health():
    return {"status": "ok"}
