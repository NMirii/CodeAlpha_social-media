'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types';
import { postApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/**
 * Props for the PostCard component.
 */
interface PostCardProps {
  /** The post data object to render */
  post: Post;
  /** Optional callback fired when the post is deleted by its author */
  onDelete?: (id: number) => void;
  /** Determines whether to show the inline comment section (default: false) */
  showComments?: boolean;
}

/**
 * PostCard Component
 * 
 * Renders an individual post card, handling interactions such as liking, 
 * navigating to the author's profile, and deleting the post (if the current 
 * user is the author). Includes micro-animations for interactions.
 */
export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Sign in to like posts'); return; }
    try {
      if (liked) {
        await postApi.unlike(post.id);
        setLiked(false);
        setLikesCount((n) => n - 1);
      } else {
        await postApi.like(post.id);
        setLiked(true);
        setLikesCount((n) => n + 1);
        setLikeAnim(true);
        setTimeout(() => setLikeAnim(false), 300);
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async () => {
    try {
      await postApi.delete(post.id);
      toast.success('Post deleted');
      onDelete?.(post.id);
    } catch {
      toast.error('Could not delete post');
    }
    setShowMenu(false);
  };

  const isOwner = user?.id === post.author.id;

  return (
    <article className="border-b border-surface-border px-4 py-4 hover:bg-surface-hover/30 transition-colors">
      <div className="flex gap-3">
        <Link href={`/profile/${post.author.username}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm">
            {post.author.avatar ? (
              <Image src={post.author.avatar} alt={post.author.username} width={40} height={40} className="avatar w-10 h-10" />
            ) : (
              post.author.username[0].toUpperCase()
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <Link href={`/profile/${post.author.username}`} className="font-semibold text-text-primary hover:underline truncate text-sm">
                {post.author.first_name || post.author.username}
              </Link>
              <span className="text-text-muted text-sm flex-shrink-0">@{post.author.username}</span>
              <span className="text-text-muted text-sm flex-shrink-0">·</span>
              <span className="text-text-muted text-sm flex-shrink-0">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            {isOwner && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-hover">
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-surface-card border border-surface-border rounded-xl shadow-xl z-10 overflow-hidden">
                    <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-400/10 text-sm w-full">
                      <Trash2 size={14} />
                      Delete post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link href={`/posts/${post.id}`}>
            <p className="text-text-primary text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
            {post.image && (
              <div className="rounded-xl overflow-hidden mb-3 border border-surface-border">
                <Image src={post.image} alt="Post image" width={600} height={400} className="w-full object-cover max-h-80" />
              </div>
            )}
          </Link>

          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={clsx(
                'flex items-center gap-1.5 text-sm transition-colors',
                liked ? 'text-red-400' : 'text-text-muted hover:text-red-400'
              )}
            >
              <Heart
                size={16}
                className={clsx(likeAnim && 'animate-pulse-like')}
                fill={liked ? 'currentColor' : 'none'}
              />
              <span>{likesCount}</span>
            </button>

            <Link
              href={`/posts/${post.id}`}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-brand transition-colors"
            >
              <MessageCircle size={16} />
              <span>{post.comments_count}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
