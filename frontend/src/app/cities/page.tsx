"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, DollarSign, Cloud, CheckCircle, ShieldCheck, ArrowLeft, X, AlertTriangle, Star, Clock, Users } from 'lucide-react';
import { citiesAPI, activitiesAPI } from '@/lib/api';
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

  useEffect(() => {
    citiesAPI.search().then(r => { setCities(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

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
    <div className="min-h-screen p-6 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8 rounded-[2rem]">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/80 transition-colors border border-white/40"><ArrowLeft size={18} /></Link>
            <div><h1 className="text-3xl font-bold font-outfit">City Discovery</h1><p className="text-slate-500 text-sm">Find your next destination — real data, real cities.</p></div>
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
          <p className="text-xs text-slate-400 mt-3">{filtered.length} destination{filtered.length !== 1 ? 's' : ''} found</p>
        </motion.div>

        {/* City Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading destinations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((city: any, i: number) => (
              <motion.div key={city.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={() => openCity(city)}>
                <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${city.coverImage})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold">{city.region}</div>
                  <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold">★ {city.rating}</div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold font-outfit">{city.name}</h3>
                  <p className="text-slate-500 flex items-center gap-1 text-sm mb-3"><MapPin className="w-4 h-4" /> {city.country}</p>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{city.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Level {city.costLevel}/5</div>
                    <div className="flex items-center gap-1.5 text-slate-600"><Cloud className="w-3.5 h-3.5 text-blue-500" /> {city.climate}</div>
                    <div className="flex items-center gap-1.5 text-slate-600"><CheckCircle className="w-3.5 h-3.5 text-orange-500" /> Visa: {city.visaRequired ? 'Yes' : 'Free'}</div>
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

        {/* City Detail Modal */}
        <AnimatePresence>
          {selectedCity && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeCity}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 backdrop-blur-xl rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Hero */}
                <div className="h-56 bg-cover bg-center relative rounded-t-[2rem]" style={{ backgroundImage: `url(${selectedCity.coverImage})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-[2rem]" />
                  <button onClick={closeCity} className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors"><X size={18} /></button>
                  <div className="absolute bottom-4 left-6 text-white">
                    <h2 className="text-3xl font-bold font-outfit">{selectedCity.name}</h2>
                    <p className="text-white/80">{selectedCity.country} · {selectedCity.region}</p>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Rating', value: `★ ${selectedCity.rating}`, color: 'bg-amber-50 text-amber-700' },
                      { label: 'Safety', value: `${selectedCity.safetyScore}/100`, color: 'bg-green-50 text-green-700' },
                      { label: 'Cost', value: `${'$'.repeat(selectedCity.costLevel)}`, color: 'bg-blue-50 text-blue-700' },
                      { label: 'Visa', value: selectedCity.visaRequired ? 'Required' : 'Free Entry', color: 'bg-purple-50 text-purple-700' },
                    ].map(s => (
                      <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center`}>
                        <div className="text-lg font-bold">{s.value}</div>
                        <div className="text-xs font-semibold opacity-70">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div><h3 className="font-bold mb-2">About</h3><p className="text-slate-600 text-sm">{selectedCity.description}</p></div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-500">Climate:</span> <strong>{selectedCity.climate}</strong></div>
                    <div><span className="text-slate-500">Currency:</span> <strong>{selectedCity.currency}</strong></div>
                    <div><span className="text-slate-500">Population:</span> <strong>{selectedCity.population?.toLocaleString()}</strong></div>
                    <div><span className="text-slate-500">Best Time:</span> <strong>{selectedCity.bestTimeToVisit}</strong></div>
                  </div>

                  {/* Safety Alerts */}
                  {safetyData?.alerts?.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Safety Alerts</h3>
                      <div className="space-y-2">
                        {safetyData.alerts.map((a: any) => (
                          <div key={a.id} className={`rounded-xl p-3 text-sm flex items-start gap-3 ${a.severity === 'HIGH' ? 'bg-red-50 border border-red-200' : a.severity === 'MEDIUM' ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${a.severity === 'HIGH' ? 'bg-red-200 text-red-800' : a.severity === 'MEDIUM' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'}`}>{a.severity}</span>
                            <div><strong>{a.type}</strong><p className="text-slate-600 mt-0.5">{a.body}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities in this city */}
                  {cityActivities.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-3">Activities in {selectedCity.name} ({cityActivities.length})</h3>
                      <div className="space-y-3">
                        {cityActivities.map((act: any) => (
                          <div key={act.id} className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${act.imageUrl})` }} />
                            <div className="flex-1">
                              <h4 className="font-bold">{act.name}</h4>
                              <p className="text-xs text-slate-500">{act.category} · {act.duration} min · {act.timeOfDay}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{act.cost === 0 ? 'Free' : `$${act.cost}`}</div>
                              <div className="text-xs text-slate-400">★ {act.rating}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href="/trips/new" className="premium-button block text-center">Plan a Trip to {selectedCity.name}</Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
