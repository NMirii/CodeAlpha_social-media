'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bell, User, PenSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import ComposeModal from './ComposeModal';
import { Post } from '@/types';
import toast from 'react-hot-toast';
import { notifApi } from '@/lib/api';

export default function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [showCompose, setShowCompose] = useState(false);
  const [unread, setUnread] = useState(0);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = () => {
      notifApi.getCount().then((r) => setUnread(r.data.unread_count)).catch(() => {});
    };
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  // Reset badge when on notifications page
  useEffect(() => {
    if (pathname === '/notifications') setUnread(0);
  }, [pathname]);

  const handleNewPost = (_post: Post) => {
    toast.success('Post shared!');
    setShowCompose(false);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-border safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          <Link
            href="/feed"
            className={clsx(
              'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors',
              pathname === '/feed' ? 'text-brand' : 'text-text-muted'
            )}
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link
            href="/explore"
            className={clsx(
              'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors',
              pathname === '/explore' ? 'text-brand' : 'text-text-muted'
            )}
          >
            <Search size={22} />
            <span className="text-[10px] font-medium">Explore</span>
          </Link>

          {isAuthenticated && (
            <button
              onClick={() => setShowCompose(true)}
              className="flex flex-col items-center gap-0.5 p-2"
            >
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center shadow-md">
                <PenSquare size={18} className="text-white" />
              </div>
            </button>
          )}

          <Link
            href="/notifications"
            className={clsx(
              'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors',
              pathname === '/notifications' ? 'text-brand' : 'text-text-muted'
            )}
          >
            <div className="relative">
              <Bell size={22} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Alerts</span>
          </Link>

          <Link
            href={isAuthenticated && user ? `/profile/${user.username}` : '/login'}
            className={clsx(
              'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors',
              pathname.startsWith('/profile') ? 'text-brand' : 'text-text-muted'
            )}
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>

      {showCompose && (
        <ComposeModal
          onPost={handleNewPost}
          onClose={() => setShowCompose(false)}
        />
      )}
    </>
  );
}
