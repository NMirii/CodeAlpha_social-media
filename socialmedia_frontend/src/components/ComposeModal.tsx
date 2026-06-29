'use client';
import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { postApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Post } from '@/types';
import toast from 'react-hot-toast';

interface ComposeModalProps {
  onPost?: (post: Post) => void;
  onClose: () => void;
}

export default function ComposeModal({ onPost, onClose }: ComposeModalProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea and lock body scroll
    textareaRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

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
      onClose();
    } catch {
      toast.error('Failed to post');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-surface-border animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <h2 className="font-semibold text-text-primary">New Post</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm flex-shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's happening?"
                rows={4}
                maxLength={2000}
                className="w-full bg-transparent text-text-primary placeholder-text-muted resize-none outline-none text-base leading-relaxed"
              />

              {preview && (
                <div className="relative inline-block mt-2">
                  <img src={preview} alt="preview" className="max-h-48 rounded-xl border border-surface-border object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-surface-border rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2 rounded-full text-brand hover:bg-brand/10 transition-colors"
            >
              <ImageIcon size={18} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            <span className={`text-xs ${content.length > 1800 ? 'text-red-500' : 'text-text-muted'}`}>
              {content.length}/2000
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted hidden sm:block">Ctrl+Enter to post</span>
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
