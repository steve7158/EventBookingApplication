# Event Booking Backend

## Endpoints

### Users
POST /users/ - createUser (userId, userName, password, optional eventIds[])
POST /users/signup - sign up with unique userName & password -> accessToken
POST /users/login - login with userName & password -> accessToken
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
