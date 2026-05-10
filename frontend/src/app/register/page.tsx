"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      if (res.data.message) {
        setSuccessMsg(res.data.message);
      } else if (res.data.data) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = () => {
    setSocialLoading('google');
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/50">
            <span className="text-[#1A1A1A] font-bold text-3xl font-outfit">T</span>
          </div>
          <span className="text-3xl font-outfit font-bold tracking-tight text-[#1A1A1A]">Create Account</span>
          <p className="text-[#1A1A1A]/70 font-medium text-sm">Join the world&apos;s most thoughtful travel community.</p>
        </div>

        <div className="glass-panel w-full p-8 sm:p-10 rounded-[2rem]">
          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3">
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          {/* Success */}
          {successMsg ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Inbox! ✉️</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{successMsg}</p>
              </div>
              <div className="p-4 bg-[#63D5DF]/10 border border-[#63D5DF]/20 rounded-2xl">
                <p className="text-xs text-[#63D5DF] font-bold uppercase tracking-widest mb-1">Tip</p>
                <p className="text-xs text-slate-500">Check your spam/junk folder if you don't see it within a minute.</p>
              </div>
              <button onClick={() => router.push('/login')} className="premium-button">
                <span className="relative z-10">Back to Login</span>
              </button>
            </motion.div>
          ) : (
            <>
              {/* Social Logins */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={handleGoogleLogin}
                  disabled={!!socialLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-700 text-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all group relative overflow-hidden"
                >
                  {socialLoading === 'google' ? <Loader2 size={18} className="animate-spin" /> : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <button
                  onClick={() => alert('Facebook login coming soon! Please use Google or Email.')}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-[#1877F2] rounded-2xl font-semibold text-white text-sm hover:bg-[#166fe5] hover:shadow-md transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              </div>

              <div className="relative flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors z-10" />
                  <input type="text" placeholder="Full Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="premium-input pl-12" />
                </div>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors z-10" />
                  <input type="email" placeholder="Email Address" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="premium-input pl-12" />
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors z-10" />
                  <input type="password" placeholder="Password (min 6 chars)" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="premium-input pl-12" />
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors z-10" />
                  <input type="password" placeholder="Confirm Password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className="premium-input pl-12" />
                </div>

                <button type="submit" disabled={loading} className="premium-button group">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={18} /></>}
                  </span>
                </button>
              </form>
            </>
          )}

          {!successMsg && (
            <div className="mt-8 text-center">
              <p className="text-sm text-[#1A1A1A]/70 font-medium">
                Already have an account? <a href="/login" className="text-[#63D5DF] hover:text-[#52C4CE] font-bold transition-colors">Sign In</a>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
