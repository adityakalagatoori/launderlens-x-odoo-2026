'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Globe, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid travel email'),
});

const phoneSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
});

export const LoginCard = () => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(method === 'email' ? emailSchema : phoneSchema)
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    // Simulate API call
    console.log('Sending auth request:', data);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card w-full max-w-md p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#63D5DF] to-[#F3E2D2]" />
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-outfit font-bold text-[#1A1A1A] mb-2">Welcome Back</h1>
        <p className="text-gray-600">Your next adventure is just a click away.</p>
      </div>

      <div className="flex gap-4 mb-8 bg-black/5 p-1 rounded-xl">
        <button 
          onClick={() => setMethod('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${method === 'email' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
        >
          <Mail size={18} /> Email
        </button>
        <button 
          onClick={() => setMethod('phone')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${method === 'phone' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
        >
          <Phone size={18} /> Phone
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={method}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {method === 'email' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="name@traveloop.com"
                  className="input-field w-full"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message as string}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                <input 
                  {...register('phone')}
                  type="tel" 
                  placeholder="+1 (555) 000-0000"
                  className="input-field w-full"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone.message as string}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? 'Sending...' : (
            <>
              {method === 'email' ? 'Send Magic Link' : 'Send OTP Code'}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-3 bg-white/50 border border-white/40 rounded-xl hover:bg-white/80 transition-all">
            <Globe size={20} className="text-blue-600" />
          </button>
          <button className="flex items-center justify-center p-3 bg-white/50 border border-white/40 rounded-xl hover:bg-white/80 transition-all">
            <span className="font-bold">G</span>
          </button>
          <button className="flex items-center justify-center p-3 bg-white/50 border border-white/40 rounded-xl hover:bg-white/80 transition-all">
            <span className="font-bold">f</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
