'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck,
  CheckCircle2, Globe2, Compass, MapPin, Search, PlusCircle,
  Bell, Map, Calendar as CalendarIcon, Share2, Users
} from 'lucide-react';

const steps = [
  { id: 1, name: 'Account' },
  { id: 2, name: 'Verification' },
  { id: 3, name: 'Travel Profile' },
  { id: 4, name: 'Setup' }
];

export const RegisterWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '',
    otp: ['', '', '', '', '', ''],
    travelStyle: '',
    currency: 'USD',
    cities: [] as string[],
    buddyMatching: false,
    permissions: { calendar: false, location: false, notifications: false }
  });

  const nextStep = () => currentStep < 4 && setCurrentStep(curr => curr + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(curr => curr - 1);

  return (
    <div className="glass-card w-full max-w-xl p-8 relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] backdrop-blur-2xl">
      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200/50 rounded-full -z-10" />
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#63D5DF] to-[#AEE7EC] rounded-full -z-10"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
              currentStep >= step.id 
                ? 'bg-[#63D5DF] text-white shadow-md' 
                : 'bg-white/60 text-gray-400'
            }`}>
              {step.id}
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentStep === 1 && <Step1 formData={formData} setFormData={setFormData} />}
            {currentStep === 2 && <Step2 formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <Step3 formData={formData} setFormData={setFormData} />}
            {currentStep === 4 && <Step4 formData={formData} setFormData={setFormData} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-white/30">
        <button
          onClick={prevStep}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${
            currentStep === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/50 text-gray-700'
          }`}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={currentStep === 4 ? () => console.log('Submit', formData) : nextStep}
          className="bg-gradient-to-r from-[#63D5DF] to-[#52C4CE] hover:shadow-lg hover:shadow-[#63D5DF]/30 text-white px-8 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all active:scale-95"
        >
          {currentStep === 4 ? 'Complete Setup' : 'Continue'}
          {currentStep < 4 && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
};

// --- Steps ---

