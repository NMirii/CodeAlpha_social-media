'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, X } from 'lucide-react';
import { postApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Post } from '@/types';
import toast from 'react-hot-toast';

/**
 * Props for the ComposeModal component.
 */
interface ComposeModalProps {
  /** Callback fired when a new post is successfully created */
  onPost?: (post: Post) => void;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * ComposeModal Component
 * 
 * Renders a full-screen portal modal for creating new posts.
 * Uses `react-dom/createPortal` to bypass any CSS stacking contexts (z-index)
 * from parent containers like sticky sidebars, ensuring the backdrop properly
 * blurs the entire screen.
 */
export default function ComposeModal({ onPost, onClose }: ComposeModalProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => textareaRef.current?.focus(), 50);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, []);

  if (!isAuthenticated || !user || !mounted) return null;

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
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  const modal = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Full-screen blur backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 0,
        }}
      />

      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '520px',
          border: '1px solid #d1fae5',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #d1fae5' }}>
          <h2 style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>New Post</h2>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontWeight: 600, fontSize: '14px', flexShrink: 0 }}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's happening?"
                rows={4}
                maxLength={2000}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: '#0f172a', fontSize: '16px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}
              />
              {preview && (
                <div style={{ position: 'relative', display: 'inline-block', marginTop: '8px' }}>
                  <img src={preview} alt="preview" style={{ maxHeight: '180px', borderRadius: '12px', border: '1px solid #d1fae5', objectFit: 'cover' }} />
                  <button
                    onClick={removeImage}
                    style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', background: '#fff', border: '1px solid #d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #d1fae5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ padding: '8px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#16a34a' }}
            >
              <ImageIcon size={18} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            <span style={{ fontSize: '12px', color: content.length > 1800 ? '#ef4444' : '#94a3b8' }}>
              {content.length}/2000
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Ctrl+Enter</span>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              style={{
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: !content.trim() || loading ? 'not-allowed' : 'pointer',
                opacity: !content.trim() || loading ? 0.5 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
