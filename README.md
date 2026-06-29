# SocialApp — Full-Stack Social Media Platform

A modern, full-stack social media application built as part of the **CodeAlpha Internship Program**. The platform allows users to register, create posts with images, follow other users, like and comment on posts, and receive real-time notifications.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | Deployed on Vercel |
| Backend  | Deployed on Vercel (Serverless Python) |

---

## Features

- **Authentication** — Register, login, and logout with token-based sessions
- **Posts** — Create text posts with optional image attachments, like and delete your own posts
- **Comments** — Nested comments with like support on each comment
- **Follow System** — Follow and unfollow users; personalized feed based on who you follow
- **Notifications** — Real-time notification badge for likes, comments, and follows; mark all as read
- **Explore** — Browse all posts and search for users by username or name
- **User Profiles** — View any user's profile, posts, follower/following counts, and edit your own profile
- **New Post Modal** — Compose new posts via a centered modal with blurred background overlay
- **Responsive Design** — Full mobile support with a dedicated bottom navigation bar
- **Pagination** — Infinite-scroll style "Load more" on feed and explore pages

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Zustand](https://github.com/pmndrs/zustand) | Global state management (auth) |
| [Axios](https://axios-http.com/) | HTTP client for API requests |
| [Lucide React](https://lucide.dev/) | Icon library |
| [date-fns](https://date-fns.org/) | Date formatting |
| [React Hot Toast](https://react-hot-toast.com/) | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| [Django 4.2](https://www.djangoproject.com/) | Web framework |
| [Django REST Framework](https://www.django-rest-framework.org/) | REST API layer |
| [PostgreSQL](https://www.postgresql.org/) (via Supabase) | Relational database |
| [django-cors-headers](https://github.com/adamchainz/django-cors-headers) | Cross-origin request handling |
| [WhiteNoise](https://whitenoise.evans.io/) | Static file serving in production |
| [Gunicorn](https://gunicorn.org/) | WSGI server for production |
| [python-decouple](https://github.com/henriquebastos/python-decouple) | Environment variable management |

---

## Project Structure

```
fullstack_social_media/
│
├── socialmedia_backend/          # Django REST API
│   ├── posts/                    # Post, Comment, Like, Notification models & API
│   │   ├── models.py             # Data models
│   │   ├── serializers.py        # DRF serializers
│   │   ├── views.py              # API views (feed, posts, comments, notifications)
│   │   ├── urls.py               # URL routing
│   │   └── signals.py            # Auto-create notifications on like/comment/follow
│   ├── users/                    # User auth, profiles, follow system
│   │   ├── models.py             # Custom User model + Follow model
│   │   ├── serializers.py
│   │   ├── views.py              # Register, login, profile, follow/unfollow, search
│   │   └── urls.py
│   ├── socialmedia_backend/
│   │   ├── settings.py           # Django configuration
│   │   ├── urls.py               # Root URL configuration
│   │   └── wsgi.py               # WSGI entry point (also runs auto-migrations)
│   ├── requirements.txt          # Python dependencies
│   ├── Procfile                  # For Railway/Render deployment
│   └── vercel.json               # For Vercel deployment
│
└── socialmedia_frontend/         # Next.js Application
    ├── src/
    │   ├── app/
    │   │   ├── (app)/            # Authenticated pages (feed, explore, profile, notifications)
    │   │   └── (auth)/           # Auth pages (login, register)
    │   ├── components/
    │   │   ├── Sidebar.tsx       # Desktop navigation + notification badge
    │   │   ├── MobileNav.tsx     # Mobile bottom navigation + notification badge
    │   │   ├── PostCard.tsx      # Reusable post card with like/comment/delete
    │   │   ├── ComposeModal.tsx  # New post modal with blurred background
    │   │   ├── ComposePost.tsx   # Inline compose box on feed page
    │   │   └── RightPanel.tsx    # Trending/suggested users sidebar
    │   ├── lib/
    │   │   └── api.ts            # Axios instance + all API methods (auth, posts, notifications)
    │   ├── store/
    │   │   └── authStore.ts      # Zustand store for authentication state
    │   └── types/
    │       └── index.ts          # TypeScript type definitions
    ├── vercel.json               # Vercel deployment config
    └── next.config.js            # Next.js configuration
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Create a new account |
| POST | `/api/auth/login/` | Login and receive auth token |
| POST | `/api/auth/logout/` | Invalidate current token |
| GET | `/api/auth/me/` | Get current user details |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:username/` | Get user profile |
| PATCH | `/api/users/:username/` | Update profile (avatar, bio) |
| POST | `/api/users/:username/follow/` | Follow a user |
| DELETE | `/api/users/:username/follow/` | Unfollow a user |
| GET | `/api/users/search/?q=` | Search users |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed/` | Get personalized feed (requires auth) |
| GET | `/api/posts/` | Get all public posts |
| POST | `/api/posts/create/` | Create a new post |
| GET | `/api/posts/:id/` | Get a single post |
| DELETE | `/api/posts/:id/` | Delete your post |
| POST | `/api/posts/:id/like/` | Like a post |
| DELETE | `/api/posts/:id/like/` | Unlike a post |
| GET | `/api/posts/:id/comments/` | Get comments on a post |
| POST | `/api/posts/:id/comments/` | Add a comment |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/` | Get all notifications |
| POST | `/api/notifications/read/` | Mark all notifications as read |
| GET | `/api/notifications/count/` | Get unread count |

---

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier) for PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/NMirii/CodeAlpha_social-media.git
cd CodeAlpha_social-media
```

### 2. Backend Setup

```bash
cd socialmedia_backend
pip install -r requirements.txt
```

Create a `.env` file inside `socialmedia_backend/`:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=postgres
DB_USER=postgres.your-project-ref
DB_PASSWORD=your-supabase-password
DB_HOST=aws-0-region.pooler.supabase.com
DB_PORT=6543
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### 3. Frontend Setup

```bash
cd socialmedia_frontend
npm install
```

Create a `.env.local` file inside `socialmedia_frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Deployment

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and connect your GitHub account.
2. Click **Add New Project** and select this repository.
3. Set the **Root Directory** to `socialmedia_frontend`.
4. Add the environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.vercel.app/api`
5. Click **Deploy**.

### Backend → Vercel

1. In the same Vercel dashboard, create a **second** project from the same repository.
2. Set the **Root Directory** to `socialmedia_backend`.
3. Add these environment variables:
   - `SECRET_KEY` = (a long random string)
   - `DEBUG` = `False`
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` = your Supabase credentials
4. Click **Deploy**.

The backend will run as a serverless Python function and automatically apply database migrations on startup.

---

## Author

**Nadir Mirii** — Built for the CodeAlpha Web Development Internship Program.
