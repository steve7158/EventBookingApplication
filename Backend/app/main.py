from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, events

app = FastAPI(title="Event Booking API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers including Authorization
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(events.router, prefix="/events", tags=["events"])

@app.get("/health")
async def health():
    return {"status": "ok"}
