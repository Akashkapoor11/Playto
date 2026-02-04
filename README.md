# Playto Community Feed

A full-stack community feed application with threaded discussions and a dynamic leaderboard, built for the Playto Engineering Challenge.

##  Features

- **Threaded Comments**: Reddit-style nested comment threads with unlimited depth
- **Gamification System**: 
  - Post likes = 5 karma points
  - Comment likes = 1 karma point
- **Live Leaderboard**: Top 5 users based on karma earned in the last 24 hours
- **Race Condition Protection**: Database-level constraints prevent double-likes
- **Efficient Queries**: Optimized to avoid N+1 query problems

##  Tech Stack

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL (production) / SQLite (development)
- Gunicorn + WhiteNoise

**Frontend:**
- React 18
- Tailwind CSS
- Create React App

## Deployment Link
-Frontend= https://playto-seven.vercel.app/
-Backend= https://playto-5.onrender.com/admin

##  Local Development Setup

### Backend

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create superuser (for admin access):**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start development server:**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at `http://127.0.0.1:8000/`
   Admin panel at `http://127.0.0.1:8000/admin/`

### Frontend

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

   Frontend will be available at `http://localhost:3000/`

### Testing

Run the Django test suite:
```bash
cd backend
python manage.py test
```

##  Production Deployment

### Backend Deployment (Render)

1. **Push your code to GitHub**

2. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Select the `backend` directory as the root
   - Build Command: `./backend/build.sh`
   - Start Command: `cd backend && gunicorn config.wsgi:application`

3. **Add a PostgreSQL database:**
   - Create a new PostgreSQL database in Render
   - Copy the Internal Database URL

4. **Set environment variables:**
   ```
   DATABASE_URL=<your-postgres-internal-url>
   DJANGO_SECRET_KEY=<generate-a-secure-random-key>
   DJANGO_DEBUG=False
   FRONTEND_URL=https://your-frontend.vercel.app
   RENDER=true
   RENDER_EXTERNAL_HOSTNAME=<your-app-name>.onrender.com
   ```

5. **Deploy!** Render will automatically build and deploy your backend.

6. **Create a superuser** (via Render Shell):
   ```bash
   python manage.py createsuperuser
   ```

### Frontend Deployment (Vercel)

1. **Push your code to GitHub**

2. **Import project to Vercel:**
   - Connect your GitHub repository
   - Set Root Directory to `frontend`
   - Framework Preset: Create React App

3. **Set environment variable:**
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```

4. **Deploy!** Vercel will automatically build and deploy your frontend.

5. **Update backend CORS settings:**
   - After deployment, copy your Vercel URL
   - Update the `FRONTEND_URL` environment variable in Render
   - Redeploy the backend

##  API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/feed/` | Get all posts with nested comments | No |
| GET | `/api/leaderboard/` | Get top 5 users (24h karma) | No |
| POST | `/api/posts/` | Create a new post | Yes |
| POST | `/api/posts/<id>/like/` | Like a post | Yes |
| POST | `/api/posts/<id>/comments/` | Add comment to post | Yes |
| POST | `/api/comments/<id>/like/` | Like a comment | Yes |

##  Architecture Highlights

### Nested Comments (The Tree)
- Uses **adjacency list** model with `parent` foreign key
- Single query fetches all comments for visible posts
- In-memory tree construction in serializer
- Avoids N+1 query problem

### Leaderboard (The Math)
- **Event-sourced** from `Like` table (no stored karma field)
- Dynamic aggregation with time-window filtering
- Uses Django ORM `Case/When` for conditional karma values
- Prevents race conditions with database-level unique constraints

### Concurrency Protection
- Database unique constraints on `(user, post)` and `(user, comment)`
- Atomic transactions for like operations
- `IntegrityError` handling prevents double-likes

##  Notes

- **Session Authentication**: To test Like endpoints locally, log into Django admin (`/admin/`) in the same browser
- **CORS**: Backend allows cross-origin requests from the frontend URL
- **Static Files**: Served via WhiteNoise in production

