'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const phoneSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

export const LoginCard = () => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(method === 'email' ? emailSchema : phoneSchema)
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    // Simulate premium API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="glass-panel w-full p-8 sm:p-10 rounded-[2rem] relative">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-[#1A1A1A] tracking-tight">Welcome Back</h1>
        <p className="text-[#1A1A1A]/60 mt-2 font-medium">Sign in to continue your journey.</p>
      </div>

      <div className="flex p-1.5 mb-8 bg-white/30 backdrop-blur-md rounded-2xl border border-white/50 shadow-inner">
        <button 
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            method === 'email' ? 'bg-white text-[#1A1A1A] shadow-sm scale-[1.02]' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
          }`}
        >
          <Mail size={16} /> Email
        </button>
        <button 
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            method === 'phone' ? 'bg-white text-[#1A1A1A] shadow-sm scale-[1.02]' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
          }`}
        >
          <Phone size={16} /> Phone
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={method}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {method === 'email' ? (
              <div className="space-y-2 relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors z-10">
                  <Mail size={20} />
                </div>
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="name@traveloop.com"
                  className={`premium-input pl-12 ${errors.email ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                />
                {errors.email && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 text-xs mt-1.5 ml-2 font-medium">
                    {errors.email.message as string}
                  </motion.p>
                )}
              </div>
            ) : (
              <div className="space-y-2 relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors z-10">
                  <Phone size={20} />
                </div>
                <input 
                  {...register('phone')}
                  type="tel" 
                  placeholder="+1 (555) 000-0000"
                  className={`premium-input pl-12 ${errors.phone ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                />
                {errors.phone && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 text-xs mt-1.5 ml-2 font-medium">
                    {errors.phone.message as string}
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button 
          type="submit" 
          disabled={loading || success}
          className="premium-button group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : success ? (
              <><CheckCircle2 size={20} /> Sent!</>
            ) : (
              <>
                {method === 'email' ? 'Send Magic Link' : 'Send OTP Code'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>
      </form>

      <div className="mt-8">
        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-[#1A1A1A]/10"></div>
          <span className="flex-shrink mx-4 text-[#1A1A1A]/50 text-xs font-semibold uppercase tracking-wider">or continue with</span>
          <div className="flex-grow border-t border-[#1A1A1A]/10"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="social-button">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button type="button" className="social-button">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Facebook
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-[#1A1A1A]/70 font-medium">
          New to Traveloop? <a href="/register" className="text-[#63D5DF] hover:text-[#52C4CE] font-bold transition-colors">Create Account</a>
        </p>
      </div>
    </div>
  );
};
