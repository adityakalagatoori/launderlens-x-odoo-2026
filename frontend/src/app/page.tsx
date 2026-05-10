"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Map, Search, Plus, Calendar, Plane, ArrowRight, LogOut, Package, ShieldCheck, Trash2, Heart, MessageCircle, LayoutDashboard } from 'lucide-react';
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
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const loadTrips = () => {
    tripsAPI.getTrips().then(r => setTrips(r.data.data)).catch(() => {});
  };

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    loadTrips();
    citiesAPI.search().then(r => setCities(r.data.data)).catch(() => {});
  }, [mounted, isAuthenticated]);

  if (!mounted) return null;
  if (!isAuthenticated) return null;

  const deleteTrip = async (id: string) => {
    if (!confirm('Delete this trip and all its data?')) return;
    await tripsAPI.deleteTrip(id);
    loadTrips();
  };

  const totalBudget = trips.reduce((s: number, t: any) => s + (t.budget || 0), 0);
  const nextTrip = trips.find((t: any) => new Date(t.startDate) > new Date()) || trips[0];

  // Search filter for trips and cities
  const filteredTrips = trips.filter((t: any) => !searchQ || t.name.toLowerCase().includes(searchQ.toLowerCase()));
  const filteredCities = cities.filter((c: any) => !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.country.toLowerCase().includes(searchQ.toLowerCase()));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ) router.push(`/cities`);
  };

  return (
    <div className="min-h-screen flex text-[#1A1A1A] relative z-10 overflow-hidden pt-6 px-6 pb-6 gap-6">
      {/* Sidebar */}
      <aside className="w-24 glass-panel rounded-[2.5rem] flex flex-col items-center py-8 gap-10 shrink-0">
        <Link href="/" className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center shadow-sm border border-white/50">
          <span className="text-[#1A1A1A] font-bold text-2xl font-outfit">T</span>
        </Link>
        <nav className="flex-1 flex flex-col gap-4 w-full px-4">
          {[
            { icon: <Home size={22} />, href: '/', active: true, label: 'Home' },
            { icon: <LayoutDashboard size={22} />, href: '/dashboard', active: false, label: 'Dashboard' },
            { icon: <Map size={22} />, href: '/cities', active: false, label: 'Cities' },
            { icon: <Compass size={22} />, href: '/activities', active: false, label: 'Explore' },
            { icon: <MessageCircle size={22} />, href: '/community', active: false, label: 'Community' },
            { icon: <Heart size={22} />, href: '/dashboard', active: false, label: 'Wishlist' },
            { icon: <Package size={22} />, href: '/trips/new', active: false, label: 'New Trip' },
          ].map((item, i) => (
            <Link key={i} href={item.href} title={item.label} className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all ${item.active ? 'bg-white shadow-md text-[#63D5DF]' : 'text-[#1A1A1A]/50 hover:bg-white/40'}`}>
              {item.icon}
            </Link>
          ))}
        </nav>
        <div className="w-full px-4 space-y-4">
          <Link href="/profile" title="Profile" className="w-full aspect-square rounded-2xl flex items-center justify-center text-[#1A1A1A]/50 hover:bg-white/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#63D5DF] to-[#F3E2D2] flex items-center justify-center text-white text-xs font-bold">{user?.name?.charAt(0) || 'T'}</div>
          </Link>
          <button onClick={() => { logout(); router.push('/login'); }} title="Logout" className="w-full aspect-square rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-50/50 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col gap-6">
        {/* Header */}
        <header className="glass-panel h-20 rounded-[2rem] px-8 flex items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 group-focus-within:text-[#63D5DF] transition-colors" />
            <input type="text" placeholder="Search your trips & destinations..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="w-full bg-white/40 border border-white/50 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:bg-white/60 focus:ring-2 focus:ring-white/20 transition-all font-medium placeholder:text-[#1A1A1A]/40 text-sm" />
          </form>
          <div className="flex items-center gap-6">
            <Link href="/trips/new" className="flex items-center gap-2 bg-gradient-to-r from-[#63D5DF] to-[#52C4CE] text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-sm">
              <Plus size={16} /> New Trip
            </Link>
            <div className="h-8 w-[1px] bg-white/50" />
            <Link href="/profile" className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold leading-tight">{user?.name || 'Traveler'}</p>
                <p className="text-xs text-[#1A1A1A]/60 font-medium">{user?.email || ''}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#63D5DF] to-[#F3E2D2] border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'T'}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
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
                <Link href="/trips/new" className="premium-button w-max flex items-center gap-2">Plan Your First Trip <ArrowRight size={18} /></Link>
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
                <h3 className="text-xl font-bold font-outfit">Your Trips ({filteredTrips.length})</h3>
                <Link href="/trips/new" className="text-sm font-bold text-[#63D5DF] hover:text-[#52C4CE]">+ New Trip</Link>
              </div>
              {filteredTrips.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#1A1A1A]/50 font-medium mb-4">No trips yet. Create your first one!</p>
                  <Link href="/trips/new" className="premium-button w-auto inline-flex px-6">Create Trip</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTrips.map((trip: any) => (
                    <div key={trip.id} className="bg-white/40 border border-white/50 p-4 rounded-2xl flex justify-between items-center hover:bg-white/60 transition-colors">
                      <Link href={`/trips/${trip.id}`} className="flex-1">
                        <h4 className="font-bold text-[#1A1A1A] hover:text-[#63D5DF] transition-colors">{trip.name}</h4>
                        <p className="text-xs font-medium text-[#1A1A1A]/60 mt-1">{trip.tripType} · ${trip.budget} · {new Date(trip.startDate).toLocaleDateString()}</p>
                      </Link>
                      <div className="flex items-center gap-2">
                        <button onClick={() => deleteTrip(trip.id)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50/50 transition-all" title="Delete trip"><Trash2 size={14} /></button>
                        <Link href={`/trips/${trip.id}`}><ArrowRight size={16} className="text-[#1A1A1A]/40" /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-outfit">Destinations</h3>
                <Link href="/cities" className="text-sm font-bold text-[#63D5DF] hover:text-[#52C4CE]">View All →</Link>
              </div>
              <div className="space-y-3">
                {filteredCities.slice(0, 5).map((city: any) => (
                  <Link key={city.id} href="/cities" className="bg-white/40 border border-white/50 p-4 rounded-2xl flex justify-between items-center hover:bg-white/60 transition-colors block">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${city.coverImage})` }} />
                      <div>
                        <h4 className="font-bold">{city.name}</h4>
                        <p className="text-xs text-[#1A1A1A]/60">{city.country} · ★ {city.rating}</p>
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
