# EventBookingApplication

### Local Setup

1. Clone the repository
2. Navigate to the Backend directory
3. Create and activate a virtual environment
4. Install dependencies: `pip install -r requirements.txt`
5. Initialize the database: `python -m app.database.init_db`
6. (Optional) Load test data: `python -m tests.load_testDB`
7. Run the application: `uvicorn app.main:app --reload`
8. Navigate back to Frontend directory
9. Install frontend dependencies: `npm install`
10. Build and run frontend: `npm run build && npm start`