'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TRENDING_TOPICS = [
  { tag: '#nextjs', posts: 1247 },
  { tag: '#django', posts: 894 },
  { tag: '#typescript', posts: 763 },
  { tag: '#webdev', posts: 612 },
  { tag: '#opensource', posts: 491 },
];

export default function RightPanel() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/explore?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search SocialApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 py-2.5 text-sm"
        />
        {search.trim() && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand text-white text-xs px-2.5 py-1 rounded-full font-medium"
          >
            Go
          </button>
        )}
      </form>

      {/* Trending topics */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-brand" />
          <h3 className="font-semibold text-text-primary">Trending</h3>
        </div>
        {TRENDING_TOPICS.map((item, i) => (
          <Link
            key={item.tag}
            href={`/explore?q=${encodeURIComponent(item.tag)}`}
            className="flex items-center justify-between py-2.5 hover:bg-surface-hover -mx-4 px-4 transition-colors first:rounded-t-xl last:rounded-b-xl group"
          >
            <div>
              <p className="text-text-muted text-xs">#{i + 1} Trending</p>
              <p className="text-text-primary font-semibold text-sm group-hover:text-brand transition-colors">{item.tag}</p>
            </div>
            <span className="text-text-muted text-xs">{item.posts.toLocaleString()} posts</span>
          </Link>
        ))}
        <Link
          href="/explore"
          className="block text-center text-brand text-xs font-medium mt-3 hover:underline"
        >
          Show more
        </Link>
      </div>

      {/* Footer links */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {['Terms', 'Privacy', 'About'].map((link) => (
          <span key={link} className="text-text-muted text-xs hover:text-text-secondary cursor-pointer transition-colors">
            {link}
          </span>
        ))}
        <span className="text-text-muted text-xs">© 2025 SocialApp</span>
      </div>
    </div>
  );
}
