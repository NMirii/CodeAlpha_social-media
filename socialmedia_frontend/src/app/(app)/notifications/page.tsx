'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/lib/api';
import Link from 'next/link';
import { Bell, Heart, UserPlus, MessageCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  type: 'like' | 'follow' | 'comment';
  actor: { username: string; first_name: string; avatar: string | null };
  post?: { id: number; content: string };
  created_at: string;
  is_read: boolean;
}

// Mock notifications since backend doesn't have a notifications model yet
function getMockNotifications(username: string): Notification[] {
  return [
    {
      id: 1,
      type: 'like',
      actor: { username: 'alice', first_name: 'Alice', avatar: null },
      post: { id: 1, content: 'Your post was liked!' },
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      is_read: false,
    },
    {
      id: 2,
      type: 'follow',
      actor: { username: 'bob', first_name: 'Bob', avatar: null },
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      is_read: false,
    },
    {
      id: 3,
      type: 'comment',
      actor: { username: 'carol', first_name: 'Carol', avatar: null },
      post: { id: 2, content: 'Great post!' },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      is_read: true,
    },
    {
      id: 4,
      type: 'like',
      actor: { username: 'dave', first_name: 'Dave', avatar: null },
      post: { id: 3, content: 'Another liked post' },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      is_read: true,
    },
  ];
}

const notifIcon = {
  like: <Heart size={16} className="text-red-500" fill="currentColor" />,
  follow: <UserPlus size={16} className="text-brand" />,
  comment: <MessageCircle size={16} className="text-blue-500" />,
};

const notifText = (n: Notification) => {
  switch (n.type) {
    case 'like': return 'liked your post';
    case 'follow': return 'started following you';
    case 'comment': return 'commented on your post';
    default: return 'interacted with you';
  }
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readAll, setReadAll] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    // Simulate loading notifications
    const timer = setTimeout(() => {
      setNotifications(getMockNotifications(user?.username || ''));
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setReadAll(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 text-text-muted">
        <Bell size={40} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium text-text-primary mb-2">Sign in to see notifications</p>
        <Link href="/login" className="btn-primary inline-block mt-4">Sign in</Link>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-4 border-b border-surface-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-text-muted">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-brand text-sm font-medium hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="text-brand animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Bell size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium text-text-primary">No notifications yet</p>
          <p className="text-sm mt-1">When someone likes or follows you, it'll show up here.</p>
        </div>
      ) : (
        <div>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-4 border-b border-surface-border transition-colors hover:bg-surface-hover ${
                !n.is_read ? 'bg-brand/5' : ''
              }`}
            >
              {/* Notification icon */}
              <div className="mt-1 flex-shrink-0">
                {notifIcon[n.type]}
              </div>

              {/* Actor avatar */}
              <Link href={`/profile/${n.actor.username}`} className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm">
                  {n.actor.username[0].toUpperCase()}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                  <Link
                    href={`/profile/${n.actor.username}`}
                    className="font-semibold hover:underline"
                  >
                    {n.actor.first_name || n.actor.username}
                  </Link>{' '}
                  <span className="text-text-secondary">{notifText(n)}</span>
                </p>
                {n.post && (
                  <Link href={`/posts/${n.post.id}`} className="text-xs text-text-muted hover:text-brand mt-0.5 block truncate">
                    "{n.post.content}"
                  </Link>
                )}
                <p className="text-xs text-text-muted mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Unread dot */}
              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
