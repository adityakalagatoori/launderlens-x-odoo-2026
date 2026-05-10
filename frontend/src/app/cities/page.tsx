"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, DollarSign, Cloud, CheckCircle, ShieldCheck, ArrowLeft, ChevronRight, X, AlertTriangle, Star, Clock, Users, Heart, Scale, ThermometerSun, Info, Wind, Loader2, Plus } from 'lucide-react';
import { citiesAPI, activitiesAPI, wishlistAPI } from '@/lib/api';
import Link from 'next/link';

export default function CitiesDiscovery() {
  const [cities, setCities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [cityActivities, setCityActivities] = useState<any[]>([]);
  const [safetyData, setSafetyData] = useState<any>(null);
  const [regionFilter, setRegionFilter] = useState('');
  const [costFilter, setCostFilter] = useState('');
  
  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);

  // Comparison state
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    loadCities();
    loadWishlist();
  }, []);

  const loadCities = async () => {
    try {
      const r = await citiesAPI.search();
      setCities(r.data.data);
    } finally { setLoading(false); }
  };

  const loadWishlist = async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      const ids = new Set(res.data.data.map((w: any) => w.cityId));
      setWishlistIds(ids);
    } catch (e) {}
  };

  const toggleWishlist = async (e: React.MouseEvent, cityId: string) => {
    e.stopPropagation();
    setWishlistLoading(cityId);
    try {
      await wishlistAPI.toggleCity(cityId);
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (next.has(cityId)) next.delete(cityId);
        else next.add(cityId);
        return next;
      });
    } catch (e) {} finally { setWishlistLoading(null); }
  };

  const addToCompare = (city: any) => {
    if (compareList.find(c => c.id === city.id)) return;
    if (compareList.length >= 3) {
      alert("You can compare up to 3 cities.");
      return;
    }
    setCompareList([...compareList, city]);
    setShowCompare(true);
  };

  const removeFromCompare = (id: string) => {
    setCompareList(compareList.filter(c => c.id !== id));
  };

  const openCity = async (city: any) => {
    setSelectedCity(city);
    try {
      const [full, safety] = await Promise.all([
        citiesAPI.getCity(city.id),
        citiesAPI.getSafety(city.id)
      ]);
      setSelectedCity(full.data.data);
      setCityActivities(full.data.data.activities || []);
      setSafetyData(safety.data.data);
    } catch (e) { console.error(e); }
  };

  const closeCity = () => { setSelectedCity(null); setCityActivities([]); setSafetyData(null); };

  const regions = [...new Set(cities.map((c: any) => c.region))];
  const filtered = cities.filter((c: any) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.country.toLowerCase().includes(search.toLowerCase())) return false;
    if (regionFilter && c.region !== regionFilter) return false;
    if (costFilter && c.costLevel !== parseInt(costFilter)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-travel-gradient p-6 pt-32 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8 rounded-[2rem]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/80 transition-colors border border-white/40"><ArrowLeft size={18} /></Link>
              <div><h1 className="text-3xl font-bold font-outfit">City Discovery</h1><p className="text-slate-500 text-sm">Find your next destination with real-time weather & alerts.</p></div>
            </div>
            {compareList.length > 0 && (
              <button onClick={() => setShowCompare(true)} className="flex items-center gap-2 px-4 py-2 bg-[#63D5DF] text-white rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all">
                <Scale size={16} /> Compare ({compareList.length})
              </button>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search by city or country..." value={search} onChange={e => setSearch(e.target.value)} className="premium-input pl-12" />
            </div>
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="premium-input w-full md:w-44">
              <option value="">All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={costFilter} onChange={e => setCostFilter(e.target.value)} className="premium-input w-full md:w-44">
              <option value="">Any Budget</option>
              <option value="1">$ Budget</option><option value="2">$$ Mid-Range</option><option value="3">$$$ Moderate</option><option value="4">$$$$ Premium</option><option value="5">$$$$$ Luxury</option>
            </select>
          </div>
        </motion.div>

        {/* City Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium flex flex-col items-center gap-4"><Loader2 className="w-8 h-8 animate-spin text-[#63D5DF]" /> Loading destinations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((city: any, i: number) => (
              <motion.div key={city.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={() => openCity(city)}>
                <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${city.coverImage})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={(e) => toggleWishlist(e, city.id)} className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${wishlistIds.has(city.id) ? 'bg-rose-500 text-white' : 'bg-white/80 text-rose-500 hover:bg-rose-50'}`}>
                      {wishlistLoading === city.id ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill={wishlistIds.has(city.id) ? "currentColor" : "none"} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); addToCompare(city); }} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#63D5DF] hover:bg-white transition-all">
                      <Scale size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold">{city.region}</div>
                  <div className="absolute bottom-3 right-3 bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-bold">★ {city.rating}</div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold font-outfit">{city.name}</h3>
                  <p className="text-slate-500 flex items-center gap-1 text-sm mb-3"><MapPin className="w-4 h-4" /> {city.country}</p>
                  
                  {/* Real-time Insights Snippet */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full whitespace-nowrap"><ThermometerSun size={10} /> {city.climate}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-full whitespace-nowrap"><Info size={10} /> Best: {city.bestTimeToVisit}</span>
                    {city.seasonalAlerts && <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-full whitespace-nowrap"><AlertTriangle size={10} /> Alert</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Level {city.costLevel}/5</div>
                    <div className="flex items-center gap-1.5 text-slate-600"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Safety: {city.safetyScore}%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">{city._count?.activities || city.activities?.length || 0} activities</span>
                    <span className="text-sm font-bold text-[#63D5DF] group-hover:underline">Explore →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Comparison Tool Modal */}
        <AnimatePresence>
          {showCompare && (
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 z-50 p-6 md:p-8">
              <div className="max-w-6xl mx-auto glass-panel p-6 rounded-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-white/60">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold font-outfit flex items-center gap-3"><Scale className="text-[#63D5DF]" /> Destination Comparison</h2>
                  <button onClick={() => setShowCompare(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {compareList.map(city => (
                    <div key={city.id} className="bg-white/40 border border-white/60 p-5 rounded-3xl relative">
                      <button onClick={() => removeFromCompare(city.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><X size={16} /></button>
                      <h4 className="font-bold text-lg mb-1">{city.name}</h4>
                      <p className="text-xs text-slate-500 mb-4">{city.country}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Safety Score</span><span className="font-bold">{city.safetyScore}%</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Cost Level</span><span className="font-bold">{city.costLevel}/5</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Climate</span><span className="font-bold">{city.climate}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Best Visit</span><span className="font-bold">{city.bestTimeToVisit}</span></div>
                      </div>
                    </div>
                  ))}
                  {compareList.length < 3 && (
                    <div className="border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <Plus size={32} className="mb-2 opacity-50" />
                      <p className="text-sm font-medium">Select another city to compare</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* City Detail Modal */}
        <AnimatePresence>
          {selectedCity && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeCity}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 backdrop-blur-xl rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Hero */}
                <div className="h-64 bg-cover bg-center relative rounded-t-[2rem]" style={{ backgroundImage: `url(${selectedCity.coverImage})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-[2rem]" />
                  <div className="absolute top-4 right-4 flex gap-2">
                     <button onClick={(e) => toggleWishlist(e, selectedCity.id)} className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${wishlistIds.has(selectedCity.id) ? 'bg-rose-500 text-white' : 'bg-white/80 text-rose-500 hover:bg-rose-50'}`}>
                      {wishlistLoading === selectedCity.id ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill={wishlistIds.has(selectedCity.id) ? "currentColor" : "none"} />}
                    </button>
                    <button onClick={closeCity} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors"><X size={18} /></button>
                  </div>
                  <div className="absolute bottom-4 left-6 text-white">
                    <h2 className="text-4xl font-bold font-outfit">{selectedCity.name}</h2>
                    <p className="text-white/80 text-lg">{selectedCity.country} · {selectedCity.region}</p>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Real-time Contextual Alerts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                      <h4 className="font-bold flex items-center gap-2 text-blue-700 mb-1"><ThermometerSun size={18} /> Weather & Best Time</h4>
                      <p className="text-sm text-blue-600">{selectedCity.climate}. Best visited during <strong>{selectedCity.bestTimeToVisit}</strong>.</p>
                      {selectedCity.bestTimeInfo && <p className="text-xs text-blue-500 mt-2">{selectedCity.bestTimeInfo}</p>}
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                      <h4 className="font-bold flex items-center gap-2 text-amber-700 mb-1"><Wind size={18} /> Tourism Traffic</h4>
                      <p className="text-sm text-amber-600">Peak months: <strong>{selectedCity.highTrafficMonths || "June, July, August"}</strong>.</p>
                      <p className="text-xs text-amber-500 mt-2">Expect high traffic and prices during these periods.</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Rating', value: `★ ${selectedCity.rating}`, color: 'bg-emerald-50 text-emerald-700' },
                      { label: 'Safety', value: `${selectedCity.safetyScore}%`, color: 'bg-green-50 text-green-700' },
                      { label: 'Cost', value: `${'$'.repeat(selectedCity.costLevel)}`, color: 'bg-emerald-50 text-emerald-700' },
                      { label: 'Visa', value: selectedCity.visaRequired ? 'Required' : 'Free Entry', color: 'bg-purple-50 text-purple-700' },
                    ].map(s => (
                      <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center`}>
                        <div className="text-lg font-bold">{s.value}</div>
                        <div className="text-xs font-semibold opacity-70">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div><h3 className="font-bold text-lg mb-2">About the City</h3><p className="text-slate-600 text-sm leading-relaxed">{selectedCity.description}</p></div>

                  {/* Safety Alerts */}
                  {safetyData?.alerts?.length > 0 && (
                    <div className="bg-white/50 border border-white/60 p-5 rounded-[2rem]">
                      <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> Current Safety Alerts</h3>
                      <div className="space-y-3">
                        {safetyData.alerts.map((a: any) => (
                          <div key={a.id} className={`rounded-2xl p-4 text-sm flex items-start gap-4 ${a.severity === 'HIGH' ? 'bg-red-50 border border-red-100' : a.severity === 'MEDIUM' ? 'bg-amber-50 border border-amber-100' : 'bg-blue-50 border border-blue-100'}`}>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${a.severity === 'HIGH' ? 'bg-red-200 text-red-800' : a.severity === 'MEDIUM' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'}`}>{a.severity}</span>
                            <div><strong className="block text-slate-800">{a.type}</strong><p className="text-slate-600 mt-1">{a.body}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  {cityActivities.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Top Experiences ({cityActivities.length})</h3>
                        <span className="text-xs text-[#63D5DF] font-bold uppercase tracking-wider">Experiences Tab</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cityActivities.map((act: any) => (
                          <div key={act.id} className="bg-white/50 border border-white/60 rounded-[2rem] p-4 flex gap-4 hover:shadow-md transition-all">
                            <div className="w-20 h-20 rounded-2xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${act.imageUrl})` }} />
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-sm">{act.name}</h4>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{act.category} · {act.duration} min</p>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-emerald-600">{act.cost === 0 ? 'Free' : `$${act.cost}`}</span>
                                <button className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-rose-500 hover:bg-[#63D5DF] hover:text-white transition-all shadow-sm"><Heart size={14} /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href={`/trips/new?city=${selectedCity.id}`} className="premium-button block text-center shadow-xl">
                    <span className="relative z-10 flex items-center justify-center gap-2">Start Planning Journey <ChevronRight size={18} /></span>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
