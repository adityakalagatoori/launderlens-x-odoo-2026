"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Map, Calendar, Users, Target, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { tripsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const STEPS = [
  { id: 1, name: 'Basics', icon: Map },
  { id: 2, name: 'Dates', icon: Calendar },
  { id: 3, name: 'Budget', icon: Target },
  { id: 4, name: 'Preferences', icon: Users },
  { id: 5, name: 'Review', icon: CheckCircle },
];

export default function CreateTripWizard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', description: '', startDate: '', endDate: '',
    tripType: 'Leisure', budget: '', currency: 'USD', visibility: 'PRIVATE', tags: [] as string[]
  });

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
        <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }} />
        {STEPS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${s.id === step ? 'bg-emerald-500 text-white shadow-lg' : s.id < step ? 'bg-emerald-400 text-white' : 'bg-white/50 text-slate-400 backdrop-blur-md'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`mt-2 text-xs font-bold ${s.id === step ? 'text-slate-800' : 'text-slate-500'}`}>{s.name}</span>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl min-h-[400px] flex flex-col">
        {error && <div className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-grow">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-outfit">Name your adventure</h2>
                <input type="text" placeholder="e.g., Summer in Paris" className="premium-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <textarea placeholder="What's the vibe? (optional)" className="premium-input min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-outfit">When are we going?</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label><input type="date" className="premium-input" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">End Date</label><input type="date" className="premium-input" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-outfit">Set your budget</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Total Budget</label><input type="number" placeholder="5000" className="premium-input" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Currency</label><select className="premium-input" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}><option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option><option>INR</option></select></div>
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Trip Type</label>
                  <select className="premium-input" value={formData.tripType} onChange={e => setFormData({...formData, tripType: e.target.value})}><option>Leisure</option><option>Business</option><option>Adventure</option><option>Family</option><option>Solo</option></select>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-outfit">What excites you?</h2>
                <div className="flex flex-wrap gap-2">
                  {['Culture','Food','Nightlife','Nature','Shopping','Relaxation','Adventure','Photography','History','Art'].map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${formData.tags.includes(tag) ? 'bg-slate-900 text-white' : 'bg-white/60 text-slate-600 hover:bg-white/90'}`}>{tag}</button>
                  ))}
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-outfit">Ready for takeoff? ✈️</h2>
                <div className="bg-white/40 p-6 rounded-2xl border border-white/50 space-y-3">
                  {[['Trip', formData.name || 'Untitled'], ['Dates', `${formData.startDate} → ${formData.endDate}`], ['Type', formData.tripType], ['Budget', `$${formData.budget || '0'} ${formData.currency}`], ['Tags', formData.tags.join(', ') || 'None']].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-slate-200/30 pb-2 last:border-0"><span className="text-slate-500 font-semibold">{k}</span><span className="font-bold">{v}</span></div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-between pt-6 border-t border-slate-200/50">
          <button onClick={prevStep} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-white/50'}`}><ArrowLeft className="w-5 h-5" /> Back</button>
          {step < 5 ? (
            <button onClick={nextStep} className="premium-button w-auto flex items-center gap-2">Continue <ArrowRight className="w-5 h-5" /></button>
          ) : (
            <button onClick={handleComplete} disabled={loading} className="premium-button w-auto flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create Trip</span><CheckCircle className="w-5 h-5" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
