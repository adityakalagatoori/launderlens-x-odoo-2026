"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Compass, LayoutGrid, LogOut, Plane, Search, ChevronRight, Plus, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  if (pathname === '/login' || pathname === '/register' || pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/guide')) return null;

  return (
    <div className="fixed top-6 left-6 right-6 lg:left-36 z-[100] flex items-center justify-between gap-6 pointer-events-none">
      {/* Search Bar Area */}
      <div className="flex-1 max-w-md pointer-events-auto hidden sm:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search trips, cities, or guides..." 
            className="w-full bg-white/70 backdrop-blur-xl border border-white/40 py-3 pl-14 pr-6 rounded-full shadow-lg focus:bg-white focus:shadow-xl transition-all outline-none text-sm font-medium text-slate-600"
          />
        </div>
      </div>

      {/* Action Area (Right) */}
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* New Trip Button */}
        <Link href="/trips/new" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#63D5DF] text-white rounded-full text-xs font-bold shadow-lg hover:shadow-[#63D5DF]/30 hover:-translate-y-0.5 transition-all">
          <Plus size={16} />
          <span>New Trip</span>
        </Link>

        {/* User Profile / Email Pill */}
        <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/40 shadow-sm">
           <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User size={14} />
           </div>
           <span className="text-[10px] font-bold text-slate-500 truncate max-w-[150px]">{user?.email}</span>
        </div>

        {/* Traveloop Home Pill */}
        <Link href="/" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#63D5DF] to-[#52C4CE] rounded-full text-white shadow-lg hover:scale-105 transition-all group">
          <Plane size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="font-outfit font-bold text-sm">Traveloop</span>
        </Link>
      </div>
    </div>
  );
}
