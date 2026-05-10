"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Star, Clock, Sparkles, ArrowLeft, MapPin, X, Filter, DollarSign, Plus } from 'lucide-react';
import { activitiesAPI, tripsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function ActivitiesDiscovery() {
  const { user, isAuthenticated } = useAuthStore();
  const [activities, setActivities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [rouletteResult, setRouletteResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [selectedAct, setSelectedAct] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [addingTo, setAddingTo] = useState<string>(''); // tripId
  const [addSuccess, setAddSuccess] = useState('');

  useEffect(() => {
    activitiesAPI.search().then(r => { setActivities(r.data.data); setLoading(false); }).catch(() => setLoading(false));
    if (isAuthenticated) tripsAPI.getTrips().then(r => setTrips(r.data.data)).catch(() => {});
  }, []);

  const handleDetourRoulette = async () => {
    setSpinning(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const res = await activitiesAPI.getDetour('', parseInt(maxCost) || 200);
      setRouletteResult(res.data.data);
    } catch { setRouletteResult(null); }
    finally { setSpinning(false); }
  };

  const addToTrip = async (tripId: string, activityId: string) => {
    try {
      // First get or create a stop for this activity's city
      const trip = await tripsAPI.getTrip(tripId);
      const act = activities.find((a: any) => a.id === activityId);
      if (!act) return;
      let stop = trip.data.data.itinerary?.find((s: any) => s.cityId === act.cityId);
      if (!stop) {
        const stopRes = await tripsAPI.addStop(tripId, { cityId: act.cityId, daysCount: 1 });
        stop = stopRes.data.data;
      }
      await tripsAPI.addActivityToStop(tripId, stop.id, { activityId, day: 1 });
      setAddSuccess(`Added to "${trip.data.data.name}"!`);
      setTimeout(() => setAddSuccess(''), 2000);
    } catch (e) { console.error(e); }
  };

  const categories = [...new Set(activities.map((a: any) => a.category))];
  const filtered = activities.filter((a: any) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && a.category !== categoryFilter) return false;
    if (maxCost && a.cost > parseInt(maxCost)) return false;
    return true;
  });

  return (
    <div className="min-h-screen p-6 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Success Toast */}
        <AnimatePresence>
          {addSuccess && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg font-bold">
              ✓ {addSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Header + Search + Filters */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-5">
              <Link href="/" className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/80 transition-colors border border-white/40"><ArrowLeft size={18} /></Link>
              <div><h1 className="text-3xl font-bold font-outfit">Experiences</h1><p className="text-slate-500 text-sm">Discover real activities from the database.</p></div>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Search by name or description..." value={search} onChange={e => setSearch(e.target.value)} className="premium-input pl-12" />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="premium-input w-full md:w-40">
                <option value="">All Types</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="relative w-full md:w-36">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="number" placeholder="Max $" value={maxCost} onChange={e => setMaxCost(e.target.value)} className="premium-input pl-9" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">{filtered.length} experience{filtered.length !== 1 ? 's' : ''} found</p>
          </motion.div>

          {/* Detour Roulette */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-center flex flex-col justify-center items-center relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 text-indigo-400 w-6 h-6 opacity-50" />
            <h2 className="text-2xl font-bold font-outfit mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600">Detour Roulette</h2>
            <p className="text-sm text-slate-600 mb-4">Spontaneous activity under your budget!</p>
            <button onClick={handleDetourRoulette} disabled={spinning}
              className={`premium-button px-6 py-3 rounded-full flex items-center gap-2 ${spinning ? 'animate-pulse opacity-80' : ''}`}>
              <Compass className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
              {spinning ? 'Spinning...' : 'Spin!'}
            </button>
            {rouletteResult && !spinning && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl w-full text-left shadow-inner border border-white/40">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 block">Your Detour:</span>
                <h4 className="font-bold text-lg">{rouletteResult.name}</h4>
                <p className="text-sm text-slate-500 mt-1">{rouletteResult.cost === 0 ? 'Free' : `$${rouletteResult.cost}`} · {rouletteResult.duration} min · {rouletteResult.category}</p>
                <p className="text-xs text-slate-400 mt-1">{rouletteResult.description}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Activity Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading experiences...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((act: any, i: number) => (
              <motion.div key={act.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <div className="relative h-44 w-full overflow-hidden cursor-pointer" onClick={() => setSelectedAct(act)}>
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url(${act.imageUrl})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold">{act.category}</div>
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Clock size={12} /> {act.duration}m</div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold font-outfit text-lg mb-1 cursor-pointer hover:text-[#63D5DF] transition-colors" onClick={() => setSelectedAct(act)}>{act.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-2"><MapPin size={12} /> {act.city?.name || 'Unknown'}, {act.city?.country || ''}</p>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {act.rating}</span>
                    <span className="text-slate-300">·</span>
                    <span>{act.reviewsCount} reviews</span>
                    <span className="text-slate-300">·</span>
                    <span>{act.timeOfDay}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl">{act.cost === 0 ? 'Free' : `$${act.cost}`}</span>
                    {trips.length > 0 ? (
                      <select defaultValue="" onChange={e => { if (e.target.value) addToTrip(e.target.value, act.id); e.target.value = ''; }}
                        className="text-sm bg-slate-900 text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer appearance-none">
                        <option value="" disabled>+ Add to trip</option>
                        {trips.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    ) : (
                      <Link href="/trips/new" className="text-sm bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">
                        + Create trip
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Activity Detail Modal */}
        <AnimatePresence>
          {selectedAct && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAct(null)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/95 backdrop-blur-xl rounded-[2rem] max-w-lg w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="h-52 bg-cover bg-center relative" style={{ backgroundImage: `url(${selectedAct.imageUrl})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button onClick={() => setSelectedAct(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white"><X size={18} /></button>
                  <div className="absolute bottom-4 left-6 text-white">
                    <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold mb-2 inline-block">{selectedAct.category}</span>
                    <h2 className="text-2xl font-bold font-outfit">{selectedAct.name}</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-slate-600 text-sm">{selectedAct.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-400 text-xs block">Location</span><strong>{selectedAct.city?.name}, {selectedAct.city?.country}</strong></div>
                    <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-400 text-xs block">Duration</span><strong>{selectedAct.duration} minutes</strong></div>
                    <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-400 text-xs block">Best Time</span><strong>{selectedAct.timeOfDay}</strong></div>
                    <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-400 text-xs block">Weather</span><strong>{selectedAct.weatherIdeal}</strong></div>
                    <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-400 text-xs block">Rating</span><strong>★ {selectedAct.rating} ({selectedAct.reviewsCount} reviews)</strong></div>
                    <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-400 text-xs block">Price</span><strong className="text-xl">{selectedAct.cost === 0 ? 'Free' : `$${selectedAct.cost}`}</strong></div>
                  </div>
                  {trips.length > 0 ? (
                    <select defaultValue="" onChange={e => { if (e.target.value) { addToTrip(e.target.value, selectedAct.id); setSelectedAct(null); } }}
                      className="premium-button w-full text-center cursor-pointer appearance-none">
                      <option value="" disabled>+ Add to a trip</option>
                      {trips.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  ) : (
                    <Link href="/trips/new" className="premium-button block text-center">Create a Trip First</Link>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
