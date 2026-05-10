"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Lock, Mail, ArrowRight, Loader2, User, Phone, DollarSign, Globe, Star } from 'lucide-react';
import { guidesAPI, citiesAPI } from '@/lib/api';

export default function GuideLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [form, setForm] = useState({ email:'', password:'', name:'', phone:'', cityId:'', languages:'', ratePerDay:'', experience:'', bio:'', specialties:'' });

  useEffect(() => { citiesAPI.search().then(r => setCities(r.data.data||[])).catch(()=>{}); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await guidesAPI.login({ email: form.email, password: form.password });
        localStorage.setItem('traveloop-guide-token', res.data.data.token);
        router.push('/guide/dashboard');
      } else {
        const res = await guidesAPI.register({ ...form, languages: form.languages.split(',').map(l=>l.trim()), ratePerDay: parseFloat(form.ratePerDay||'0'), experience: parseInt(form.experience||'0') });
        localStorage.setItem('traveloop-guide-token', res.data.data.token);
        router.push('/guide/dashboard');
      }
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative z-10">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-emerald-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-emerald-200"><MapPin className="text-emerald-500" size={28}/></div>
          <span className="text-3xl font-outfit font-bold">Tourist Guide Portal</span>
          <p className="text-[#1A1A1A]/70 font-medium text-sm">{mode==='login'?'Sign in to manage your guide profile':'Register as a tourist guide'}</p>
        </div>
        <div className="glass-panel w-full p-8 sm:p-10 rounded-[2rem]">
          <div className="flex gap-2 mb-6">{['login','register'].map(m=><button key={m} onClick={()=>setMode(m as any)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize ${mode===m?'bg-emerald-500 text-white':'bg-white/40 text-gray-600'}`}>{m}</button>)}</div>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode==='register'&&<><div className="relative group"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"/><input type="text" placeholder="Full Name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="premium-input pl-12"/></div></>}
            <div className="relative group"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"/><input type="email" placeholder="Email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="premium-input pl-12"/></div>
            <div className="relative group"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"/><input type="password" placeholder="Password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="premium-input pl-12"/></div>
            {mode==='register'&&<>
              <select value={form.cityId} onChange={e=>setForm({...form,cityId:e.target.value})} required className="premium-input"><option value="">Select your city...</option>{cities.map((c:any)=><option key={c.id} value={c.id}>{c.name}, {c.country}</option>)}</select>
              <input placeholder="Languages (comma separated)" value={form.languages} onChange={e=>setForm({...form,languages:e.target.value})} className="premium-input"/>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Rate/Day ($)" value={form.ratePerDay} onChange={e=>setForm({...form,ratePerDay:e.target.value})} className="premium-input"/>
                <input type="number" placeholder="Experience (years)" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} className="premium-input"/>
              </div>
              <textarea placeholder="Bio & specialties..." value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={3} className="premium-input resize-none"/>
            </>}
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl hover:-translate-y-0.5 transition-all shadow-lg"><span className="flex items-center justify-center gap-2">{loading?<Loader2 size={20} className="animate-spin"/>:<><span>{mode==='login'?'Sign In':'Register as Guide'}</span><ArrowRight size={18}/></>}</span></button>
          </form>
          <div className="mt-6 text-center"><a href="/login" className="text-sm text-gray-500 hover:text-[#63D5DF] font-medium">← Back to User Login</a></div>
        </div>
      </motion.div>
    </main>
  );
}
