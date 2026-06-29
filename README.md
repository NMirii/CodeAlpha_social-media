# 🌿 SocialApp — Full-Stack Social Media Platform

A modern social media application built with **Next.js 14** (frontend) and **Django REST Framework** (backend), backed by **Supabase PostgreSQL**.

---

## ✨ Features

- 📝 Create, delete and like posts with image support
- 💬 Nested comments with likes
- 🔔 **Real-time notifications** — like, comment, follow events
- 👥 Follow / unfollow users
- 🔍 Explore & search posts and people
- 👤 Editable user profiles
- 📱 Fully responsive with mobile bottom navigation
- 🎨 Clean white & green design system

---

## 🛠 Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | Next.js 14, TypeScript, Tailwind CSS |
| Backend   | Django 4.2, Django REST Framework  |
| Database  | PostgreSQL (Supabase)              |
| Auth      | Token-based (DRF AuthToken)        |
| Deploy FE | Vercel                             |
| Deploy BE | Railway / Render                   |

---

## 🚀 Local Development

### Backend

```bash
cd socialmedia_backend
pip install -r requirements.txt

# Copy env and fill in your Supabase credentials
cp .env.example .env

python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd socialmedia_frontend
npm install

# Copy env
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm run dev
```

---

## ☁️ Deployment

### Frontend → Vercel

1. Push this repo to GitHub
2. Import the `socialmedia_frontend` folder on [vercel.com](https://vercel.com)
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.railway.app/api
   ```
4. Deploy ✅

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `socialmedia_backend` folder as root
3. Set environment variables:
   ```
   SECRET_KEY       = <generate a strong key>
   DEBUG            = False
   ALLOWED_HOSTS    = your-app.railway.app
   DB_NAME          = postgres
   DB_USER          = postgres.xxxx
   DB_PASSWORD      = <supabase password>
   DB_HOST          = aws-1-xx.pooler.supabase.com
   DB_PORT          = 6543
   DB_SSLMODE       = require
   CORS_ALLOWED_ORIGINS = https://your-app.vercel.app
   ```
4. Railway auto-detects `Procfile` and runs Gunicorn ✅
5. Run migrations: Railway → New Service → Railway CLI → `python manage.py migrate`

---

## 🔑 Environment Variables

### Backend `.env`
```
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-backend.railway.app,localhost
DB_NAME=postgres
DB_USER=postgres.xxxxx
DB_PASSWORD=your-db-password
DB_HOST=aws-1-xx.pooler.supabase.com
DB_PORT=6543
DB_SSLMODE=require
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

## 📁 Project Structure

```
fullstack_social_media/
├── socialmedia_backend/      # Django API
│   ├── posts/                # Post, Comment, Like, Notification models
│   ├── users/                # User, Follow models + auth
│   ├── requirements.txt
│   └── Procfile              # Gunicorn for Railway/Render
│
└── socialmedia_frontend/     # Next.js app
    ├── src/app/              # Pages (feed, explore, profile, notifications)
    ├── src/components/       # Reusable components
    ├── src/lib/api.ts        # Axios API client
    └── vercel.json           # Vercel deployment config
```
