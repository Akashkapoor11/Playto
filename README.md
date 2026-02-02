# Playto Community Feed (Full)
## Backend
1. Create virtualenv
   python -m venv venv
   source venv/bin/activate
2. Install requirements
   pip install -r backend/requirements.txt
3. Run migrations and server
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
## Frontend
1. Install deps
   cd frontend
   npm install
2. Start
   npm start
## Notes
- Login to Django admin in same browser to use Like endpoints (session auth via cookies).
