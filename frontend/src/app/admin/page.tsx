"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Map, Compass, DollarSign, BookOpen, Plane, ArrowLeft, RefreshCw, Trash2, Database } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<'overview'|'users'|'trips'|'expenses'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data.data);
  };
  const loadTrips = async () => {
    const res = await api.get('/admin/trips');
    setTrips(res.data.data);
  };
  const loadExpenses = async () => {
    const res = await api.get('/admin/expenses');
    setExpenses(res.data.data);
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'trips') loadTrips();
    if (tab === 'expenses') loadExpenses();
  }, [tab]);

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user and all their data?')) return;
    await api.delete(`/admin/users/${id}`);
    loadUsers();
    loadStats();
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <Database size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'trips', label: 'Trips', icon: <Plane size={16} /> },
    { id: 'expenses', label: 'Expenses', icon: <DollarSign size={16} /> },
  ];

  return (
    <div className="min-h-screen p-6 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center hover:bg-white/80 transition-colors border border-white/40">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-outfit">🛡️ Admin Portal</h1>
              <p className="text-slate-500 text-sm">View all backend data, users, and system stats</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="http://localhost:5555" target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all text-sm shadow-lg">
              <Database size={16} /> Prisma Studio
            </a>
            <button onClick={() => { loadStats(); }} className="flex items-center gap-2 px-4 py-2.5 bg-white/50 backdrop-blur-md rounded-xl border border-white/40 font-semibold text-sm hover:bg-white/80 transition-all">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${tab === t.id ? 'bg-white shadow-md text-[#63D5DF]' : 'bg-white/30 text-slate-600 hover:bg-white/50'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Users', value: stats.counts.users, icon: <Users size={20} />, color: 'from-blue-500 to-cyan-400' },
                  { label: 'Trips', value: stats.counts.trips, icon: <Plane size={20} />, color: 'from-purple-500 to-pink-400' },
                  { label: 'Cities', value: stats.counts.cities, icon: <Map size={20} />, color: 'from-emerald-500 to-teal-400' },
                  { label: 'Activities', value: stats.counts.activities, icon: <Compass size={20} />, color: 'from-orange-500 to-amber-400' },
                  { label: 'Expenses', value: stats.counts.expenses, icon: <DollarSign size={20} />, color: 'from-red-500 to-rose-400' },
                  { label: 'Notes', value: stats.counts.notes, icon: <BookOpen size={20} />, color: 'from-indigo-500 to-violet-400' },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-panel p-5 rounded-2xl">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
                    <div className="text-3xl font-bold font-outfit">{s.value}</div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl">
                  <h3 className="font-bold text-lg mb-4">💰 Financial Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><span className="text-slate-500">Total Budget (all trips)</span><span className="text-2xl font-bold text-[#63D5DF]">${stats.totals.totalBudget.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500">Total Expenses Logged</span><span className="text-2xl font-bold text-red-500">${stats.totals.totalExpenses.toLocaleString()}</span></div>
                    <div className="h-[1px] bg-slate-200/50" />
                    <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">Remaining</span><span className="text-2xl font-bold text-emerald-600">${(stats.totals.totalBudget - stats.totals.totalExpenses).toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl">
                  <h3 className="font-bold text-lg mb-4">🕐 Recent Users</h3>
                  <div className="space-y-3">
                    {stats.recentUsers.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between bg-white/40 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#63D5DF] to-[#F3E2D2] flex items-center justify-center text-white text-xs font-bold">{u.name?.charAt(0) || '?'}</div>
                          <div>
                            <div className="font-bold text-sm">{u.name || 'Unnamed'}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {stats.recentUsers.length === 0 && <p className="text-slate-400 text-center py-4">No users yet</p>}
                  </div>
                </div>
              </div>

              {/* Recent Trips */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="font-bold text-lg mb-4">✈️ Recent Trips</h3>
                {stats.recentTrips.length === 0 ? <p className="text-slate-400 text-center py-4">No trips yet</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-slate-500 border-b border-slate-200/50">
                        <th className="pb-3 font-semibold">Trip Name</th><th className="pb-3 font-semibold">Owner</th><th className="pb-3 font-semibold">Type</th><th className="pb-3 font-semibold">Budget</th><th className="pb-3 font-semibold">Dates</th>
                      </tr></thead>
                      <tbody>
                        {stats.recentTrips.map((t: any) => (
                          <tr key={t.id} className="border-b border-slate-100/50">
                            <td className="py-3 font-bold">{t.name}</td>
                            <td className="py-3 text-slate-500">{t.owner?.name || t.owner?.email}</td>
                            <td className="py-3"><span className="bg-[#63D5DF]/20 text-[#52C4CE] px-2 py-1 rounded-lg text-xs font-bold">{t.tripType}</span></td>
                            <td className="py-3 font-bold">${t.budget}</td>
                            <td className="py-3 text-slate-400 text-xs">{new Date(t.startDate).toLocaleDateString()} → {new Date(t.endDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── USERS TABLE ── */}
          {tab === 'users' && (
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4">All Registered Users ({users.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-slate-500 border-b border-slate-200/50">
                    <th className="pb-3 font-semibold">Name</th><th className="pb-3 font-semibold">Email</th><th className="pb-3 font-semibold">Country</th><th className="pb-3 font-semibold">Style</th><th className="pb-3 font-semibold">Trips</th><th className="pb-3 font-semibold">Expenses</th><th className="pb-3 font-semibold">Joined</th><th className="pb-3 font-semibold">Actions</th>
                  </tr></thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-b border-slate-100/50 hover:bg-white/30 transition-colors">
                        <td className="py-3 font-bold">{u.name || '—'}</td>
                        <td className="py-3 text-slate-500">{u.email || u.phone || '—'}</td>
                        <td className="py-3">{u.country || '—'}</td>
                        <td className="py-3">{u.travelStyle || '—'}</td>
                        <td className="py-3 font-bold">{u._count?.trips || 0}</td>
                        <td className="py-3 font-bold">{u._count?.expenses || 0}</td>
                        <td className="py-3 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3"><button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TRIPS TABLE ── */}
          {tab === 'trips' && (
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4">All Trips ({trips.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-slate-500 border-b border-slate-200/50">
                    <th className="pb-3 font-semibold">Trip</th><th className="pb-3 font-semibold">Owner</th><th className="pb-3 font-semibold">Type</th><th className="pb-3 font-semibold">Budget</th><th className="pb-3 font-semibold">Stops</th><th className="pb-3 font-semibold">Expenses</th><th className="pb-3 font-semibold">Notes</th><th className="pb-3 font-semibold">Dates</th>
                  </tr></thead>
                  <tbody>
                    {trips.map((t: any) => (
                      <tr key={t.id} className="border-b border-slate-100/50 hover:bg-white/30 transition-colors">
                        <td className="py-3 font-bold"><Link href={`/trips/${t.id}`} className="text-[#63D5DF] hover:underline">{t.name}</Link></td>
                        <td className="py-3 text-slate-500">{t.owner?.name || t.owner?.email}</td>
                        <td className="py-3"><span className="bg-[#63D5DF]/20 text-[#52C4CE] px-2 py-1 rounded-lg text-xs font-bold">{t.tripType}</span></td>
                        <td className="py-3 font-bold">${t.budget}</td>
                        <td className="py-3">{t._count?.itinerary || 0}</td>
                        <td className="py-3">{t._count?.expenses || 0}</td>
                        <td className="py-3">{t._count?.notes || 0}</td>
                        <td className="py-3 text-slate-400 text-xs">{new Date(t.startDate).toLocaleDateString()} → {new Date(t.endDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── EXPENSES TABLE ── */}
          {tab === 'expenses' && (
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4">All Expenses ({expenses.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-slate-500 border-b border-slate-200/50">
                    <th className="pb-3 font-semibold">Amount</th><th className="pb-3 font-semibold">Category</th><th className="pb-3 font-semibold">Description</th><th className="pb-3 font-semibold">User</th><th className="pb-3 font-semibold">Trip</th><th className="pb-3 font-semibold">Date</th>
                  </tr></thead>
                  <tbody>
                    {expenses.map((e: any) => (
                      <tr key={e.id} className="border-b border-slate-100/50 hover:bg-white/30 transition-colors">
                        <td className="py-3 font-bold text-red-500">${e.amount}</td>
                        <td className="py-3"><span className="bg-slate-200/50 px-2 py-1 rounded-lg text-xs font-bold">{e.category}</span></td>
                        <td className="py-3 text-slate-500">{e.description || '—'}</td>
                        <td className="py-3">{e.user?.name || '—'}</td>
                        <td className="py-3">{e.trip?.name || '—'}</td>
                        <td className="py-3 text-slate-400 text-xs">{new Date(e.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {loading && tab === 'overview' && <div className="text-center py-20 text-slate-400 font-medium">Loading admin data...</div>}
        </motion.div>
      </div>
    </div>
  );
}
