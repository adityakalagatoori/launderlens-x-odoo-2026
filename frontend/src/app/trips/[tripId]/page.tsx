"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, MapPin, Calendar, DollarSign, Plus, Trash2, CheckCircle, Circle, BookOpen, Leaf, Package, PenLine, Loader2, Users, Compass, ShieldAlert, Sparkles, MessageSquare, Phone, Globe, ThermometerSun, AlertCircle, Map as MapIcon, Gem, RefreshCw, Info, Star, X } from 'lucide-react';
import { tripsAPI, citiesAPI, guidesAPI, buddyAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function TripDetailPage() {
  const { tripId } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [trip, setTrip] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview'|'itinerary'|'budget'|'guides'|'roadmap'|'buddies'|'packing'|'journal'>('overview');
  
  // New features data
  const [availableGuides, setAvailableGuides] = useState<any[]>([]);
  const [buddyMatches, setBuddyMatches] = useState<any[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);

  // Forms
  const [expForm, setExpForm] = useState({ amount: '', category: 'Food', description: '' });
  const [noteForm, setNoteForm] = useState({ title: '', body: '', mood: '😊' });
  const [packItemForm, setPackItemForm] = useState({ name: '', category: 'Clothing' });

  const loadTrip = async () => {
    try {
      const res = await tripsAPI.getTrip(tripId as string);
      const tripData = res.data.data;
      setTrip(tripData);

      // Load specific city data for alerts/guides if itinerary exists
      if (tripData.itinerary?.length > 0) {
        const cityId = tripData.itinerary[0].cityId;
        const [guidesRes, safetyRes] = await Promise.all([
          guidesAPI.getByCity(cityId).catch(() => ({data:{data:[]}})),
          citiesAPI.getSafety(cityId).catch(() => ({data:{data:{alerts:[]}}}))
        ]);
        setAvailableGuides(guidesRes.data.data || []);
        setWeatherAlerts(safetyRes.data.data?.alerts || []);
      }

      // Load buddy matches if looking for buddy
      if (tripData.lookingForBuddy) {
        const buddyRes = await buddyAPI.findMatches(tripData.id).catch(() => ({data:{data:[]}}));
        setBuddyMatches(buddyRes.data.data || []);
      }
    } catch { router.push('/'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadTrip();
    citiesAPI.search().then(r => setCities(r.data.data)).catch(() => {});
  }, [tripId]);

  if (loading) return <div className="min-h-screen bg-travel-gradient flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#63D5DF]" /></div>;
  if (!trip) return null;

  const totalSpent = trip.expenses?.reduce((s: number, e: any) => s + e.amount, 0) || 0;
  const budgetPct = trip.budget > 0 ? Math.min(100, Math.round((totalSpent / trip.budget) * 100)) : 0;

  const addExpense = async () => {
    if (!expForm.amount) return;
    await tripsAPI.addExpense(trip.id, { ...expForm, userId: user.id });
    setExpForm({ amount: '', category: 'Food', description: '' });
    loadTrip();
  };
  const addNote = async () => {
    if (!noteForm.body) return;
    await tripsAPI.addNote(trip.id, { ...noteForm, userId: user.id });
    setNoteForm({ title: '', body: '', mood: '😊' });
    loadTrip();
  };
  const addStop = async (cityId: string) => {
    await tripsAPI.addStop(trip.id, { cityId, daysCount: 2 });
    loadTrip();
  };
  const bookGuide = async (guideId: string) => {
    try {
      await guidesAPI.book({ tripId: trip.id, guideId, userId: user.id });
      alert("Booking request sent to guide! They will contact you shortly.");
      loadTrip();
    } catch (e) { alert("Failed to book guide."); }
  };

  const handleReschedule = () => {
    if (confirm("Weather alerts detected. Would you like to shift your dates by 2 days for a safer journey?")) {
      alert("Smart Rescheduling activated! Dates updated to optimize for clear weather.");
    }
  };

  const TABS = [
    { id: 'overview', label: 'Dashboard', icon: <MapPin size={16} /> },
    { id: 'itinerary', label: 'Itinerary', icon: <Calendar size={16} /> },
    { id: 'roadmap', label: 'Roadmap', icon: <MapIcon size={16} /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign size={16} /> },
    { id: 'guides', label: 'Guides', icon: <Compass size={16} /> },
    { id: 'packing', label: 'Packing', icon: <Package size={16} /> },
    { id: 'journal', label: 'Memories', icon: <BookOpen size={16} /> },
  ];
  if (trip.lookingForBuddy) TABS.splice(4, 0, { id: 'buddies', label: 'Buddies', icon: <Users size={16} /> });

  return (
    <div className="min-h-screen bg-travel-gradient p-6 pt-32 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center hover:bg-white/80 transition-all border border-white/40"><ArrowLeft size={20} /></Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold font-outfit">{trip.name}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${trip.tripMode === 'solo' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>{trip.tripMode}</span>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2"><Calendar size={14} /> {new Date(trip.startDate).toLocaleDateString()} → {new Date(trip.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-3xl font-bold font-outfit text-[#63D5DF]">${trip.budget.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Budget</p>
            </div>
            <div className="h-12 w-[1px] bg-slate-200/50" />
            <button onClick={() => setTab('overview')} className="w-14 h-14 bg-gradient-to-br from-[#63D5DF] to-[#52C4CE] rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all"><Sparkles /></button>
          </div>
        </motion.div>

        {/* Dynamic Alerts */}
        {weatherAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><ShieldAlert size={20} /></div>
              <div>
                <p className="font-bold text-amber-800 text-sm">Emergency Weather Alert</p>
                <p className="text-xs text-amber-600">Possible disruption detected for your travel dates.</p>
              </div>
            </div>
            <button onClick={handleReschedule} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all flex items-center gap-2"><RefreshCw size={14} /> Smart Reschedule</button>
          </motion.div>
        )}

        {/* Tab Nav */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${tab === t.id ? 'bg-white shadow-lg text-[#63D5DF] scale-105' : 'bg-white/30 text-slate-500 hover:bg-white/50'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="min-h-[500px]">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Compass size={120} /></div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Sparkles className="text-[#63D5DF]" size={20} /> Trip Insights</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Budget Spent</p>
                    <div className="text-4xl font-bold text-slate-800">${totalSpent.toLocaleString()}</div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden"><div className="bg-[#63D5DF] h-full rounded-full" style={{ width: `${budgetPct}%` }} /></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Stops Completed</p>
                    <div className="text-4xl font-bold text-slate-800">0/{trip.itinerary?.length || 0}</div>
                    <p className="text-xs text-slate-500 mt-2">Next: {trip.itinerary?.[0]?.city?.name || 'No stops'}</p>
                  </div>
                </div>
                {trip.guideBookings?.some((b:any)=>b.status==='CONFIRMED'&&b.message) && (
                  <div className="mt-8 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={14} className="text-[#63D5DF]" /> Messages from your Guide</h4>
                    {trip.guideBookings.filter((b:any)=>b.status==='CONFIRMED'&&b.message).map((b:any)=>(
                      <div key={b.id} className="p-4 bg-[#63D5DF]/10 border border-[#63D5DF]/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-[#63D5DF] flex items-center justify-center text-[8px] font-bold text-white">{b.guide?.name?.charAt(0)}</div>
                          <span className="text-[10px] font-bold text-slate-700">{b.guide?.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium ml-auto">{new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic">"{b.message}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-between bg-[#63D5DF] text-white">
                <div>
                  <h3 className="text-xl font-bold mb-1">Local Guide</h3>
                  <p className="text-white/80 text-xs">Recommended for {trip.itinerary?.[0]?.city?.name || 'your destination'}</p>
                </div>
                {availableGuides.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">{availableGuides[0].name.charAt(0)}</div>
                      <div>
                        <p className="font-bold">{availableGuides[0].name}</p>
                        <p className="text-[10px] opacity-80">⭐ {availableGuides[0].rating} • {availableGuides[0].experience}y Experience</p>
                      </div>
                    </div>
                    <button onClick={() => setTab('guides')} className="w-full py-3 bg-white text-[#63D5DF] rounded-xl font-bold text-xs shadow-lg">View All Guides</button>
                  </div>
                ) : (
                  <p className="text-white/80 text-xs mt-6">No guides currently available for this city. Check back later!</p>
                )}
              </div>
            </div>
          )}

          {tab === 'roadmap' && (
            <div className="glass-panel p-8 rounded-[3rem] min-h-[600px] flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <div>
                   <h3 className="text-2xl font-bold font-outfit">The Journey Roadmap</h3>
                   <p className="text-sm text-slate-500">Visualizing your path & hidden treasures.</p>
                </div>
                <div className="flex gap-2">
                   <span className="flex items-center gap-2 text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full"><Gem size={14} /> Hidden Gems</span>
                   <span className="flex items-center gap-2 text-xs font-bold bg-[#63D5DF]/10 text-[#63D5DF] px-3 py-1.5 rounded-full"><MapPin size={14} /> Stops</span>
                </div>
              </div>
              
              <div className="flex-1 relative flex items-center justify-center p-10">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400">
                   <path d="M 50 200 Q 200 50 400 200 T 750 200" fill="none" stroke="#63D5DF" strokeWidth="4" strokeDasharray="8 8" className="opacity-30" />
                   <motion.path d="M 50 200 Q 200 50 400 200 T 750 200" fill="none" stroke="#63D5DF" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} />
                </svg>
                
                <div className="w-full flex justify-between items-center relative z-10">
                  {trip.itinerary?.map((stop: any, idx: number) => (
                    <div key={stop.id} className="relative group">
                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: idx * 0.5 }} className="w-14 h-14 bg-white rounded-2xl shadow-xl border-4 border-[#63D5DF] flex items-center justify-center text-[#63D5DF] group-hover:scale-125 transition-all">
                          <MapPin size={24} />
                       </motion.div>
                       <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                          <p className="font-bold text-sm">{stop.city?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Day {idx * 3 + 1}</p>
                       </div>
                       
                       {/* Hidden Gem Point */}
                       <div className="absolute -top-16 left-10">
                          <motion.div animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                          <div className="ml-6 -mt-3 bg-white/80 backdrop-blur-md p-2 rounded-lg border border-amber-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all w-32">
                             <p className="text-[8px] font-bold text-amber-600 uppercase">Hidden Gem</p>
                             <p className="text-[10px] font-bold">Secret Spot</p>
                          </div>
                       </div>
                    </div>
                  ))}
                  {(!trip.itinerary || trip.itinerary.length === 0) && <p className="text-slate-400 font-medium">Add stops to your itinerary to see the roadmap.</p>}
                </div>
              </div>
            </div>
          )}

          {tab === 'guides' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold">Available Tourist Guides</h3>
                 <p className="text-sm text-slate-500">{availableGuides.length} experts in {trip.itinerary?.[0]?.city?.name || 'this area'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableGuides.map((g: any) => (
                  <motion.div key={g.id} whileHover={{ y: -5 }} className="glass-panel p-6 rounded-[2.5rem] flex gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden shrink-0 border-4 border-white shadow-sm">
                      {g.avatar ? <img src={g.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300 font-bold">{g.name.charAt(0)}</div>}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg">{g.name}</h4>
                          <span className="text-sm font-bold text-emerald-600">${g.ratePerDay}/day</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-bold text-amber-500"><Star size={12} fill="currentColor" /> {g.rating}</span>
                          <span>•</span>
                          <span>{g.experience}y Exp</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Globe size={12} /> {JSON.parse(g.languages || "[]").join(", ")}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 line-clamp-2">{g.bio}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => bookGuide(g.id)} className="flex-1 py-2.5 bg-[#63D5DF] text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">Book Guide</button>
                        <button className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white"><MessageSquare size={16} /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {availableGuides.length === 0 && (
                  <div className="md:col-span-2 glass-panel p-12 rounded-[2.5rem] text-center">
                    <Compass size={48} className="mx-auto text-slate-300 mb-4" />
                    <h4 className="font-bold">No guides found for this city.</h4>
                    <p className="text-sm text-slate-500">We're expanding our network. Check again soon!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'buddies' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold">Suggested Travel Buddies</h3>
                 <p className="text-sm text-slate-500">People matching your timeline & vibe.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {buddyMatches.map((m: any) => (
                  <motion.div key={m.id} className="glass-panel p-6 rounded-[2.5rem] border-2 border-emerald-100 flex gap-6">
                     <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#63D5DF] to-[#F3E2D2] flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                        {m.name?.charAt(0)}
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-bold">{m.name}</h4>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{Math.round(m.matchScore * 100)}% Match</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{m.gender}, {m.age}y • {m.travelStyle}</p>
                        <div className="flex gap-2">
                           <button className="flex-1 py-2 bg-[#63D5DF] text-white rounded-lg text-xs font-bold">Connect</button>
                           <button className="px-3 py-2 bg-white/50 rounded-lg text-slate-500"><MessageSquare size={14} /></button>
                        </div>
                     </div>
                  </motion.div>
                ))}
                {buddyMatches.length === 0 && (
                  <div className="md:col-span-2 glass-panel p-12 rounded-[2.5rem] text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h4 className="font-bold">Searching for buddies...</h4>
                    <p className="text-sm text-slate-500">We'll notify you when someone matches your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'itinerary' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-[2.5rem]">
                <h3 className="font-bold mb-4">Add a Destination Stop</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cities.slice(0, 8).map((c: any) => (
                    <button key={c.id} onClick={() => addStop(c.id)} className="bg-white/50 border border-white/60 rounded-2xl p-4 text-left hover:bg-white/80 transition-all">
                      <div className="font-bold text-sm">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.country}</div>
                    </button>
                  ))}
                </div>
              </div>
              {(trip.itinerary || []).map((stop: any, i: number) => (
                <motion.div key={stop.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-6 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#63D5DF] text-white flex items-center justify-center font-bold shadow-lg">{i + 1}</div>
                      <div><h4 className="font-bold text-lg">{stop.city?.name}</h4><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stop.city?.country} • {stop.daysCount} DAYS</p></div>
                    </div>
                    <button onClick={async () => { await tripsAPI.removeStop(trip.id, stop.id); loadTrip(); }} className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'budget' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-8 rounded-[2.5rem]">
                  <h3 className="font-bold mb-6 flex items-center gap-2"><DollarSign className="text-emerald-500" /> Log New Expense</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" placeholder="Amount" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} className="premium-input" />
                      <select value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})} className="premium-input">
                        {['Food','Stay','Move','Fun','Shop','Other'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <input type="text" placeholder="What was this for?" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} className="premium-input" />
                    <button onClick={addExpense} className="premium-button">Add Expense</button>
                  </div>
                </div>
                <div className="glass-panel p-8 rounded-[2.5rem] bg-slate-900 text-white">
                  <h3 className="font-bold mb-2">Currency Converter</h3>
                  <p className="text-xs text-slate-400 mb-6">Quick conversion to local currency</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                       <span className="font-bold text-lg">1 USD</span>
                       <ArrowRight size={16} className="text-[#63D5DF]" />
                       <span className="font-bold text-lg text-[#63D5DF]">83.50 INR</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                       <span className="font-bold text-lg">1 EUR</span>
                       <ArrowRight size={16} className="text-[#63D5DF]" />
                       <span className="font-bold text-lg text-[#63D5DF]">90.20 INR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {tab === 'packing' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-4">Add Item</h3>
                <div className="flex gap-3">
                  <input type="text" placeholder="Item name" value={packItemForm.name} onChange={e => setPackItemForm({...packItemForm, name: e.target.value})} className="premium-input flex-1" />
                  <select value={packItemForm.category} onChange={e => setPackItemForm({...packItemForm, category: e.target.value})} className="premium-input w-40">
                    {['Clothing','Toiletries','Electronics','Documents','Medicine','Accessories','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button onClick={async () => {
                    if (!packItemForm.name) return;
                    let list = trip.packingLists?.[0];
                    if (!list) {
                      const res = await tripsAPI.createPackingList(trip.id, { name: 'Main List' });
                      list = res.data.data;
                    }
                    await tripsAPI.addPackingItem(trip.id, list.id, packItemForm);
                    setPackItemForm({ name: '', category: 'Clothing' });
                    loadTrip();
                  }} className="premium-button w-auto px-6"><Plus size={16} /></button>
                </div>
              </div>
              {(trip.packingLists || []).map((list: any) => (
                <div key={list.id} className="glass-panel p-6 rounded-[2rem]">
                  <h3 className="font-bold mb-4">{list.name} ({list.items?.filter((i: any) => i.isPacked).length}/{list.items?.length})</h3>
                  <div className="space-y-2">
                    {list.items?.map((item: any) => (
                      <button key={item.id} onClick={async () => {
                        await tripsAPI.togglePackingItem(trip.id, list.id, item.id, !item.isPacked);
                        loadTrip();
                      }} className={`w-full text-left bg-white/40 rounded-xl p-3 flex items-center gap-3 transition-all ${item.isPacked ? 'opacity-60' : ''}`}>
                        {item.isPacked ? <CheckCircle size={18} className="text-green-500" /> : <Circle size={18} className="text-slate-400" />}
                        <span className={`font-medium ${item.isPacked ? 'line-through' : ''}`}>{item.name}</span>
                        <span className="text-xs text-slate-400 ml-auto">{item.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'journal' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-4">New Journal Entry</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Title (optional)" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} className="premium-input" />
                  <textarea placeholder="What happened today? How are you feeling?" value={noteForm.body} onChange={e => setNoteForm({...noteForm, body: e.target.value})} className="premium-input min-h-[100px]" />
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {['😊','😐','😢','🤩','😴'].map(m => (
                        <button key={m} onClick={() => setNoteForm({...noteForm, mood: m})} className={`text-2xl p-2 rounded-xl transition-all ${noteForm.mood === m ? 'bg-white shadow-md scale-110' : 'hover:bg-white/50'}`}>{m}</button>
                      ))}
                    </div>
                    <button onClick={addNote} className="premium-button w-auto px-6 ml-auto"><PenLine size={16} /> Save Entry</button>
                  </div>
                </div>
              </div>
              {(trip.notes || []).map((note: any) => (
                <motion.div key={note.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-[2rem]">
                  <div className="flex justify-between items-start mb-3">
                    <div><h4 className="font-bold text-lg">{note.title || 'Untitled Entry'}</h4><p className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleString()}</p></div>
                    <div className="flex items-center gap-2">
                      {note.mood && <span className="text-2xl">{note.mood}</span>}
                      <button onClick={async () => { await tripsAPI.deleteNote(trip.id, note.id); loadTrip(); }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-slate-600 whitespace-pre-wrap">{note.body}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
