# Social Media Backend — Django + Supabase

## Stack
- **Django 4.2** + **Django REST Framework**
- **Supabase** (hosted PostgreSQL)
- **Token-based auth** (DRF built-in)

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your Supabase credentials in .env
```

### 3. Get Supabase credentials
1. Go to https://supabase.com/dashboard
2. Open your project → **Settings → Database**
3. Copy: Host, Database name, User, Password
4. Paste them into `.env`

### 4. Run migrations
```bash
python manage.py migrate
python manage.py createsuperuser  # optional
```

### 5. Start the server
```bash
python manage.py runserver
```

---

## API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login → returns token |
| POST | `/api/auth/logout/` | Logout (delete token) |
| GET  | `/api/auth/me/` | Current user profile |

### Users / Profiles
| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/api/users/<username>/` | View profile |
| PATCH  | `/api/users/<username>/` | Edit own profile |
| POST   | `/api/users/<username>/follow/` | Follow user |
| DELETE | `/api/users/<username>/follow/` | Unfollow user |
| GET    | `/api/users/<username>/followers/` | List followers |
| GET    | `/api/users/<username>/following/` | List following |
| GET    | `/api/users/<username>/posts/` | User's posts |

### Posts
| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/api/posts/` | All posts (public) |
| POST   | `/api/posts/create/` | Create post |
| GET    | `/api/posts/<id>/` | Post detail |
| PATCH  | `/api/posts/<id>/` | Edit own post |
| DELETE | `/api/posts/<id>/` | Delete own post |
| POST   | `/api/posts/<id>/like/` | Like post |
| DELETE | `/api/posts/<id>/like/` | Unlike post |
| GET    | `/api/feed/` | Personalized feed (auth required) |

### Comments
| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/api/posts/<id>/comments/` | List comments |
| POST   | `/api/posts/<id>/comments/` | Add comment |
| PATCH  | `/api/comments/<id>/` | Edit own comment |
| DELETE | `/api/comments/<id>/` | Delete own comment |
| POST   | `/api/comments/<id>/like/` | Like comment |
| DELETE | `/api/comments/<id>/like/` | Unlike comment |

## Authentication
Send token in every request header:
```
Authorization: Token your-token-here
```

## Frontend (Next.js)
```bash
# In your Next.js project, set in .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
