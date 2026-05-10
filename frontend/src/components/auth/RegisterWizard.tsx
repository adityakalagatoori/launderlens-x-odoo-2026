'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck,
  CheckCircle2, Globe2, Compass, MapPin, PlusCircle,
  Bell, Map, Calendar as CalendarIcon, Share2, Users, Loader2
} from 'lucide-react';

const steps = [
  { id: 1, name: 'Account' },
  { id: 2, name: 'Verification' },
  { id: 3, name: 'Travel Profile' },
  { id: 4, name: 'Setup' }
];

export const RegisterWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

  const completeSetup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/';
    }, 2000);
  };

  return (
    <div className="glass-panel w-full p-8 sm:p-10 relative rounded-[2.5rem]">
      {/* Progress Bar Header */}
      <div className="flex justify-between items-center mb-10 relative px-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-white/20 rounded-full -z-10" />
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#63D5DF] to-[#52C4CE] rounded-full -z-10 shadow-[0_0_10px_rgba(99,213,223,0.5)]"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <motion.div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2 ${
                currentStep >= step.id 
                  ? 'bg-white border-white text-[#63D5DF] shadow-[0_4px_12px_rgba(0,0,0,0.1)]' 
                  : 'bg-transparent border-white/40 text-white/80'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {currentStep > step.id ? <CheckCircle2 size={20} /> : step.id}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Step Content Area */}
      <div className="min-h-[380px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20, filter: 'blur(5px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
            transition={{ duration: 0.4, ease: "circOut" }}
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
      <div className="flex justify-between items-center mt-10 pt-8 border-t border-white/20">
        <button
          onClick={prevStep}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 text-gray-700 hover:bg-white/30 ${
            currentStep === 1 ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={currentStep === 4 ? completeSetup : nextStep}
          className="premium-button w-auto px-8 py-3.5"
          disabled={loading}
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? <Loader2 size={20} className="animate-spin" /> : currentStep === 4 ? 'Complete Setup' : 'Continue'}
            {!loading && currentStep < 4 && <ArrowRight size={18} />}
          </span>
        </button>
      </div>
    </div>
  );
};

/* --- Step 1: Account --- */
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
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-outfit text-gray-900 tracking-tight">Create Account</h2>
        <p className="text-gray-600 font-medium mt-1">Join the luxury travel community.</p>
      </div>
      
      <div className="space-y-5">
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors">
            <User size={20} />
          </div>
          <input 
            type="text" placeholder="Full Legal Name"
            value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
            className="premium-input pl-12"
          />
        </div>
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors">
            <Mail size={20} />
          </div>
          <input 
            type="email" placeholder="Email Address"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            className="premium-input pl-12"
          />
        </div>
        <div className="group">
          <div className="relative mb-3">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#63D5DF] transition-colors">
              <Lock size={20} />
            </div>
            <input 
              type="password" placeholder="Secure Password"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className="premium-input pl-12"
            />
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 h-1.5 rounded-full bg-black/10 overflow-hidden flex shadow-inner">
              <div className={`h-full transition-all duration-500 ${strength >= 25 ? 'bg-red-400 w-1/4' : 'w-0'}`} />
              <div className={`h-full transition-all duration-500 ${strength >= 50 ? 'bg-orange-400 w-1/4' : 'w-0'}`} />
              <div className={`h-full transition-all duration-500 ${strength >= 75 ? 'bg-yellow-400 w-1/4' : 'w-0'}`} />
              <div className={`h-full transition-all duration-500 ${strength === 100 ? 'bg-green-400 w-1/4' : 'w-0'}`} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 w-16 text-right">
              {strength < 25 ? 'Weak' : strength < 75 ? 'Fair' : 'Strong'}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-[#1A1A1A]/70 font-medium">
          Already have an account? <a href="/" className="text-[#63D5DF] hover:text-[#52C4CE] font-bold transition-colors">Sign in</a>
        </p>
      </div>
    </div>
  );
};

/* --- Step 2: Verification --- */
const Step2 = ({ formData, setFormData }: any) => {
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="space-y-8 max-w-md mx-auto text-center">
      <div className="mb-6">
        <div className="w-20 h-20 bg-white/40 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/50">
          <ShieldCheck className="text-[#63D5DF]" size={40} />
        </div>
        <h2 className="text-3xl font-bold font-outfit text-gray-900 tracking-tight">Verify Identity</h2>
        <p className="text-gray-600 font-medium mt-2">Enter the 6-digit code sent to your email.</p>
      </div>
      
      <div className="flex justify-center gap-3 sm:gap-4">
        {formData.otp.map((digit: string, idx: number) => (
          <input
            key={idx}
            id={`otp-${idx}`}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            className="w-12 h-16 sm:w-14 sm:h-16 text-center text-2xl font-outfit font-bold bg-white/50 border border-white/60 focus:bg-white focus:border-[#63D5DF] focus:ring-4 focus:ring-[#63D5DF]/20 rounded-2xl outline-none transition-all shadow-sm text-gray-800"
          />
        ))}
      </div>
      
      <div className="text-center mt-8">
        <button className="text-sm font-bold text-[#63D5DF] hover:text-[#52C4CE] transition-colors underline-offset-4 hover:underline">
          Resend Code
        </button>
      </div>
    </div>
  );
};

