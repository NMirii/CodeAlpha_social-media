'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { postApi, commentApi } from '@/lib/api';
import { Post, Comment } from '@/types';
import PostCard from '@/components/PostCard';
import { useAuthStore } from '@/store/authStore';
import { Heart, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          postApi.getOne(Number(id)),
          postApi.getComments(Number(id)),
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data.results ?? commentsRes.data);
      } catch {
        toast.error('Post not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;
    setPosting(true);
    try {
      const res = await postApi.addComment(Number(id), newComment);
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
      if (post) setPost({ ...post, comments_count: post.comments_count + 1 });
      toast.success('Comment added');
    } catch {
      toast.error('Failed to comment');
    } finally {
      setPosting(false);
    }
  };

  const handleLikeComment = async (comment: Comment) => {
    if (!isAuthenticated) return;
    try {
      if (comment.is_liked) {
        await commentApi.unlike(comment.id);
      } else {
        await commentApi.like(comment.id);
      }
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? { ...c, is_liked: !c.is_liked, likes_count: c.likes_count + (c.is_liked ? -1 : 1) }
            : c
        )
      );
    } catch {}
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Could not delete');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 size={24} className="text-brand animate-spin" />
    </div>
  );

  if (!post) return (
    <div className="text-center py-16 text-text-muted">Post not found</div>
  );

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-4 border-b border-surface-border flex items-center gap-4">
        <button onClick={() => router.back()} className="text-text-secondary hover:text-text-primary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-text-primary">Post</h1>
      </div>

      <PostCard post={post} onDelete={() => router.push('/feed')} />

      {/* Add comment */}
      {isAuthenticated && (
        <form onSubmit={handleComment} className="border-b border-surface-border px-4 py-4">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm flex-shrink-0">
              {user?.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input text-sm"
              />
              <div className="flex justify-end mt-2">
                <button type="submit" disabled={!newComment.trim() || posting} className="btn-primary py-1.5 px-4 text-sm">
                  {posting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments */}
      <div>
        {comments.length === 0 ? (
          <p className="text-center text-text-muted py-10 text-sm">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-surface-border px-4 py-4 hover:bg-surface-hover/20 animate-fade-in">
              <div className="flex gap-3">
                <Link href={`/profile/${comment.author.username}`}>
                  <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm flex-shrink-0">
                    {comment.author.username[0].toUpperCase()}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/profile/${comment.author.username}`} className="font-semibold text-text-primary text-sm hover:underline">
                      {comment.author.first_name || comment.author.username}
                    </Link>
                    <span className="text-text-muted text-xs">@{comment.author.username}</span>
                    <span className="text-text-muted text-xs">·</span>
                    <span className="text-text-muted text-xs">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-text-primary text-sm leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => handleLikeComment(comment)}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${comment.is_liked ? 'text-red-400' : 'text-text-muted hover:text-red-400'}`}
                    >
                      <Heart size={14} fill={comment.is_liked ? 'currentColor' : 'none'} />
                      {comment.likes_count}
                    </button>
                    {user?.id === comment.author.id && (
                      <button onClick={() => handleDeleteComment(comment.id)} className="text-text-muted hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
