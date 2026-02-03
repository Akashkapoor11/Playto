# Deployment Guide

This guide provides step-by-step instructions for deploying the Playto Community Feed to production using Render (backend) and Vercel (frontend).

## Prerequisites

- GitHub account
- Render account (free tier available)
- Vercel account (free tier available)
- Your code pushed to a GitHub repository

## Part 1: Deploy Backend to Render

### Step 1: Create PostgreSQL Database

1. Log into [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   - **Name:** `playto-db`
   - **Database:** `playto`
   - **User:** `playto`
   - **Region:** Choose closest to your users
   - **Plan:** Free
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (you'll need this later)

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure service:
   - **Name:** `playto-backend` (or your preferred name)
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application`
   - **Plan:** Free

### Step 3: Set Environment Variables

In the "Environment" section, add these variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (Paste Internal Database URL from Step 1) |
| `DJANGO_SECRET_KEY` | (Generate a secure random string - see below) |
| `DJANGO_DEBUG` | `False` |
| `FRONTEND_URL` | (Leave blank for now, update after frontend deployment) |
| `RENDER` | `true` |

**Generate a secure SECRET_KEY:**
```python
# Run this in Python shell
import secrets
print(secrets.token_urlsafe(50))
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `build.sh` (install deps, migrate DB, collect static files)
   - Start the Gunicorn server
3. Wait for deployment to complete (5-10 minutes)
4. Your backend URL will be: `https://playto-backend.onrender.com`

### Step 5: Create Superuser

1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   python manage.py createsuperuser
   ```
4. Follow prompts to create admin account

### Step 6: Verify Backend

Visit these URLs to verify:
- `https://your-app.onrender.com/api/feed/` → Should return `[]` (empty feed)
- `https://your-app.onrender.com/api/leaderboard/` → Should return `[]`
- `https://your-app.onrender.com/admin/` → Should show Django admin login

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Import Project

1. Log into [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `build` (auto-detected)

### Step 2: Set Environment Variable

In the "Environment Variables" section:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://your-backend.onrender.com/api` |

Replace `your-backend` with your actual Render backend URL from Part 1.

### Step 3: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install npm dependencies
   - Build the React app
   - Deploy to CDN
3. Wait for deployment (2-3 minutes)
4. Your frontend URL will be: `https://your-app.vercel.app`

---

## Part 3: Connect Frontend and Backend

### Update Backend CORS Settings

1. Go back to Render dashboard
2. Open your backend web service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy

### Verify Integration

1. Visit your Vercel frontend URL
2. You should see the Playto Community Feed
3. The leaderboard should show "No activity in last 24 hours"
4. Open browser console - no CORS errors should appear

---

## Part 4: Add Test Data

### Via Django Admin

1. Visit `https://your-backend.onrender.com/admin/`
2. Log in with superuser credentials
3. Create some test posts:
   - Click **"Posts"** → **"Add Post"**
   - Select your user as author
   - Add content
   - Save
4. Refresh your frontend - posts should appear!

### Create Test Users and Likes

1. In Django admin, create a few test users
2. Create posts from different users
3. Add comments to posts
4. Create likes (you'll need to log in as different users in the admin)
5. Verify the leaderboard updates with karma scores

---

## Troubleshooting

### Backend Issues

**"Application failed to respond"**
- Check Render logs for errors
- Verify `DATABASE_URL` is set correctly
- Ensure `build.sh` has execute permissions: `chmod +x backend/build.sh`

**"DisallowedHost" error**
- Verify `RENDER_EXTERNAL_HOSTNAME` matches your Render URL
- Check `ALLOWED_HOSTS` in settings.py

**Database connection errors**
- Ensure database is in the same region as web service
- Verify `DATABASE_URL` is the **Internal** URL, not External

### Frontend Issues

**"Failed to fetch feed"**
- Check `REACT_APP_API_URL` is set correctly in Vercel
- Verify backend is running and accessible
- Check browser console for CORS errors

**CORS errors**
- Ensure `FRONTEND_URL` is set in Render backend
- Verify it matches your Vercel URL exactly (including `https://`)
- Redeploy backend after updating `FRONTEND_URL`

**Blank page**
- Check Vercel build logs for errors
- Verify `frontend` is set as root directory
- Ensure `package.json` has correct build script

### General Tips

- **Free tier limitations:** Render free tier spins down after 15 minutes of inactivity. First request may be slow.
- **Logs:** Always check deployment logs in Render/Vercel for detailed error messages
- **Environment variables:** Changes require redeployment to take effect

---

## Optional: Custom Domain

### Vercel (Frontend)

1. Go to project settings → **"Domains"**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in Render backend

### Render (Backend)

1. Go to web service settings → **"Custom Domain"**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `REACT_APP_API_URL` in Vercel frontend

---

## Next Steps

- Set up continuous deployment (auto-deploy on git push)
- Add monitoring and error tracking (e.g., Sentry)
- Configure custom domains
- Set up automated backups for PostgreSQL
- Add rate limiting for API endpoints
- Implement proper authentication (OAuth, JWT)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render/Vercel documentation
3. Check Django and React logs for specific errors
4. Verify all environment variables are set correctly