/* --- Step 3: Travel Profile --- */
const Step3 = ({ formData, setFormData }: any) => {
  const styles = [
    { id: 'luxury', label: 'Luxury', icon: <Globe2 size={28} /> },
    { id: 'backpacker', label: 'Backpacker', icon: <Map size={28} /> },
    { id: 'business', label: 'Business', icon: <User size={28} /> },
    { id: 'adventure', label: 'Adventure', icon: <Compass size={28} /> },
    { id: 'cultural', label: 'Cultural', icon: <MapPin size={28} /> }
  ];

  const cities = ['Paris', 'Tokyo', 'Bali', 'Dubai', 'New York', 'Rome', 'London', 'Kyoto'];

  const toggleCity = (city: string) => {
    const current = formData.cities;
    if (current.includes(city)) {
      setFormData({ ...formData, cities: current.filter((c: string) => c !== city) });
    } else {
      setFormData({ ...formData, cities: [...current, city] });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold font-outfit text-gray-900 tracking-tight">Travel Profile</h2>
          <p className="text-gray-600 font-medium">Personalize your luxury experience.</p>
        </div>
        <div className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 shadow-sm text-sm font-bold text-gray-800 flex items-center gap-2">
          Auto: USD <CheckCircle2 size={16} className="text-emerald-500" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-800 uppercase tracking-wider block">Travel Style</label>
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2 custom-scrollbar">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setFormData({ ...formData, travelStyle: style.id })}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-[1.5rem] border-2 transition-all duration-300 ${
                formData.travelStyle === style.id
                  ? 'bg-white border-[#63D5DF] shadow-[0_8px_20px_rgba(99,213,223,0.3)] text-[#63D5DF] -translate-y-2'
                  : 'bg-white/40 border-white/60 text-gray-600 hover:bg-white/70 hover:border-white hover:-translate-y-1'
              }`}
            >
              <div className="mb-3">{style.icon}</div>
              <span className="text-xs font-bold tracking-wide">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-800 uppercase tracking-wider block">Smart Destinations</label>
        <div className="grid grid-cols-4 gap-3">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => toggleCity(city)}
              className={`py-3 px-4 rounded-2xl border-2 text-sm font-bold transition-all duration-300 ${
                formData.cities.includes(city)
                  ? 'bg-[#63D5DF]/10 border-[#63D5DF] text-[#63D5DF] shadow-inner'
                  : 'bg-white/40 border-white/60 text-gray-700 hover:bg-white/80 hover:border-white'
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

/* --- Step 4: Setup --- */
const Step4 = ({ formData, setFormData }: any) => {
  const togglePerm = (key: 'calendar' | 'location' | 'notifications') => {
    setFormData({
      ...formData,
      permissions: { ...formData.permissions, [key]: !formData.permissions[key] }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-outfit text-gray-900 tracking-tight">Final Setup</h2>
        <p className="text-gray-600 font-medium">Enhance your Traveloop journey.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100/80 rounded-2xl text-blue-600">
              <Users size={24} />
            </div>
            <Toggle 
              checked={formData.buddyMatching} 
              onChange={() => setFormData({...formData, buddyMatching: !formData.buddyMatching})} 
            />
          </div>
          <h4 className="font-bold text-gray-900 text-lg">Buddy Match</h4>
          <p className="text-sm text-gray-600 font-medium mt-1">Connect with global partners.</p>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="p-3 bg-purple-100/80 rounded-2xl text-purple-600 w-max mb-4">
            <Share2 size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg">Referral Code</h4>
            <div className="mt-2 flex items-center justify-between bg-white/80 rounded-xl px-3 py-2 border border-white">
              <span className="text-sm font-mono font-bold text-gray-800 tracking-widest">TRV-2026</span>
              <button className="text-[#63D5DF] hover:text-[#52C4CE] transition-colors"><PlusCircle size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-md border border-white/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-white/40 flex justify-between items-center bg-white/20 hover:bg-white/40 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/60 rounded-xl text-gray-700 shadow-sm"><MapPin size={20} /></div>
            <span className="text-base font-bold text-gray-800">Location Services</span>
          </div>
          <Toggle checked={formData.permissions.location} onChange={() => togglePerm('location')} />
        </div>
        <div className="px-5 py-4 border-b border-white/40 flex justify-between items-center bg-white/20 hover:bg-white/40 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/60 rounded-xl text-gray-700 shadow-sm"><CalendarIcon size={20} /></div>
            <span className="text-base font-bold text-gray-800">Calendar Sync</span>
          </div>
          <Toggle checked={formData.permissions.calendar} onChange={() => togglePerm('calendar')} />
        </div>
        <div className="px-5 py-4 flex justify-between items-center bg-white/20 hover:bg-white/40 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/60 rounded-xl text-gray-700 shadow-sm"><Bell size={20} /></div>
            <span className="text-base font-bold text-gray-800">Push Notifications</span>
          </div>
          <Toggle checked={formData.permissions.notifications} onChange={() => togglePerm('notifications')} />
        </div>
      </div>
    </div>
  );
};

// Reusable Premium Toggle Component
const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner ${
      checked ? 'bg-gradient-to-r from-[#63D5DF] to-[#52C4CE]' : 'bg-gray-400/30'
    }`}
  >
    <motion.div
      className="w-5 h-5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
      animate={{ x: checked ? 20 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
);
