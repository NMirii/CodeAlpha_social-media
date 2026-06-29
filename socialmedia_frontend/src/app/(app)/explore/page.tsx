'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { postApi, userApi } from '@/lib/api';
import { Post } from '@/types';
import PostCard from '@/components/PostCard';
import { Search, Loader2, Users } from 'lucide-react';
import Link from 'next/link';

// ── User search result ─────────────────────────────────────────────────────────
interface UserResult {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

// ── Inner component that uses useSearchParams ─────────────────────────────────
function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(query);
  const [activeTab, setActiveTab] = useState<'posts' | 'people'>('posts');

  useEffect(() => {
    setLoading(true);
    postApi.getAll(1).then((res) => {
      const data = res.data.results ?? res.data;
      setPosts(data);
      const q = searchParams.get('q') || '';
      setSearch(q);
      setFilteredPosts(
        q
          ? data.filter((p: Post) =>
              p.content.toLowerCase().includes(q.toLowerCase()) ||
              p.author.username.toLowerCase().includes(q.toLowerCase())
            )
          : data
      );
    }).finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setFilteredPosts(
      val.trim()
        ? posts.filter((p) =>
            p.content.toLowerCase().includes(val.toLowerCase()) ||
            p.author.username.toLowerCase().includes(val.toLowerCase())
          )
        : posts
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/explore?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-4 border-b border-surface-border">
        <h1 className="text-lg font-bold text-text-primary mb-3">Explore</h1>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search posts and people..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input pl-10 py-2.5 text-sm pr-24"
          />
          {search.trim() && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand text-white text-xs px-3 py-1.5 rounded-full font-medium"
            >
              Search
            </button>
          )}
        </form>

        {/* Tabs */}
        <div className="flex gap-4 mt-3">
          <button
            onClick={() => setActiveTab('posts')}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-brand text-brand'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'people'
                ? 'border-brand text-brand'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Users size={14} />
            People
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="text-brand animate-spin" />
        </div>
      ) : activeTab === 'posts' ? (
        <>
          {search && (
            <p className="px-4 py-3 text-text-muted text-sm border-b border-surface-border">
              {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for &quot;{search}&quot;
            </p>
          )}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p>{search ? `No results for "${search}"` : 'No posts yet'}</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </>
      ) : (
        <PeopleSearch query={search} />
      )}
    </div>
  );
}

// ── People Search ─────────────────────────────────────────────────────────────
function PeopleSearch({ query }: { query: string }) {
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    userApi.search(query).then((res) => {
      setResults(res.data);
    }).catch(() => {
      // Fallback: search authors from posts
      postApi.getAll(1).then((res) => {
        const data = res.data.results ?? res.data;
        const authorsMap = new Map<number, UserResult>();
        data.forEach((p: Post) => {
          if (!authorsMap.has(p.author.id) &&
            (p.author.username.toLowerCase().includes(query.toLowerCase()) ||
             (p.author.first_name || '').toLowerCase().includes(query.toLowerCase()))) {
            authorsMap.set(p.author.id, p.author as UserResult);
          }
        });
        setResults(Array.from(authorsMap.values()));
      });
    }).finally(() => setLoading(false));
  }, [query]);

  if (!query.trim()) {
    return (
      <div className="text-center py-16 text-text-muted">
        <Users size={32} className="mx-auto mb-3 opacity-30" />
        <p>Search for people by username or name</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="text-brand animate-spin" />
      </div>
    );
  }

  return results.length === 0 ? (
    <div className="text-center py-16 text-text-muted">
      <Users size={32} className="mx-auto mb-3 opacity-30" />
      <p>No people found for &quot;{query}&quot;</p>
    </div>
  ) : (
    <div>
      {results.map((u) => (
        <Link
          key={u.id}
          href={`/profile/${u.username}`}
          className="flex items-center gap-3 px-4 py-3 border-b border-surface-border hover:bg-surface-hover transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm flex-shrink-0">
            {u.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm">
              {u.first_name || u.username}
            </p>
            <p className="text-text-muted text-xs">@{u.username}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Page Export with Suspense ─────────────────────────────────────────────────
export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="text-brand animate-spin" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
