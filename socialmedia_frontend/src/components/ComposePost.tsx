'use client';
import { useState, useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { postApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Post } from '@/types';
import toast from 'react-hot-toast';

interface ComposePostProps {
  onPost?: (post: Post) => void;
}

export default function ComposePost({ onPost }: ComposePostProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated || !user) return null;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) formData.append('image', image);
      const res = await postApi.create(formData);
      setContent('');
      removeImage();
      toast.success('Posted!');
      onPost?.(res.data);
    } catch {
      toast.error('Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-surface-border px-4 py-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm flex-shrink-0">
          {user.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            rows={3}
            maxLength={2000}
            className="w-full bg-transparent text-text-primary placeholder-text-muted resize-none outline-none text-base leading-relaxed"
          />

          {preview && (
            <div className="relative inline-block mt-2">
              <img src={preview} alt="preview" className="max-h-48 rounded-xl border border-surface-border object-cover" />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-surface-card border border-surface-border rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="p-2 rounded-full text-brand hover:bg-brand/10 transition-colors"
              >
                <ImageIcon size={18} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
              <span className={`text-xs ${content.length > 1800 ? 'text-red-400' : 'text-text-muted'}`}>
                {content.length}/2000
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="btn-primary py-2 px-5 text-sm"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
