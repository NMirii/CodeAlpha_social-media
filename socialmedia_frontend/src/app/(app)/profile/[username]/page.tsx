'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { userApi } from '@/lib/api';
import { User, Post } from '@/types';
import PostCard from '@/components/PostCard';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Link as LinkIcon, MapPin, Calendar, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// ── Edit Profile Modal ────────────────────────────────────────────────────────
interface EditProfileModalProps {
  profile: User;
  onClose: () => void;
  onSave: (updated: User) => void;
}

function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      const res = await userApi.updateProfile(profile.username, formData);
      const updated = res.data as User;
      onSave(updated);
      // Update auth store if editing own profile
      if (user?.username === profile.username) {
        updateUser(updated);
      }
      toast.success('Profile updated!');
      onClose();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-surface-border animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <h2 className="font-semibold text-text-primary">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">First Name</label>
              <input
                className="input py-2 text-sm"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">Last Name</label>
              <input
                className="input py-2 text-sm"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Bio</label>
            <textarea
              className="input py-2 text-sm resize-none"
              rows={3}
              maxLength={500}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-text-muted mt-0.5 text-right">{form.bio.length}/500</p>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Location</label>
            <input
              className="input py-2 text-sm"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Where are you from?"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Website</label>
            <input
              className="input py-2 text-sm"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              type="url"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-surface-border">
          <button onClick={onClose} className="btn-outline text-sm py-2">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm py-2 flex items-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { username } = useParams();
  const { user: me, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          userApi.getProfile(username as string),
          userApi.getPosts(username as string),
        ]);
        setProfile(profileRes.data);
        setPosts(postsRes.data.results ?? postsRes.data);
      } catch {
        toast.error('User not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (profile.is_following) {
        await userApi.unfollow(profile.username);
        setProfile({ ...profile, is_following: false, followers_count: profile.followers_count - 1 });
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        await userApi.follow(profile.username);
        setProfile({ ...profile, is_following: true, followers_count: profile.followers_count + 1 });
        toast.success(`Following @${profile.username}`);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setFollowLoading(false);
    }
  };

  // Delete a post and update the posts_count in the profile
  const handleDeletePost = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    // Decrement posts count in profile
    if (profile) {
      setProfile({ ...profile, posts_count: Math.max(0, profile.posts_count - 1) });
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 size={24} className="text-brand animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="text-center py-16 text-text-muted">User not found</div>
  );

  const isMe = me?.username === profile.username;

  return (
    <>
      <div>
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-brand/30 via-brand/10 to-transparent border-b border-surface-border" />

        {/* Profile info */}
        <div className="px-4 pb-4 border-b border-surface-border">
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-brand/20 border-4 border-white flex items-center justify-center text-brand text-2xl font-bold shadow-sm">
              {profile.username[0].toUpperCase()}
            </div>

            {/* Follow / Edit button */}
            {isAuthenticated && (
              isMe ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-outline text-sm"
                >
                  Edit profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={profile.is_following ? 'btn-outline text-sm' : 'btn-primary text-sm'}
                >
                  {followLoading ? '...' : profile.is_following ? 'Following' : 'Follow'}
                </button>
              )
            )}
          </div>

          <h1 className="text-xl font-bold text-text-primary">
            {profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile.username}
          </h1>
          <p className="text-text-muted text-sm mb-3">@{profile.username}</p>

          {profile.bio && (
            <p className="text-text-primary text-sm leading-relaxed mb-3">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-text-muted text-sm mb-4">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {profile.location}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand hover:underline">
                <LinkIcon size={14} /> {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> Joined {format(new Date(profile.date_joined), 'MMMM yyyy')}
            </span>
          </div>

          <div className="flex gap-6 text-sm">
            <span>
              <strong className="text-text-primary">{profile.following_count}</strong>{' '}
              <span className="text-text-muted">Following</span>
            </span>
            <span>
              <strong className="text-text-primary">{profile.followers_count}</strong>{' '}
              <span className="text-text-muted">Followers</span>
            </span>
            <span>
              <strong className="text-text-primary">{profile.posts_count}</strong>{' '}
              <span className="text-text-muted">Posts</span>
            </span>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">
            {isMe ? "You haven't posted anything yet." : `@${profile.username} hasn't posted yet.`}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => setProfile(updated)}
        />
      )}
    </>
  );
}
