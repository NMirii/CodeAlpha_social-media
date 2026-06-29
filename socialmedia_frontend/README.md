# Social Media Frontend — Next.js

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (dark, minimal design)
- **Zustand** (auth state)
- **Axios** (API calls)
- **react-hot-toast** (notifications)
- **lucide-react** (icons)

## Setup

### 1. Install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# .env.local contains:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run
```bash
npm run dev
# → http://localhost:3000
```

Make sure Django backend is running on port 8000.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/feed` |
| `/login` | Sign in |
| `/register` | Create account |
| `/feed` | Home feed (following + own posts) |
| `/explore` | All posts + search |
| `/posts/[id]` | Post detail + comments |
| `/profile/[username]` | User profile + follow |

## How auth works
- Login → Django returns a token → stored in `localStorage`
- Every API request sends `Authorization: Token <token>` header
- Zustand store holds the current user state
- `AuthProvider` loads the user on app startup
