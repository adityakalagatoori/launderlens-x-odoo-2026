"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Compass, Star, Clock, Sparkles } from 'lucide-react';
import { activitiesAPI } from '@/lib/api';

export default function ActivitiesDiscovery() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [rouletteResult, setRouletteResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await activitiesAPI.search();
        setActivities(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const handleDetourRoulette = async () => {
    setSpinning(true);
    try {
      // Simulate roulette spin time
      await new Promise(r => setTimeout(r, 1500));
      const res = await activitiesAPI.getDetour('', 100); // no city limit, $100 budget
      setRouletteResult(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSpinning(false);
    }
  };

  const filtered = activities.filter((a: any) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-travel-gradient p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Roulette Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 glass-panel p-8 rounded-[2rem] flex flex-col justify-center"
          >
            <h1 className="text-4xl font-bold font-heading mb-2">Experiences</h1>
            <p className="text-slate-600 mb-6">Discover booking-ready tours, attractions, and secrets.</p>
            
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search experiences..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="premium-input w-full pl-12 h-14 rounded-2xl"
              />
            </div>
          </motion.div>

          {/* DETOUR ROULETTE WIDGET */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border-indigo-200 text-center flex flex-col justify-center items-center relative overflow-hidden"
          >
            <Sparkles className="absolute top-4 right-4 text-indigo-400 w-6 h-6 opacity-50" />
            <h2 className="text-2xl font-bold font-heading mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600">
              Detour Roulette
            </h2>
            <p className="text-sm text-slate-600 mb-6">Have free time? Let us pick a spontaneous activity under $100.</p>
            
            <button 
              onClick={handleDetourRoulette}
              disabled={spinning}
              className={`premium-button px-8 py-3 rounded-full flex items-center gap-2 ${spinning ? 'animate-pulse opacity-80' : ''}`}
            >
              <Compass className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
              {spinning ? 'Spinning...' : 'Spin the Roulette'}
            </button>
            
            {rouletteResult && !spinning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-white/60 backdrop-blur-md rounded-2xl w-full text-left shadow-inner border border-white/40"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 block">Your Detour:</span>
                <h4 className="font-bold text-lg leading-tight">{rouletteResult.name}</h4>
                <p className="text-sm text-slate-500 mt-1">${rouletteResult.cost} • {rouletteResult.duration} mins</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading experiences...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((act: any, i: number) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${act.imageUrl})` }}
                  />
                  <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-slate-800">
                    {act.category}
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold font-heading text-lg mb-1 line-clamp-1">{act.name}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {act.rating} ({act.reviewsCount})</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {act.duration}m</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-lg">${act.cost}</span>
                    <button className="text-sm bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">
                      Add +
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
