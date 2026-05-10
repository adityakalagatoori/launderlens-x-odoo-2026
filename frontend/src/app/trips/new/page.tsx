"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Map, Calendar, Users, Target, CheckCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, UserPlus, Users2, Info, DollarSign, RefreshCw } from 'lucide-react';
import { tripsAPI, citiesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const STEPS = [
  { id: 1, name: 'Basics', icon: Map },
  { id: 2, name: 'Dates', icon: Calendar },
  { id: 3, name: 'Budget', icon: Target },
  { id: 4, name: 'Setup', icon: Users },
  { id: 5, name: 'Review', icon: CheckCircle },
];

export default function CreateTripWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', description: '', startDate: '', endDate: '',
    tripType: 'Leisure', budget: '', currency: 'USD', visibility: 'PRIVATE', 
    tags: [] as string[],
    tripMode: 'solo', // 'solo' or 'group'
    lookingForBuddy: false,
    flexibleDates: false,
    pace: 'Moderate',
    dietary: [] as string[]
  });

  const [inrValue, setInrValue] = useState(0);

  useEffect(() => {
    if (formData.currency === 'INR') setInrValue(parseFloat(formData.budget || '0'));
    else {
      // Mock conversion
      const rates: any = { USD: 83.5, EUR: 90.2, GBP: 105.1, JPY: 0.55 };
      setInrValue(Math.round(parseFloat(formData.budget || '0') * (rates[formData.currency] || 1)));
    }
  }, [formData.budget, formData.currency]);

  if (typeof window !== 'undefined' && !isAuthenticated) { router.push('/login'); return null; }

  const nextStep = () => setStep(s => Math.min(5, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleComplete = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await tripsAPI.createTrip({ ...formData, ownerId: user?.id });
      router.push(`/trips/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-travel-gradient flex flex-col items-center justify-center p-4 text-slate-800">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8 flex justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/30 -z-10 -translate-y-1/2" />
        <div className="absolute top-1/2 left-0 h-1 bg-[#63D5DF] -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }} />
        {STEPS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${s.id === step ? 'bg-[#63D5DF] text-white shadow-[0_10px_20px_rgba(99,213,223,0.3)] scale-110' : s.id < step ? 'bg-[#52C4CE] text-white' : 'bg-white/50 text-slate-400 backdrop-blur-md'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${s.id === step ? 'text-slate-800' : 'text-slate-500 opacity-50'}`}>{s.name}</span>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-8 md:p-12 rounded-[3rem] w-full max-w-2xl min-h-[500px] flex flex-col shadow-2xl border border-white/60">
        {error && <div className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3"><Info size={18} /> {error}</div>}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-grow">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold font-outfit tracking-tight">Name your adventure</h2>
                  <p className="text-slate-500">Every great story starts with a title.</p>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="e.g., Summer in Paris" className="premium-input text-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <textarea placeholder="What's the vibe? (optional description)" className="premium-input min-h-[120px] py-4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold font-outfit tracking-tight">When are we going?</h2>
                  <p className="text-slate-500">Select your travel window.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Start Date</label>
                    <input type="date" className="premium-input" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">End Date</label>
                    <input type="date" className="premium-input" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>
                <div className="pt-4">
                  <button onClick={() => setFormData({...formData, flexibleDates: !formData.flexibleDates})} className={`w-full p-4 rounded-[1.5rem] border-2 transition-all flex items-center justify-between ${formData.flexibleDates ? 'border-[#63D5DF] bg-[#63D5DF]/10 text-[#63D5DF]' : 'border-slate-100 bg-white/40 text-slate-600'}`}>
                    <div className="flex items-center gap-3">
                      <RefreshCw className={`w-5 h-5 ${formData.flexibleDates ? 'animate-spin-slow' : ''}`} />
                      <div className="text-left">
                        <div className="font-bold">Flexible Dates</div>
                        <div className="text-xs opacity-80">Shift dates ± 3 days for comfort</div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.flexibleDates ? 'border-[#63D5DF] bg-[#63D5DF]' : 'border-slate-300'}`}>
                      {formData.flexibleDates && <CheckCircle size={14} className="text-white" />}
                    </div>
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold font-outfit tracking-tight">Set your budget</h2>
                  <p className="text-slate-500">We&apos;ll help you stay within your limits.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Total Budget</label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input type="number" placeholder="5000" className="premium-input pl-12" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Currency</label>
                    <select className="premium-input" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                       <option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option><option>INR</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-[#63D5DF]/5 border border-[#63D5DF]/20 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#63D5DF] font-bold shadow-sm">₹</div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-tight">Estimated in Rupees</div>
                      <div className="text-xl font-bold text-slate-800">₹ {inrValue.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${inrValue > 200000 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {inrValue > 500000 ? 'LUXURY PLAN' : inrValue > 100000 ? 'MID-RANGE' : 'BUDGET FRIENDLY'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Trip Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Leisure','Adventure','Business','Family','Solo'].map(type => (
                      <button key={type} onClick={() => setFormData({...formData, tripType: type})} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${formData.tripType === type ? 'border-[#63D5DF] bg-[#63D5DF]/10 text-[#63D5DF]' : 'border-slate-50 bg-white/40 text-slate-500'}`}>{type}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold font-outfit tracking-tight">Travel Setup</h2>
                  <p className="text-slate-500">Solo mission or group adventure?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setFormData({...formData, tripMode: 'solo'})} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${formData.tripMode === 'solo' ? 'border-[#63D5DF] bg-[#63D5DF]/10 text-[#63D5DF]' : 'border-slate-50 bg-white/40 text-slate-500'}`}>
                    <UserPlus size={32} />
                    <div className="font-bold">Solo Trip</div>
                  </button>
                  <button onClick={() => setFormData({...formData, tripMode: 'group'})} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${formData.tripMode === 'group' ? 'border-[#63D5DF] bg-[#63D5DF]/10 text-[#63D5DF]' : 'border-slate-50 bg-white/40 text-slate-500'}`}>
                    <Users2 size={32} />
                    <div className="font-bold">Group Trip</div>
                  </button>
                </div>

                {formData.tripMode === 'solo' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <Sparkles className="text-emerald-500" />
                       <div className="text-left">
                         <div className="font-bold text-emerald-800">Find Travel Buddy?</div>
                         <div className="text-xs text-emerald-600">Match with travelers on the same timeline & destination</div>
                       </div>
                    </div>
                    <button onClick={() => setFormData({...formData, lookingForBuddy: !formData.lookingForBuddy})} className={`w-14 h-8 rounded-full relative transition-all ${formData.lookingForBuddy ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                       <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.lookingForBuddy ? 'left-7' : 'left-1'}`} />
                    </button>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2"><Sparkles className="text-amber-500" size={18} /> Interests & Pace</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Culture','Food','Nature','Adventure','Relaxation','History','Art'].map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${formData.tags.includes(tag) ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-white/60 text-slate-500 hover:bg-white'}`}>{tag}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {['Slow','Moderate','Fast'].map(p => (
                      <button key={p} onClick={() => setFormData({...formData, pace: p})} className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${formData.pace === p ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-50 bg-white/40 text-slate-500'}`}>{p} Pace</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold font-outfit tracking-tight">Ready for takeoff? ✈️</h2>
                  <p className="text-slate-500">Confirm your trip details before creating.</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-xl space-y-4">
                  {[
                    ['Adventure', formData.name],
                    ['Timeline', `${formData.startDate} to ${formData.endDate}`],
                    ['Mode', `${formData.tripMode.toUpperCase()} ${formData.lookingForBuddy ? '(Seeking Buddy)' : ''}`],
                    ['Budget', `₹ ${inrValue.toLocaleString()} (${formData.currency})`],
                    ['Interests', formData.tags.join(', ') || 'Global Explorer'],
                    ['Flexibility', formData.flexibleDates ? 'Enabled' : 'Fixed Dates'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center border-b border-slate-200/50 pb-3 last:border-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{k}</span>
                      <span className="font-bold text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-between pt-8 border-t border-slate-100">
          <button onClick={prevStep} className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:bg-white hover:text-slate-800'}`}><ArrowLeft className="w-5 h-5" /> Back</button>
          {step < 5 ? (
            <button onClick={nextStep} className="premium-button w-auto flex items-center gap-3 px-10">Continue <ArrowRight className="w-5 h-5" /></button>
          ) : (
            <button onClick={handleComplete} disabled={loading} className="premium-button w-auto flex items-center gap-3 px-10 bg-[#63D5DF] hover:shadow-[0_10px_30px_rgba(99,213,223,0.4)]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create My Trip</span><Sparkles className="w-5 h-5" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
