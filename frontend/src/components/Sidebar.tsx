"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, LayoutGrid, Map, Compass, MessageSquare, Heart, Package, LogOut, User, Plane } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const SIDEBAR_ITEMS = [
  { icon: Home, href: '/', label: 'Home' },
  { icon: LayoutGrid, href: '/dashboard', label: 'Dashboard' },
  { icon: Map, href: '/dashboard#trips', label: 'My Trips' },
  { icon: Compass, href: '/cities', label: 'Explore' },
  { icon: MessageSquare, href: '/community', label: 'Community' },
  { icon: Heart, href: '/dashboard#wishlist', label: 'Wishlist' },
  { icon: Package, href: '/dashboard#packing', label: 'Packing' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin') || pathname.startsWith('/guide')) return null;

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-20 z-[110] hidden lg:flex flex-col items-center py-8 glass-panel rounded-[2.5rem] border border-white/40 shadow-xl bg-white/30 backdrop-blur-2xl">
      {/* Brand Icon / User Initial */}
      <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#63D5DF] font-bold text-xl mb-12 border border-slate-50">
        {user?.name?.charAt(0).toUpperCase() || 'T'}
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-6">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[#63D5DF] text-white shadow-lg scale-110' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}>
                <Icon size={20} />
              </div>
              <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all ml-2 whitespace-nowrap shadow-xl">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Items */}
      <div className="mt-auto flex flex-col gap-6">
        <button onClick={() => { logout(); router.push('/'); }} className="w-12 h-12 rounded-2xl text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
