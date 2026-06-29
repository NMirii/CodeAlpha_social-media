'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { notifApi } from '@/lib/api';
import Link from 'next/link';
import { Bell, Heart, UserPlus, MessageCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  notif_type: 'like_post' | 'like_comment' | 'comment' | 'follow';
  sender: { username: string; first_name: string; avatar: string | null };
  post_id: number | null;
  post_content: string | null;
  is_read: boolean;
  created_at: string;
}

const ICON_MAP = {
  like_post:    <Heart size={15} className="text-red-500" fill="currentColor" />,
  like_comment: <Heart size={15} className="text-pink-400" fill="currentColor" />,
  comment:      <MessageCircle size={15} className="text-brand" />,
  follow:       <UserPlus size={15} className="text-blue-500" />,
};

const TEXT_MAP = {
  like_post:    'liked your post',
  like_comment: 'liked your comment',
  comment:      'commented on your post',
  follow:       'started following you',
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  const fetchNotifs = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    try {
      const res = await notifApi.getAll();
      setNotifications(res.data.results ?? res.data);
    } catch {
      // silently fail – user sees empty state
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      await notifApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } finally {
      setMarkingRead(false);
    }
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
            disabled={markingRead}
            className="text-brand text-sm font-medium hover:underline disabled:opacity-50"
          >
            {markingRead ? 'Marking...' : 'Mark all read'}
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
                !n.is_read ? 'bg-brand/5 border-l-2 border-l-brand' : ''
              }`}
            >
              {/* Type icon */}
              <div className="mt-1 w-5 flex-shrink-0">
                {ICON_MAP[n.notif_type]}
              </div>

              {/* Sender avatar */}
              <Link href={`/profile/${n.sender.username}`} className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm">
                  {n.sender.username[0].toUpperCase()}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary leading-snug">
                  <Link
                    href={`/profile/${n.sender.username}`}
                    className="font-semibold hover:underline"
                  >
                    {n.sender.first_name || n.sender.username}
                  </Link>{' '}
                  <span className="text-text-secondary">{TEXT_MAP[n.notif_type]}</span>
                </p>

                {n.post_content && n.post_id && (
                  <Link
                    href={`/posts/${n.post_id}`}
                    className="text-xs text-text-muted hover:text-brand mt-0.5 block truncate italic"
                  >
                    &ldquo;{n.post_content}&rdquo;
                  </Link>
                )}

                <p className="text-[11px] text-text-muted mt-1">
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
