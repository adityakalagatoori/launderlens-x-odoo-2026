"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { adminAPI } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await adminAPI.login({ email: form.email, password: form.password });
      localStorage.setItem('traveloop-admin-token', res.data.data.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally { setLoading(false); }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative z-10">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-red-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-red-200"><Shield className="text-red-500" size={28}/></div>
          <span className="text-3xl font-outfit font-bold tracking-tight text-[#1A1A1A]">Admin Portal</span>
          <p className="text-[#1A1A1A]/70 font-medium text-sm">Restricted access. Authorized personnel only.</p>
        </div>
        <div className="glass-panel w-full p-8 sm:p-10 rounded-[2rem]">
          {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">{error}</motion.div>}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-400 transition-colors z-10"/><input type="email" placeholder="Admin Email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="premium-input pl-12"/></div>
            <div className="relative group"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-400 transition-colors z-10"/><input type="password" placeholder="Admin Password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="premium-input pl-12"/></div>
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-2xl hover:-translate-y-0.5 transition-all shadow-lg"><span className="flex items-center justify-center gap-2">{loading?<Loader2 size={20} className="animate-spin"/>:<><span>Access Admin Portal</span><ArrowRight size={18}/></>}</span></button>
          </form>
          <div className="mt-6 text-center"><a href="/login" className="text-sm text-gray-500 hover:text-[#63D5DF] font-medium">← Back to User Login</a></div>
        </div>
      </motion.div>
    </main>
  );
}
