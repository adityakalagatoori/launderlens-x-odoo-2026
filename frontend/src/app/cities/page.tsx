"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, DollarSign, Cloud, CheckCircle, ShieldCheck } from 'lucide-react';
import { citiesAPI } from '@/lib/api';

export default function CitiesDiscovery() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await citiesAPI.search();
        setCities(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  const filteredCities = cities.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-travel-gradient p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold font-heading mb-2">City Discovery</h1>
            <p className="text-slate-600">Find your next luxurious destination.</p>
          </div>
          
          <div className="relative mt-4 md:mt-0 w-full md:w-96">
            <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="premium-input w-full pl-12 h-14 rounded-2xl"
            />
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading destinations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city: any, i: number) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div 
                  className="h-48 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${city.coverImage})` }}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold font-heading">{city.name}</h3>
                      <p className="text-slate-500 flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4" /> {city.country}
                      </p>
                    </div>
                    <div className="bg-white/50 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 backdrop-blur-md border border-white/40">
                      ★ {city.rating}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                    {city.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Cost: Level {city.costLevel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Cloud className="w-4 h-4 text-blue-500" />
                      <span>{city.climate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-orange-500" />
                      <span>Visa: {city.visaRequired ? 'Required' : 'Free'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>Safety: {city.safetyScore}/100</span>
                    </div>
                  </div>

                  <button className="premium-button w-full">
                    Explore Destination
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
