'use client';
import { useEffect, useState, useCallback } from 'react';
import { postApi } from '@/lib/api';
import { Post } from '@/types';
import PostCard from '@/components/PostCard';
import ComposePost from '@/components/ComposePost';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (p: number) => {
    try {
      const res = isAuthenticated
        ? await postApi.getFeed(p)
        : await postApi.getAll(p);
      const data = res.data;
      if (p === 1) {
        setPosts(data.results ?? data);
      } else {
        setPosts((prev) => [...prev, ...(data.results ?? data)]);
      }
      setHasMore(!!data.next);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts]);

  const handleNewPost = (post: Post) => setPosts((prev) => [post, ...prev]);
  const handleDelete = (id: number) => setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <div>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-4 border-b border-surface-border">
        <h1 className="text-lg font-bold text-text-primary">
          {isAuthenticated ? 'Home' : 'Explore'}
        </h1>
      </div>

      <ComposePost onPost={handleNewPost} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="text-brand animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">No posts yet</p>
          <p className="text-sm">Follow people or create your first post!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
          {hasMore && (
            <div className="flex justify-center py-6">
              <button
                onClick={() => { const next = page + 1; setPage(next); fetchPosts(next); }}
                className="btn-outline text-sm"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
