'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      toast.success('Welcome back!');
      router.push('/feed');
    } catch (err: any) {
      toast.error(err?.response?.data?.non_field_errors?.[0] || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold text-text-primary">SocialApp</span>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-text-primary mb-1">Sign in</h1>
          <p className="text-text-secondary text-sm mb-6">Welcome back!</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-text-secondary text-sm mb-1.5 block">Username</label>
              <input
                className="input"
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1.5 block">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-brand hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
