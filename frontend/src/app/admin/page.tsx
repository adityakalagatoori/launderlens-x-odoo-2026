"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Map, Compass, DollarSign, BookOpen, Plane, ArrowLeft, RefreshCw, Trash2, Database, Shield, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string|null>(null);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<'overview'|'users'|'trips'|'expenses'|'guides'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('traveloop-admin-token');
    if (!t) { router.push('/admin/login'); return; }
    setToken(t); loadStats(t);
  }, []);

  const loadStats = async (t:string) => { setLoading(true); try { const res = await adminAPI.getStats(t); setStats(res.data.data); } catch(e:any) { if(e.response?.status===401||e.response?.status===403) { localStorage.removeItem('traveloop-admin-token'); router.push('/admin/login'); } } finally{setLoading(false)} };
  const loadUsers = async () => { if(!token) return; const res = await adminAPI.getUsers(token); setUsers(res.data.data); };
  const loadTrips = async () => { if(!token) return; const res = await adminAPI.getTrips(token); setTrips(res.data.data); };
  const loadExpenses = async () => { if(!token) return; const res = await adminAPI.getExpenses(token); setExpenses(res.data.data); };
  const loadGuides = async () => { if(!token) return; const res = await adminAPI.getGuides(token); setGuides(res.data.data); };

  useEffect(() => { if(!token) return; if(tab==='users') loadUsers(); if(tab==='trips') loadTrips(); if(tab==='expenses') loadExpenses(); if(tab==='guides') loadGuides(); }, [tab, token]);

  const deleteUser = async (id:string) => { if(!token||!confirm('Delete this user?')) return; await adminAPI.deleteUser(token,id); loadUsers(); loadStats(token); };
  const logout = () => { localStorage.removeItem('traveloop-admin-token'); router.push('/admin/login'); };

  const TABS = [{id:'overview',label:'Overview',icon:<Database size={16}/>},{id:'users',label:'Users',icon:<Users size={16}/>},{id:'trips',label:'Trips',icon:<Plane size={16}/>},{id:'expenses',label:'Expenses',icon:<DollarSign size={16}/>},{id:'guides',label:'Guides',icon:<UserCheck size={16}/>}];

  if(!token) return null;

  return (
    <div className="min-h-screen p-6 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center hover:bg-white/80 border border-white/40"><ArrowLeft size={18}/></Link>
            <div><h1 className="text-3xl font-bold font-outfit">🛡️ Admin Portal</h1><p className="text-slate-500 text-sm">System administration dashboard</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>token&&loadStats(token)} className="flex items-center gap-2 px-4 py-2.5 bg-white/50 backdrop-blur-md rounded-xl border border-white/40 font-semibold text-sm"><RefreshCw size={16}/> Refresh</button>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-xl text-sm">Logout</button>
          </div>
        </div>

        <div className="flex gap-2">{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${tab===t.id?'bg-white shadow-md text-[#63D5DF]':'bg-white/30 text-slate-600 hover:bg-white/50'}`}>{t.icon}{t.label}</button>)}</div>

        <motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
          {tab==='overview'&&stats&&<div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{label:'Users',value:stats.counts.users,color:'from-blue-500 to-cyan-400'},{label:'Trips',value:stats.counts.trips,color:'from-purple-500 to-pink-400'},{label:'Guides',value:stats.counts.guides||0,color:'from-emerald-500 to-teal-400'},{label:'Posts',value:stats.counts.posts||0,color:'from-orange-500 to-amber-400'}].map((s,i)=><motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="glass-panel p-5 rounded-2xl"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}><Shield size={20}/></div><div className="text-3xl font-bold font-outfit">{s.value}</div><div className="text-xs text-slate-500 font-semibold uppercase">{s.label}</div></motion.div>)}</div>
            <div className="glass-panel p-6 rounded-2xl"><h3 className="font-bold text-lg mb-4">💰 Financial</h3><div className="flex justify-between"><span className="text-slate-500">Total Budget</span><span className="text-2xl font-bold text-[#63D5DF]">${stats.totals.totalBudget.toLocaleString()}</span></div><div className="flex justify-between mt-2"><span className="text-slate-500">Total Expenses</span><span className="text-2xl font-bold text-red-500">${stats.totals.totalExpenses.toLocaleString()}</span></div></div>
          </div>}

          {tab==='users'&&<div className="glass-panel p-6 rounded-2xl"><h3 className="font-bold text-lg mb-4">All Users ({users.length})</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b border-slate-200/50"><th className="pb-3 font-semibold">Name</th><th className="pb-3 font-semibold">Email</th><th className="pb-3 font-semibold">Trips</th><th className="pb-3 font-semibold">Joined</th><th className="pb-3 font-semibold">Actions</th></tr></thead><tbody>{users.map((u:any)=><tr key={u.id} className="border-b border-slate-100/50 hover:bg-white/30"><td className="py-3 font-bold">{u.name||'—'}</td><td className="py-3 text-slate-500">{u.email||u.phone||'—'}</td><td className="py-3 font-bold">{u._count?.trips||0}</td><td className="py-3 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td><td className="py-3"><button onClick={()=>deleteUser(u.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div></div>}

          {tab==='trips'&&<div className="glass-panel p-6 rounded-2xl"><h3 className="font-bold text-lg mb-4">All Trips ({trips.length})</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b border-slate-200/50"><th className="pb-3">Trip</th><th className="pb-3">Owner</th><th className="pb-3">Type</th><th className="pb-3">Budget</th><th className="pb-3">Mode</th></tr></thead><tbody>{trips.map((t:any)=><tr key={t.id} className="border-b border-slate-100/50"><td className="py-3 font-bold">{t.name}</td><td className="py-3 text-slate-500">{t.owner?.name||t.owner?.email}</td><td className="py-3"><span className="bg-[#63D5DF]/20 text-[#52C4CE] px-2 py-1 rounded-lg text-xs font-bold">{t.tripType}</span></td><td className="py-3 font-bold">${t.budget}</td><td className="py-3">{t.tripMode}{t.lookingForBuddy&&' 🤝'}</td></tr>)}</tbody></table></div></div>}

          {tab==='expenses'&&<div className="glass-panel p-6 rounded-2xl"><h3 className="font-bold text-lg mb-4">All Expenses ({expenses.length})</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b border-slate-200/50"><th className="pb-3">Amount</th><th className="pb-3">Category</th><th className="pb-3">User</th><th className="pb-3">Trip</th><th className="pb-3">Date</th></tr></thead><tbody>{expenses.map((e:any)=><tr key={e.id} className="border-b border-slate-100/50"><td className="py-3 font-bold text-red-500">${e.amount}</td><td className="py-3">{e.category}</td><td className="py-3">{e.user?.name||'—'}</td><td className="py-3">{e.trip?.name||'—'}</td><td className="py-3 text-xs text-slate-400">{new Date(e.date).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>}

          {tab==='guides'&&<div className="glass-panel p-6 rounded-2xl"><h3 className="font-bold text-lg mb-4">All Tourist Guides ({guides.length})</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b border-slate-200/50"><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">City</th><th className="pb-3">Rate/Day</th><th className="pb-3">Rating</th><th className="pb-3">Experience</th></tr></thead><tbody>{guides.map((g:any)=><tr key={g.id} className="border-b border-slate-100/50"><td className="py-3 font-bold">{g.name}</td><td className="py-3 text-slate-500">{g.email}</td><td className="py-3">{g.city?.name}, {g.city?.country}</td><td className="py-3 font-bold">${g.ratePerDay}</td><td className="py-3">⭐ {g.rating}</td><td className="py-3">{g.experience} yrs</td></tr>)}</tbody></table></div></div>}

          {loading&&tab==='overview'&&<div className="text-center py-20 text-slate-400">Loading admin data...</div>}
        </motion.div>
      </div>
    </div>
  );
}
