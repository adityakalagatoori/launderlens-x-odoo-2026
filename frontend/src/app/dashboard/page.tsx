"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Heart, Plane, Settings, Compass, DollarSign, Sparkles, ArrowRight, ChevronRight, UserPlus, Info, Gem, Utensils, Zap, Loader2, Search, Trash2, Plus, Calendar, Package, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { api, wishlistAPI, buddyAPI, tripsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const VIBES = ['Adventure','Relaxation','Cultural','Foodie','Nightlife','Nature','Luxury','Budget'];
const REGIONS = ['Europe','Asia','Americas','Africa','Oceania','Middle East'];
const BUDGETS = ['Budget ($0-50/day)','Mid-range ($50-150/day)','Comfort ($150-300/day)','Luxury ($300+/day)'];
const STYLES = ['Solo Explorer','Backpacker','Business','Family','Romantic','Group Adventure'];
const PACES = ['Slow','Moderate','Fast'];
const DIETS = ['None','Vegetarian','Vegan','Halal','Gluten-Free'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [cityWishlist, setCityWishlist] = useState<any[]>([]);
  const [activityWishlist, setActivityWishlist] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizData, setQuizData] = useState({ 
    travelStyle:'', tripVibe:'', preferredBudget:'', preferredRegions:[] as string[], 
    age:'', gender:'', travelPace: 'Moderate', dietary: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [packingItems, setPackingItems] = useState([
    { id: '1', name: 'Passport & Visas', category: 'Documents', checked: false },
    { id: '2', name: 'Universal Power Adapter', category: 'Electronics', checked: false },
    { id: '3', name: 'First Aid Kit', category: 'Medicine', checked: false },
    { id: '4', name: 'Travel Insurance Info', category: 'Documents', checked: false }
  ]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const el = document.getElementById(hash.substring(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [loading]);

  const togglePackingItem = (id: string) => {
    setPackingItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addPackingItem = () => {
    if (!newItem.trim()) return;
    const item = { id: Date.now().toString(), name: newItem, category: 'Personal', checked: false };
    setPackingItems([...packingItems, item]);
    setNewItem('');
  };

  const deletePackingItem = (id: string) => {
    setPackingItems(prev => prev.filter(item => item.id !== id));
  };

  const now = new Date();

  const loadData = async () => {
    setLoading(true);
    try {
      const [tripsRes, wishRes, prefsRes] = await Promise.all([
        api.get('/trips'), 
        wishlistAPI.getWishlist().catch(() => ({data:{data:[]}})),
        buddyAPI.getPreferences().catch(() => ({data:{data:null}}))
      ]);
      setTrips(tripsRes.data.data || []);
      const allWish = wishRes.data.data || [];
      setCityWishlist(allWish.filter((w:any) => w.cityId));
      setActivityWishlist(allWish.filter((w:any) => w.activityId));

      const p = prefsRes.data.data;
      setPrefs(p);
      if(p) setQuizData({ 
        travelStyle:p.travelStyle||'', tripVibe:p.tripVibe||'', preferredBudget:p.preferredBudget||'', 
        preferredRegions:p.preferredRegions?JSON.parse(p.preferredRegions):[], age:p.age?.toString()||'', 
        gender:p.gender||'', travelPace: p.travelPace || 'Moderate',
        dietary: p.dietaryRestrictions ? JSON.parse(p.dietaryRestrictions) : []
      });
    } catch(e){console.error(e)} finally{setLoading(false)}
  };

  useEffect(() => { loadData(); }, []);

  const upcomingTrips = trips.filter(t => new Date(t.startDate) > now).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const featuredTrip = upcomingTrips[0];

  const deleteTrip = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm('Delete this trip?')) {
      await tripsAPI.deleteTrip(id);
      loadData();
    }
  };

  const savePreferences = async () => {
    try {
      await buddyAPI.updatePreferences({ 
        travelStyle:quizData.travelStyle, tripVibe:quizData.tripVibe, preferredBudget:quizData.preferredBudget, 
        preferredRegions:quizData.preferredRegions, age:quizData.age?parseInt(quizData.age):undefined, 
        gender:quizData.gender, travelPace: quizData.travelPace, dietaryRestrictions: quizData.dietary
      });
      setShowQuiz(false); loadData();
    } catch(e){console.error(e)}
  };

  const toggleRegion = (r:string) => setQuizData(prev => ({...prev, preferredRegions: prev.preferredRegions.includes(r) ? prev.preferredRegions.filter(x=>x!==r) : [...prev.preferredRegions, r]}));
  const toggleDiet = (d:string) => setQuizData(prev => ({...prev, dietary: prev.dietary.includes(d) ? prev.dietary.filter(x=>x!==d) : [...prev.dietary, d]}));

  if (loading) return <div className="min-h-screen bg-travel-gradient flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#63D5DF]" /></div>;

  return (
    <div className="min-h-screen p-6 pt-32 lg:pr-12 text-slate-800 bg-travel-gradient">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Welcome Header */}
        <section>
          <h1 className="text-4xl font-bold font-outfit tracking-tight text-slate-900">Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}!</h1>
          {featuredTrip && <p className="text-slate-500 font-medium mt-2">Your trip &quot;{featuredTrip.name}&quot; is coming up!</p>}
        </section>

        {/* Featured Trip Card (As in Image 2) */}
        {featuredTrip && (
          <Link href={`/trips/${featuredTrip.id}`}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel mt-6 p-8 rounded-[2.5rem] border border-white/60 bg-white/40 hover:bg-white/60 transition-all group flex items-center gap-8 shadow-xl">
               <div className="w-20 h-20 rounded-3xl bg-[#63D5DF] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                  <Plane size={40} />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-slate-800">{featuredTrip.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-slate-500 font-bold text-sm">
                    <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(featuredTrip.startDate).toLocaleDateString()} - {new Date(featuredTrip.endDate).toLocaleDateString()}</span>
                  </div>
               </div>
               <ChevronRight className="ml-auto text-[#63D5DF] group-hover:translate-x-2 transition-all" size={32} />
            </motion.div>
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Trip List Section (As in Image 2) */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Your Trips ({trips.length})</h2>
                <Link href="/trips/new" className="text-sm font-bold text-[#63D5DF] flex items-center gap-1 hover:underline">
                  + New Trip
                </Link>
              </div>
              <div className="space-y-4">
                {trips.map(t => (
                  <Link key={t.id} href={`/trips/${t.id}`}>
                    <div className="glass-panel p-5 rounded-3xl border border-white/60 flex items-center justify-between group hover:bg-white/60 transition-all">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${new Date(t.startDate) > now ? 'bg-blue-400' : 'bg-slate-400'}`}>
                             <Plane size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{t.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.tripType} • ${t.budget} • {new Date(t.startDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <button onClick={(e) => deleteTrip(e, t.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                             <Trash2 size={16} />
                          </button>
                          <ChevronRight className="text-slate-300 group-hover:text-[#63D5DF] transition-all" size={20} />
                       </div>
                    </div>
                  </Link>
                ))}
                {trips.length === 0 && (
                  <div className="p-12 text-center glass-panel rounded-3xl border-dashed border-2 border-white/40 text-slate-400">
                    No trips found. Start by planning one!
                  </div>
                )}
              </div>
            </section>

            {/* Dashboard Stats */}
            <section id="wishlist" className="grid grid-cols-2 gap-4">
              {[
                {label:'Wishlisted',value:cityWishlist.length + activityWishlist.length,icon:<Heart size={20}/>,color:'from-rose-500 to-pink-400'},
                {label:'Buddy Mode',value:trips.filter(t=>t.lookingForBuddy).length > 0 ? 'Active' : 'Off',icon:<UserPlus size={20}/>,color:'from-emerald-500 to-teal-400'},
              ].map((s,i)=>(
                <div key={s.label} className="glass-panel p-6 rounded-3xl border border-white/60 flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>{s.icon}</div>
                  <div>
                    <div className="text-2xl font-bold font-outfit text-slate-800">{s.value}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.label}</div>
                  </div>
                </div>
              ))}
            </section>

            {/* Global Packing List Section */}
            <section id="packing" className="glass-panel p-8 rounded-[2.5rem] border border-white/60 bg-white/20">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3"><Package className="text-[#63D5DF]" /> Global Packing List</h2>
                  <div className="flex items-center gap-3">
                     <input 
                        type="text" 
                        value={newItem} 
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add item..." 
                        className="bg-white/50 border border-white/40 px-4 py-2 rounded-xl text-xs outline-none focus:bg-white transition-all w-32 md:w-44"
                        onKeyDown={(e) => e.key === 'Enter' && addPackingItem()}
                     />
                     <button onClick={addPackingItem} className="w-8 h-8 bg-[#63D5DF] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                        <Plus size={16} />
                     </button>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packingItems.map(item => (
                    <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${item.checked ? 'bg-white/20 border-white/40 grayscale opacity-60' : 'bg-white/40 border-white/60 hover:bg-white'}`} onClick={() => togglePackingItem(item.id)}>
                       <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${item.checked ? 'bg-[#63D5DF] border-[#63D5DF]' : 'border-[#63D5DF] bg-white'}`}>
                          {item.checked && <CheckCircle className="text-white w-3 h-3" />}
                       </div>
                       <div className="flex-1">
                          <p className={`text-sm font-bold transition-all ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</p>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); deletePackingItem(item.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                          <Trash2 size={14} />
                       </button>
                    </div>
                  ))}
               </div>
               <div className="mt-8 p-4 bg-white/40 rounded-2xl border border-white/60 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                     {packingItems.filter(i => i.checked).length} of {packingItems.length} items packed
                  </p>
                  <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                     <motion.div 
                        className="h-full bg-[#63D5DF]" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(packingItems.filter(i => i.checked).length / packingItems.length) * 100}%` }}
                     />
                  </div>
               </div>
            </section>
          </div>

          {/* Sidebar Section (Preferences & Wishlist) */}
          <div className="space-y-8">
            {/* My DNA Card */}
            <div className="glass-panel p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Sparkles size={100} /></div>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="text-amber-400" /> My DNA</h3>
                  <button onClick={()=>{setShowQuiz(true);setQuizStep(0)}} className="text-[10px] font-bold uppercase tracking-widest text-[#63D5DF]">Update</button>
               </div>
               <div className="space-y-4">
                 {prefs ? (
                   <>
                    <div className="flex flex-wrap gap-2">
                      {[prefs.travelStyle, prefs.tripVibe, prefs.travelPace].filter(Boolean).map(p => (
                        <span key={p} className="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider">{p}</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Complete your profile to unlock more personalized experiences and matching accuracy.</p>
                   </>
                 ) : (
                   <div className="text-center py-4">
                      <p className="text-xs text-slate-400 mb-6">Complete your quiz to see personalized data.</p>
                      <button onClick={()=>{setShowQuiz(true);setQuizStep(0)}} className="w-full py-4 bg-[#63D5DF] text-white rounded-2xl text-xs font-bold shadow-lg hover:shadow-[0_10px_20px_rgba(99,213,223,0.3)] transition-all">Take the Quiz</button>
                   </div>
                 )}
               </div>
            </div>

            {/* Wishlist Card */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/60">
               <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800"><Heart className="text-rose-500" /> Wishlist</h3>
               <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                  {cityWishlist.map(w => (
                    <Link key={w.id} href="/cities" className="flex items-center gap-4 p-3 bg-white/40 rounded-2xl hover:bg-white transition-all group">
                       <div className="w-12 h-12 rounded-xl bg-cover bg-center border-2 border-white shadow-sm" style={{backgroundImage: `url(${w.city?.coverImage})`}} />
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-700">{w.city?.name}</h4>
                          <p className="text-[10px] text-slate-400">{w.city?.country}</p>
                       </div>
                    </Link>
                  ))}
                  {cityWishlist.length === 0 && activityWishlist.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-10 italic">Wishlist items will appear here.</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal (Same as before) */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6" onClick={()=>setShowQuiz(false)}>
            <motion.div initial={{scale:0.9, y: 20}} animate={{scale:1, y: 0}} exit={{scale:0.9, y: 20}} className="glass-panel w-full max-w-xl p-10 rounded-[3rem] shadow-2xl relative overflow-hidden" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setShowQuiz(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-all"><XIcon size={24} /></button>
              
              <div className="mb-10">
                 <h3 className="text-3xl font-bold font-outfit mb-2 tracking-tight">Trip DNA</h3>
                 <p className="text-sm text-slate-500 font-medium">Step {quizStep+1} of 5 — Fine-tuning your world.</p>
                 <div className="h-1.5 bg-slate-100 rounded-full mt-5 overflow-hidden"><div className="h-full bg-gradient-to-r from-[#63D5DF] to-[#52C4CE] rounded-full transition-all duration-500" style={{width:`${((quizStep+1)/5)*100}%`}}/></div>
              </div>

              <div className="min-h-[320px]">
                {quizStep===0&&<div className="space-y-4">
                   <h4 className="font-bold text-lg text-slate-800">What is your travel style?</h4>
                   <div className="grid grid-cols-2 gap-3">{STYLES.map(s=><button key={s} onClick={()=>setQuizData({...quizData,travelStyle:s})} className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${quizData.travelStyle===s?'bg-[#63D5DF]/10 border-[#63D5DF] text-[#63D5DF]':'bg-white/40 border-slate-50 text-slate-500 hover:border-slate-200'}`}>{s}</button>)}</div>
                </div>}
                {quizStep===1&&<div className="space-y-4">
                   <h4 className="font-bold text-lg text-slate-800">Preferred trip vibe?</h4>
                   <div className="grid grid-cols-2 gap-3">{VIBES.map(v=><button key={v} onClick={()=>setQuizData({...quizData,tripVibe:v})} className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${quizData.tripVibe===v?'bg-[#63D5DF]/10 border-[#63D5DF] text-[#63D5DF]':'bg-white/40 border-slate-50 text-slate-500 hover:border-slate-200'}`}>{v}</button>)}</div>
                </div>}
                {quizStep===2&&<div className="space-y-4">
                   <h4 className="font-bold text-lg text-slate-800">Budget & Regions</h4>
                   <div className="space-y-2">{BUDGETS.map(b=><button key={b} onClick={()=>setQuizData({...quizData,preferredBudget:b})} className={`w-full p-4 rounded-2xl border-2 text-sm font-bold text-left transition-all ${quizData.preferredBudget===b?'bg-[#63D5DF]/10 border-[#63D5DF] text-[#63D5DF]':'bg-white/40 border-slate-50 text-slate-500'}`}>{b}</button>)}</div>
                </div>}
                {quizStep===3&&<div className="space-y-6">
                   <h4 className="font-bold text-lg text-slate-800">Dietary & Pace</h4>
                   <div className="flex flex-wrap gap-2">{DIETS.map(d=><button key={d} onClick={()=>toggleDiet(d)} className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${quizData.dietary.includes(d)?'bg-emerald-500 border-emerald-500 text-white':'bg-white/40 border-slate-100 text-slate-500'}`}>{d}</button>)}</div>
                   <div className="grid grid-cols-3 gap-2 pt-4">{PACES.map(p=><button key={p} onClick={()=>setQuizData({...quizData,travelPace:p})} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${quizData.travelPace===p?'bg-amber-400 border-amber-400 text-white':'bg-white/40 border-slate-50 text-slate-500'}`}>{p}</button>)}</div>
                </div>}
                {quizStep===4&&<div className="space-y-6">
                   <h4 className="font-bold text-lg text-slate-800">Safety Verification</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <input type="number" value={quizData.age} onChange={e=>setQuizData({...quizData,age:e.target.value})} className="premium-input" placeholder="Age"/>
                      <select value={quizData.gender} onChange={e=>setQuizData({...quizData,gender:e.target.value})} className="premium-input"><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
                   </div>
                </div>}
              </div>

              <div className="flex justify-between mt-12 pt-8 border-t border-slate-100">
                <button onClick={()=>quizStep>0?setQuizStep(quizStep-1):setShowQuiz(false)} className="px-8 py-3 text-sm font-bold text-slate-400 hover:text-slate-800 transition-all">{quizStep===0?'Cancel':'Back'}</button>
                <button onClick={()=>quizStep<4?setQuizStep(quizStep+1):savePreferences()} className="px-10 py-3 bg-[#63D5DF] text-white font-bold rounded-2xl text-sm shadow-xl hover:scale-105 transition-all">{quizStep<4?'Next Step':'Complete'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