const Step1 = ({ formData, setFormData }: any) => {
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 7) score += 25;
    if (pass.match(/[A-Z]/)) score += 25;
    if (pass.match(/[0-9]/)) score += 25;
    if (pass.match(/[^A-Za-z0-9]/)) score += 25;
    return score;
  };
  const strength = getPasswordStrength(formData.password);
  
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-outfit text-gray-900">Create Account</h2>
        <p className="text-gray-500 text-sm">Join the luxury travel community</p>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Full Name"
            value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
            className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/60 focus:border-[#63D5DF] focus:ring-2 focus:ring-[#63D5DF]/20 rounded-2xl outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="email" placeholder="Email Address"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/60 focus:border-[#63D5DF] focus:ring-2 focus:ring-[#63D5DF]/20 rounded-2xl outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <div>
          <div className="relative mb-2">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" placeholder="Password"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/60 focus:border-[#63D5DF] focus:ring-2 focus:ring-[#63D5DF]/20 rounded-2xl outline-none transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-1.5 rounded-full bg-white/60 overflow-hidden flex">
              <div className={`h-full transition-all duration-300 ${strength >= 25 ? 'bg-red-400 w-1/4' : 'w-0'}`} />
              <div className={`h-full transition-all duration-300 ${strength >= 50 ? 'bg-orange-400 w-1/4' : 'w-0'}`} />
              <div className={`h-full transition-all duration-300 ${strength >= 75 ? 'bg-yellow-400 w-1/4' : 'w-0'}`} />
              <div className={`h-full transition-all duration-300 ${strength === 100 ? 'bg-green-400 w-1/4' : 'w-0'}`} />
            </div>
            <span className="text-xs font-medium text-gray-500 w-12 text-right">
              {strength < 25 ? 'Weak' : strength < 75 ? 'Fair' : 'Strong'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step2 = ({ formData, setFormData }: any) => {
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/60 shadow-sm">
          <ShieldCheck className="text-[#63D5DF]" size={32} />
        </div>
        <h2 className="text-2xl font-bold font-outfit text-gray-900">Verify Email</h2>
        <p className="text-gray-500 text-sm mt-1">We sent a 6-digit code to your email.</p>
      </div>
      
      <div className="flex justify-center gap-3">
        {formData.otp.map((digit: string, idx: number) => (
          <input
            key={idx}
            id={`otp-${idx}`}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            className="w-12 h-14 text-center text-xl font-bold bg-white/60 border border-white/60 focus:border-[#63D5DF] focus:ring-2 focus:ring-[#63D5DF]/20 rounded-xl outline-none transition-all shadow-sm"
          />
        ))}
      </div>
      
      <div className="text-center mt-6">
        <button className="text-sm font-medium text-[#63D5DF] hover:text-[#52C4CE] transition-colors">
          Resend Code
        </button>
      </div>
    </div>
  );
};

const Step3 = ({ formData, setFormData }: any) => {
  const styles = [
    { id: 'luxury', label: 'Luxury', icon: <Globe2 size={24} /> },
    { id: 'backpacker', label: 'Backpacker', icon: <Map size={24} /> },
    { id: 'business', label: 'Business', icon: <User size={24} /> },
    { id: 'adventure', label: 'Adventure', icon: <Compass size={24} /> },
    { id: 'cultural', label: 'Cultural', icon: <MapPin size={24} /> }
  ];

  const cities = ['Paris', 'Tokyo', 'Bali', 'Dubai', 'New York', 'Rome'];

  const toggleCity = (city: string) => {
    const current = formData.cities;
    if (current.includes(city)) {
      setFormData({ ...formData, cities: current.filter((c: string) => c !== city) });
    } else {
      setFormData({ ...formData, cities: [...current, city] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold font-outfit text-gray-900">Travel Profile</h2>
          <p className="text-gray-500 text-sm">Personalize your experience</p>
        </div>
        <div className="bg-white/60 px-3 py-1.5 rounded-lg border border-white/60 text-xs font-semibold text-gray-700 flex items-center gap-1">
          Auto: USD <CheckCircle2 size={12} className="text-green-500" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Travel Style</label>
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setFormData({ ...formData, travelStyle: style.id })}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all ${
                formData.travelStyle === style.id
                  ? 'bg-white/80 border-[#63D5DF] shadow-md text-[#63D5DF]'
                  : 'bg-white/40 border-white/60 text-gray-500 hover:bg-white/60'
              }`}
            >
              <div className="mb-2">{style.icon}</div>
              <span className="text-xs font-medium">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Suggested Destinations</label>
        <div className="grid grid-cols-3 gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => toggleCity(city)}
              className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                formData.cities.includes(city)
                  ? 'bg-[#63D5DF]/20 border-[#63D5DF] text-[#63D5DF]'
                  : 'bg-white/40 border-white/60 text-gray-600 hover:bg-white/60'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Step4 = ({ formData, setFormData }: any) => {
  const togglePerm = (key: 'calendar' | 'location' | 'notifications') => {
    setFormData({
      ...formData,
      permissions: { ...formData.permissions, [key]: !formData.permissions[key] }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-outfit text-gray-900 mb-1">Final Setup</h2>
        <p className="text-gray-500 text-sm">Enhance your Traveloop journey</p>
      </div>

      {/* Buddy Matching & Referral */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/50 border border-white/60 p-4 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Users size={20} />
            </div>
            <Toggle 
              checked={formData.buddyMatching} 
              onChange={() => setFormData({...formData, buddyMatching: !formData.buddyMatching})} 
            />
          </div>
          <h4 className="font-semibold text-sm">Buddy Match</h4>
          <p className="text-xs text-gray-500 mt-1">Find travel partners</p>
        </div>

        <div className="bg-white/50 border border-white/60 p-4 rounded-2xl flex flex-col justify-between">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600 w-max mb-2">
            <Share2 size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Referral Code</h4>
            <div className="mt-1 flex items-center justify-between bg-white/60 rounded-lg px-2 py-1 border border-white/50">
              <span className="text-xs font-mono font-bold text-gray-700 tracking-wider">TRV-2026</span>
              <button className="text-[#63D5DF] hover:text-[#52C4CE]"><PlusCircle size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white/40 border border-white/60 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/40 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Location Services</span>
          </div>
          <Toggle checked={formData.permissions.location} onChange={() => togglePerm('location')} />
        </div>
        <div className="px-4 py-3 border-b border-white/40 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarIcon size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Calendar Sync</span>
          </div>
          <Toggle checked={formData.permissions.calendar} onChange={() => togglePerm('calendar')} />
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Push Notifications</span>
          </div>
          <Toggle checked={formData.permissions.notifications} onChange={() => togglePerm('notifications')} />
        </div>
      </div>
    </div>
  );
};

// Reusable Toggle Component
const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
      checked ? 'bg-[#63D5DF]' : 'bg-gray-300/50'
    }`}
  >
    <motion.div
      className="w-4 h-4 bg-white rounded-full shadow-sm"
      animate={{ x: checked ? 16 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
);
