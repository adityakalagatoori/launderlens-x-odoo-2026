"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Map, Wallet, Bell, Settings, Search, Plus, Calendar, MapPin, Plane, ArrowRight, LogOut, BookOpen, Package } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { tripsAPI, citiesAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    tripsAPI.getTrips().then(r => setTrips(r.data.data)).catch(() => {});
    citiesAPI.search().then(r => setCities(r.data.data?.slice(0, 3))).catch(() => {});
  }, [mounted, isAuthenticated]);

  if (!mounted) return null;
  if (!isAuthenticated) return null;

  const nextTrip = trips[0];
  const totalBudget = trips.reduce((s: number, t: any) => s + (t.budget || 0), 0);

  return (
    <div className="min-h-screen flex text-[#1A1A1A] relative z-10 overflow-hidden pt-6 px-6 pb-6 gap-6">
      {/* Sidebar */}
      <aside className="w-24 glass-panel rounded-[2.5rem] flex flex-col items-center py-8 gap-10 shrink-0">
        <Link href="/" className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center shadow-sm border border-white/50">
          <span className="text-[#1A1A1A] font-bold text-2xl font-outfit">T</span>
        </Link>
        <nav className="flex-1 flex flex-col gap-4 w-full px-4">
          {[
            { icon: <Home size={22} />, href: '/', active: true },
            { icon: <Map size={22} />, href: '/cities', active: false },
            { icon: <Compass size={22} />, href: '/activities', active: false },
            { icon: <Package size={22} />, href: '/trips/new', active: false },
          ].map((item, i) => (
            <Link key={i} href={item.href} className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all ${item.active ? 'bg-white shadow-md text-[#63D5DF]' : 'text-[#1A1A1A]/50 hover:bg-white/40'}`}>
              {item.icon}
            </Link>
          ))}
        </nav>
        <div className="w-full px-4 space-y-4">
          <Link href="/profile" className="w-full aspect-square rounded-2xl flex items-center justify-center text-[#1A1A1A]/50 hover:bg-white/40 transition-colors">
            <Settings size={22} />
          </Link>
          <button onClick={() => { logout(); router.push('/login'); }} className="w-full aspect-square rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-50/50 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col gap-6">
        {/* Header */}
        <header className="glass-panel h-20 rounded-[2rem] px-8 flex items-center justify-between">
          <div className="relative w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 group-focus-within:text-[#63D5DF] transition-colors" />
            <input type="text" placeholder="Search destinations, itineraries..." className="w-full bg-white/40 border border-white/50 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:bg-white/60 focus:ring-2 focus:ring-white/20 transition-all font-medium placeholder:text-[#1A1A1A]/40 text-sm" />
          </div>
          <div className="flex items-center gap-6">
            <Link href="/trips/new" className="flex items-center gap-2 bg-gradient-to-r from-[#63D5DF] to-[#52C4CE] text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-sm">
              <Plus size={16} /> New Trip
            </Link>
            <div className="h-8 w-[1px] bg-white/50" />
            <Link href="/profile" className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold leading-tight">{user?.name || 'Traveler'}</p>
                <p className="text-xs text-[#1A1A1A]/60 font-medium">{user?.email || 'Premium Member'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#63D5DF] to-[#F3E2D2] border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'T'}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">
          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-2 glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#63D5DF]/30 to-transparent rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl" />
              <h2 className="text-3xl font-outfit font-bold mb-2 tracking-tight">Welcome back, {user?.name || 'Traveler'}!</h2>
              <p className="text-[#1A1A1A]/70 font-medium mb-8">
                {nextTrip ? `Your trip "${nextTrip.name}" is coming up!` : 'Ready to plan your next adventure?'}
              </p>
              {nextTrip ? (
                <Link href={`/trips/${nextTrip.id}`} className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow block">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white shadow-lg"><Plane size={24} /></div>
                    <div>
                      <h3 className="font-bold text-lg">{nextTrip.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/70 font-medium">
                        <Calendar size={14} /> {new Date(nextTrip.startDate).toLocaleDateString()} - {new Date(nextTrip.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-[#63D5DF]" />
                </Link>
              ) : (
                <Link href="/trips/new" className="premium-button w-max">Plan Your First Trip <ArrowRight size={18} /></Link>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold font-outfit mb-1">Travel Wallet</h3>
                <p className="text-[#1A1A1A]/60 text-sm font-medium">Total across all trips</p>
              </div>
              <div>
                <h2 className="text-4xl font-bold font-outfit tracking-tight mb-2">${totalBudget.toLocaleString()}</h2>
                <p className="text-sm text-[#1A1A1A]/60 font-medium">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
              </div>
            </motion.div>
          </div>

          {/* Trips & Destinations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-8 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-outfit">Your Trips</h3>
                <Link href="/trips/new" className="text-sm font-bold text-[#63D5DF] hover:text-[#52C4CE]">+ New Trip</Link>
              </div>
              {trips.length === 0 ? (
                <p className="text-[#1A1A1A]/50 text-center py-8 font-medium">No trips yet. Create your first one!</p>
              ) : (
                <div className="space-y-4">
                  {trips.slice(0, 4).map((trip: any) => (
                    <Link key={trip.id} href={`/trips/${trip.id}`} className="bg-white/40 border border-white/50 p-4 rounded-2xl flex justify-between items-center hover:bg-white/60 transition-colors block">
                      <div>
                        <h4 className="font-bold text-[#1A1A1A]">{trip.name}</h4>
                        <p className="text-xs font-medium text-[#1A1A1A]/60 mt-1">{trip.tripType} • ${trip.budget}</p>
                      </div>
                      <ArrowRight size={16} className="text-[#1A1A1A]/40" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-outfit">Featured Destinations</h3>
                <Link href="/cities" className="text-sm font-bold text-[#63D5DF] hover:text-[#52C4CE]">View All</Link>
              </div>
              <div className="space-y-4">
                {cities.map((city: any) => (
                  <Link key={city.id} href={`/cities`} className="bg-white/40 border border-white/50 p-4 rounded-2xl flex justify-between items-center hover:bg-white/60 transition-colors block">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${city.coverImage})` }} />
                      <div>
                        <h4 className="font-bold">{city.name}</h4>
                        <p className="text-xs text-[#1A1A1A]/60">{city.country} • ★ {city.rating}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#63D5DF]">{city._count?.activities || 0} activities</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
