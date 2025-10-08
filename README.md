# EventBookingApplication

# EventBookingApplication

A full-stack event booking application built with FastAPI (backend) and Angular (frontend).

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

## 📦 Setup Instructions

### 1. Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database:
   ```bash
   python -m app.database.init_db
   ```

5. Load test data (optional):
   ```bash
   python -m tests.load_testDB
   ```

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend/event-booking-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run build && npm run start
   ```

## 🔐 Login Credentials

### Admin Account (for accessing the Admin Dashboard)
| Username | Password |
|----------|----------|
| admin    | admin    |

### Regular User Accounts
| Username | Password  |
|----------|-----------|
| alice    | password1 |
| bob      | password2 |
| carol    | password3 |

## 🌐 Access the Application

Once both backend and frontend are running:

1. Open your browser and go to **http://localhost:4200**
2. Log in using any of the above credentials
3. Backend API documentation is available at **http://localhost:8000/docs**

## 🏗️ Project Structure

```
EventBookingApplication/
├── Backend/
│   ├── app/
│   │   ├── core/          # Security utilities
│   │   ├── database/      # Database configuration
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # API endpoints
│   │   ├── schemas/       # Pydantic schemas
│   │   └── main.py        # FastAPI application
│   ├── tests/             # Test files
│   └── requirements.txt   # Python dependencies
└── Frontend/
    └── event-booking-app/
        ├── src/
        │   ├── app/
        │   │   ├── components/
        │   │   ├── models/
        │   │   └── services/
        └── package.json   # Node.js dependencies
```

## 🔧 Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Database
- **JWT** - Authentication
- **Pydantic** - Data validation

### Frontend
- **Angular** - Frontend framework
- **TypeScript** - Programming language
- **SCSS** - Styling

## 📚 API Features

- User authentication (signup/login)
- Event management (CRUD operations)
- User-event relationships (many-to-many)
- Admin dashboard functionality
- Real-time attendee tracking
- Category-based event filtering
