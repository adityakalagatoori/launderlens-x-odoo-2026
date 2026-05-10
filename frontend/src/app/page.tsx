'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Compass, Map, Wallet, Bell, Settings, 
  Search, Plus, Calendar, MapPin, Plane, ArrowRight 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex text-[#1A1A1A] relative z-10 overflow-hidden pt-6 px-6 pb-6 gap-6">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6 relative">
        <Header user={user} />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">
          {/* Welcome & Next Trip Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#63D5DF]/30 to-transparent rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl" />
              
              <h2 className="text-3xl font-outfit font-bold mb-2 tracking-tight">
                Welcome back, {user?.fullName || 'Traveler'}!
              </h2>
              <p className="text-[#1A1A1A]/70 font-medium mb-8">
                Your journey to Santorini starts in 14 days. Are you ready?
              </p>

              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm flex items-center justify-between group-hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Plane size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Santorini, Greece</h3>
                    <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/70 font-medium">
                      <Calendar size={14} /> Aug 12 - Aug 20
                      <span className="mx-1">•</span>
                      <MapPin size={14} /> 2 Stops
                    </div>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#63D5DF] hover:bg-[#63D5DF] hover:text-white transition-colors">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#AEE7EC]/40 to-transparent rounded-full blur-xl" />
              <div>
                <h3 className="text-xl font-bold font-outfit mb-1">Travel Wallet</h3>
                <p className="text-[#1A1A1A]/60 text-sm font-medium">Available Budget</p>
              </div>
              <div>
                <h2 className="text-4xl font-bold font-outfit tracking-tight mb-2">$4,250.00</h2>
                <div className="w-full bg-white/40 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-[#63D5DF] to-[#52C4CE] h-2 rounded-full w-[65%]" />
                </div>
                <p className="text-xs text-[#1A1A1A]/60 font-medium text-right">65% of budget used</p>
              </div>
            </div>
          </div>

          {/* Smart Itinerary & Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-8 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-outfit">Smart Suggestions</h3>
                <button className="text-sm font-bold text-[#63D5DF] hover:text-[#52C4CE]">View All</button>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Kyoto Cultural Tour', type: 'Cultural', match: '98%' },
                  { title: 'Swiss Alps Retreat', type: 'Adventure', match: '92%' },
                  { title: 'Maldives Overwater', type: 'Luxury', match: '89%' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/40 border border-white/50 p-4 rounded-2xl flex justify-between items-center hover:bg-white/60 transition-colors cursor-pointer">
                    <div>
                      <h4 className="font-bold text-[#1A1A1A]">{item.title}</h4>
                      <p className="text-xs font-medium text-[#1A1A1A]/60 uppercase tracking-wider mt-1">{item.type}</p>
                    </div>
                    <div className="bg-[#63D5DF]/20 text-[#52C4CE] font-bold text-xs px-3 py-1.5 rounded-lg border border-[#63D5DF]/30">
                      {item.match} Match
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop")' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative h-full flex flex-col justify-end text-white">
                <span className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">Featured Destination</span>
                <h3 className="text-3xl font-outfit font-bold mb-2 tracking-tight">Paris, France</h3>
                <p className="text-white/80 text-sm font-medium mb-4">Experience the city of lights with our curated luxury itinerary.</p>
                <button className="bg-white text-black font-bold py-3 px-6 rounded-xl w-max hover:scale-105 transition-transform">
                  Explore Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const Sidebar = () => (
  <aside className="w-24 glass-panel rounded-[2.5rem] flex flex-col items-center py-8 gap-10">
    <div className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center shadow-sm border border-white/50 cursor-pointer">
      <span className="text-[#1A1A1A] font-bold text-2xl font-outfit">T</span>
    </div>

    <nav className="flex-1 flex flex-col gap-6 w-full px-4">
      {[
        { icon: <Home size={22} />, active: true },
        { icon: <Map size={22} />, active: false },
        { icon: <Compass size={22} />, active: false },
        { icon: <Wallet size={22} />, active: false },
      ].map((item, i) => (
        <button key={i} className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all ${
          item.active ? 'bg-white shadow-md text-[#63D5DF]' : 'text-[#1A1A1A]/50 hover:bg-white/40 hover:text-[#1A1A1A]'
        }`}>
          {item.icon}
        </button>
      ))}
    </nav>

    <div className="w-full px-4 mt-auto">
      <button className="w-full aspect-square rounded-2xl flex items-center justify-center text-[#1A1A1A]/50 hover:bg-white/40 hover:text-[#1A1A1A] transition-colors">
        <Settings size={22} />
      </button>
    </div>
  </aside>
);

const Header = ({ user }: any) => (
  <header className="glass-panel h-20 rounded-[2rem] px-8 flex items-center justify-between">
    <div className="relative w-96 group">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 group-focus-within:text-[#63D5DF] transition-colors" />
      <input 
        type="text" 
        placeholder="Search destinations, itineraries..." 
        className="w-full bg-white/40 border border-white/50 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:bg-white/60 focus:ring-2 focus:ring-white/20 transition-all font-medium placeholder:text-[#1A1A1A]/40 text-sm"
      />
    </div>

    <div className="flex items-center gap-6">
      <button className="relative text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors">
        <Bell size={20} />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      </button>
      
      <div className="h-8 w-[1px] bg-white/50" />

      <div className="flex items-center gap-3 cursor-pointer">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold leading-tight">{user?.fullName || 'Traveler'}</p>
          <p className="text-xs text-[#1A1A1A]/60 font-medium">Premium Member</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#63D5DF] to-[#F3E2D2] border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm">
          {user?.fullName?.charAt(0) || 'T'}
        </div>
      </div>
    </div>
  </header>
);
