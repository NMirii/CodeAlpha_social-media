# CodeAlpha Social Media Platform — Frontend

This is the frontend application for the CodeAlpha Social Media Platform. Built with modern web technologies, it delivers a highly responsive, fast, and visually appealing user experience. It seamlessly interfaces with the Django REST API backend to provide real-time interactions, post creation, and social networking features.

## ✨ Key Features

*   **Responsive UI/UX:** Built with a "mobile-first" approach using Tailwind CSS. Features a dynamic desktop sidebar and a bottom navigation bar for mobile users.
*   **Modern State Management:** Utilizes `Zustand` for lightweight, predictable global state management (Authentication and User Sessions).
*   **Axios Interceptors:** Automatic injection of JWT authorization tokens into every request for secure communication with the backend.
*   **Real-Time Polling:** The notification badge automatically polls the backend for unread notification counts, keeping users up-to-date without page refreshes.
*   **Advanced UI Components:** 
    *   Custom-built modals utilizing React `createPortal` to bypass CSS stacking contexts and deliver perfect full-screen blurs.
    *   Micro-animations and skeleton loading states for a premium feel.
    *   Infinite-scroll style pagination for Feed and Explore pages.
*   **Optimized Image Delivery:** Integrated with Next.js `next/image` to optimize user avatars and post attachments.

## 🛠️ Technology Stack

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (with custom design system tokens)
*   **State Management:** Zustand
*   **HTTP Client:** Axios
*   **Icons:** Lucide React
*   **Utilities:** `clsx` (class merging) & `date-fns` (time formatting)

## 📁 Directory Structure

```text
src/
├── app/
│   ├── (auth)/             # Login and Registration pages
│   ├── (app)/              # Main application pages (Feed, Explore, Profile, Notifications)
│   ├── layout.tsx          # Root layout defining HTML structure
│   └── globals.css         # Global CSS and Tailwind directives
├── components/             # Reusable UI components
│   ├── Sidebar.tsx         # Desktop navigation
│   ├── MobileNav.tsx       # Mobile bottom tab navigation
│   ├── PostCard.tsx        # Card component for rendering posts
│   └── ComposeModal.tsx    # Portal-based modal for creating posts
├── lib/
│   └── api.ts              # Pre-configured Axios instance & API wrapper functions
├── store/
│   └── authStore.ts        # Zustand authentication store
└── types/
    └── index.ts            # Global TypeScript interfaces for API models
```

## 💻 Local Development Setup

### 1. Install Dependencies
Make sure you have Node.js 18+ installed.

```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of `socialmedia_frontend`:

```env
# URL to your local Django Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🌍 Deployment on Vercel

This frontend is optimized for zero-config deployment on Vercel. 
1. Push your code to GitHub.
2. Import the `socialmedia_frontend` folder into a new Vercel Project.
3. Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed backend.
4. Click Deploy. 

Vercel will automatically read the provided `vercel.json` and `next.config.js` to build and optimize the application.
