'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Home, Search, Bell, User, LogOut, PenSquare, Leaf
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useState } from 'react';
import ComposeModal from './ComposeModal';
import { Post } from '@/types';

const navItems = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/explore', icon: Search, label: 'Explore' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showCompose, setShowCompose] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/login');
  };

  const handleNewPost = (_post: Post) => {
    toast.success('Post shared!');
    setShowCompose(false);
    // Refresh feed if on feed page
    if (pathname === '/feed') {
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-sm">
            <Leaf size={16} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">SocialApp</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3.5 px-3 py-3 rounded-xl font-medium transition-all duration-150',
                pathname === href
                  ? 'bg-brand/10 text-brand'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}

          {isAuthenticated && user && (
            <Link
              href={`/profile/${user.username}`}
              className={clsx(
                'flex items-center gap-3.5 px-3 py-3 rounded-xl font-medium transition-all duration-150',
                pathname.startsWith('/profile')
                  ? 'bg-brand/10 text-brand'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              )}
            >
              <User size={20} />
              <span>Profile</span>
            </Link>
          )}
        </nav>

        {/* New Post button */}
        {isAuthenticated && (
          <button
            onClick={() => setShowCompose(true)}
            className="btn-primary text-center mb-4 flex items-center justify-center gap-2 shadow-md"
          >
            <PenSquare size={16} />
            New Post
          </button>
        )}

        {/* User card */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer group border border-transparent hover:border-surface-border">
            <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm flex-shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-medium text-sm truncate">{user.first_name || user.username}</p>
              <p className="text-text-muted text-xs truncate">@{user.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-outline text-center">
            Sign in
          </Link>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          onPost={handleNewPost}
          onClose={() => setShowCompose(false)}
        />
      )}
    </>
  );
}
