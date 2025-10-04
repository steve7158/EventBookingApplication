# Event Booking Backend

## Endpoints

### Users
POST /users/ - createUser (userId, passwordHash, optional eventIds[])
GET /users/{userId} - getUser (auth required)
PUT /users/{userId}/events - updateUserEvents (add/remove lists) (auth required)

### Events
POST /events/ - createEvent (auth required)
GET /events/{eventId} - getEvent

### Auth
A simplified auth is implemented using JWT tokens. After creating a user you can manually create a token using the `userId` as subject (a real login endpoint not yet implemented). Use the helper in `app/core/security.py` or add a proper login route as a next step.

User object now returns an array `eventIds` containing the events associated to the user.

### Run
```
uvicorn app.main:app --reload
```

### Initialize DB
```
python -m app.database.init_db
```
