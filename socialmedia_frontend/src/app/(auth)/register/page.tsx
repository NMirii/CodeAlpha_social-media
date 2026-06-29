'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await register(form);
      toast.success('Account created!');
      router.push('/feed');
    } catch (err: any) {
      const errors = err?.response?.data;
      const msg = errors ? Object.values(errors).flat().join(' ') : 'Registration failed';
      toast.error(msg as string);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="text-text-secondary text-sm mb-1.5 block">{label}</label>
      <input
        className="input"
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required={!['first_name', 'last_name'].includes(key)}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold text-text-primary">SocialApp</span>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-text-primary mb-1">Create account</h1>
          <p className="text-text-secondary text-sm mb-6">Join the community today</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {field('first_name', 'First name', 'text', 'John')}
              {field('last_name', 'Last name', 'text', 'Doe')}
            </div>
            {field('username', 'Username', 'text', 'john_doe')}
            {field('email', 'Email', 'email', 'john@example.com')}
            {field('password', 'Password', 'password', '••••••••')}
            {field('password2', 'Confirm password', 'password', '••••••••')}

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
