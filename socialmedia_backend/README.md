# CodeAlpha Social Media Platform — Backend API

This is the backend REST API for the CodeAlpha Social Media Platform. It is built using **Django** and **Django REST Framework (DRF)**, utilizing **PostgreSQL** (via Supabase) for data storage. The API provides robust endpoints for user authentication, post creation, nested comments, followers, and a fully automated notification system driven by Django Signals.

## 🚀 Key Features

*   **Robust Authentication:** Secure Token-based authentication using `rest_framework.authtoken`.
*   **Relational Database Models:** Well-structured models for Users, Posts, Comments, Likes, Follows, and Notifications.
*   **Event-Driven Architecture:** Uses Django `post_save` and `post_delete` signals to automatically trigger and manage real-time notifications without tightly coupling the business logic.
*   **Optimized Queries:** Heavy use of `select_related` and `prefetch_related` in serializers to eliminate N+1 query problems and ensure high performance even with large datasets.
*   **Production Ready:** Configured with `gunicorn` for process management and `whitenoise` for serving static assets securely in production environments like Vercel or Railway.

## 🛠️ Technology Stack

*   **Framework:** Django 4.2
*   **API Layer:** Django REST Framework
*   **Database:** PostgreSQL (Supabase)
*   **Authentication:** DRF Token Authentication
*   **CORS Management:** django-cors-headers
*   **Environment Management:** python-decouple
*   **Deployment Server:** Gunicorn & WhiteNoise

## 📁 Architecture & Apps

The backend is split into logically separated Django apps:

1.  **`users/`**
    *   Custom `User` model extending `AbstractUser`.
    *   `Follow` model for many-to-many user relationships (Followers/Following).
    *   Endpoints for Auth (Register, Login, Me), Profiles, and Search.
2.  **`posts/`**
    *   Models for `Post`, `Comment`, `Like`, and `Notification`.
    *   Handles the main feed generation (personalized based on followed users).
    *   Signals (`signals.py`) to automate notification generation upon likes, comments, and follows.

## 💻 Local Development Setup

### 1. Prerequisites
Ensure you have **Python 3.10+** installed.

### 2. Install Dependencies
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the same directory as `manage.py` and configure your database (e.g., Supabase PostgreSQL):

```env
SECRET_KEY=your-super-secret-key
DEBUG=True
ALLOWED_HOSTS=*
DB_NAME=postgres
DB_USER=postgres.your_supabase_ref
DB_PASSWORD=your_supabase_password
DB_HOST=aws-0-region.pooler.supabase.com
DB_PORT=6543
```

### 4. Migrate and Run
Apply the migrations to build the tables in your PostgreSQL database, then run the server:

```bash
python manage.py migrate
python manage.py runserver
```

The server will start on `http://127.0.0.1:8000/`.

## 📡 API Endpoints

### Auth & Users (`/api/auth/` & `/api/users/`)
*   `POST /api/auth/register/` - Register a new user
*   `POST /api/auth/login/` - Login and get token
*   `POST /api/auth/logout/` - Invalidate token
*   `GET /api/auth/me/` - Get current authenticated user
*   `GET /api/users/<username>/` - Get user profile
*   `PATCH /api/users/<username>/` - Update user profile
*   `POST /api/users/<username>/follow/` - Follow user
*   `DELETE /api/users/<username>/follow/` - Unfollow user

### Posts & Interactions (`/api/posts/` & `/api/feed/`)
*   `GET /api/feed/` - Get customized feed (posts from followed users)
*   `GET /api/posts/` - Get explore feed (all public posts)
*   `POST /api/posts/create/` - Create a new text/image post
*   `GET /api/posts/<id>/` - Retrieve a specific post
*   `DELETE /api/posts/<id>/` - Delete your post
*   `POST /api/posts/<id>/like/` - Like a post
*   `DELETE /api/posts/<id>/like/` - Unlike a post
*   `GET /api/posts/<id>/comments/` - Get comments for a post
*   `POST /api/posts/<id>/comments/` - Submit a comment

### Notifications (`/api/notifications/`)
*   `GET /api/notifications/` - List all notifications
*   `POST /api/notifications/read/` - Mark all as read
*   `GET /api/notifications/count/` - Get unread notification count

## 🌍 Deployment

This backend is specifically configured to be deployed as a **Serverless Application** on Vercel or on PaaS providers like Railway.
*   **Vercel:** `vercel.json` and `wsgi.py` are pre-configured to utilize `@vercel/python`. Database migrations execute automatically during container startup.
*   **Railway/Render:** A `Procfile` is included for automatic Gunicorn deployment.
