"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      setAuth(res.data.data.user, res.data.data.accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/50">
            <span className="text-[#1A1A1A] font-bold text-3xl font-outfit">T</span>
          </div>
          <span className="text-3xl font-outfit font-bold tracking-tight text-[#1A1A1A]">Welcome Back</span>
          <p className="text-[#1A1A1A]/70 font-medium text-sm">Sign in to continue your journey.</p>
        </div>

        <div className="glass-panel w-full p-8 sm:p-10 rounded-[2rem]">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors z-10" />
              <input type="email" placeholder="Email Address" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="premium-input pl-12" />
            </div>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors z-10" />
              <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="premium-input pl-12" />
            </div>

            <button type="submit" disabled={loading} className="premium-button group">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={18} /></>}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#1A1A1A]/70 font-medium">
              New to Traveloop? <a href="/register" className="text-[#63D5DF] hover:text-[#52C4CE] font-bold transition-colors">Create Account</a>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
