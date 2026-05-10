"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Globe, Compass, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, setAuth, accessToken } = useAuthStore() as any;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', country: '', travelStyle: '' });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    authAPI.getProfile().then(r => {
      const p = r.data.data;
      setForm({ name: p.name || '', bio: p.bio || '', country: p.country || '', travelStyle: p.travelStyle || '' });
    }).catch(() => {});
  }, [isAuthenticated]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      setAuth({ ...user, ...res.data.data }, accessToken);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-travel-gradient p-6 text-slate-800">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <Link href="/" className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center hover:bg-white/80 transition-colors border border-white/40"><ArrowLeft size={18} /></Link>
          <h1 className="text-3xl font-bold font-outfit">My Profile</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#63D5DF] to-[#F3E2D2] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {form.name?.charAt(0) || 'T'}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-outfit">{form.name || 'Traveler'}</h2>
              <p className="text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2"><User size={14} className="inline mr-2" />Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="premium-input" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2"><Globe size={14} className="inline mr-2" />Country</label>
              <input type="text" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="premium-input" placeholder="Where are you from?" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2"><Compass size={14} className="inline mr-2" />Travel Style</label>
              <select value={form.travelStyle} onChange={e => setForm({...form, travelStyle: e.target.value})} className="premium-input">
                <option value="">Select your style</option>
                <option value="Backpacker">Backpacker</option>
                <option value="Luxury">Luxury</option>
                <option value="Adventure">Adventure</option>
                <option value="Cultural">Cultural</option>
                <option value="Relaxation">Relaxation</option>
                <option value="Family">Family</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="premium-input min-h-[100px]" placeholder="Tell other travelers about yourself..." />
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="premium-button">
            {loading ? <Loader2 size={18} className="animate-spin" /> : saved ? <><Save size={18} /> Saved!</> : <><Save size={18} /> Save Profile</>}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
