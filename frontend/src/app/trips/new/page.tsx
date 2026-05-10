"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Map, Calendar, Users, Target, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { tripsAPI } from '@/lib/api';

const STEPS = [
  { id: 1, name: 'Basics', icon: Map },
  { id: 2, name: 'Dates', icon: Calendar },
  { id: 3, name: 'Companions', icon: Users },
  { id: 4, name: 'Preferences', icon: Target },
  { id: 5, name: 'Review', icon: CheckCircle },
];

export default function CreateTripWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    tripType: 'Leisure',
    budget: '',
    currency: 'USD',
    visibility: 'PRIVATE',
    tags: [] as string[]
  });

  const nextStep = () => setStep(s => Math.min(5, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Mocking ownerId since auth isn't fully persistent in this demo
      const payload = {
        ...formData,
        ownerId: 'demo-user-id' 
      };
      await tripsAPI.createTrip(payload);
      router.push('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="min-h-screen bg-travel-gradient flex flex-col items-center justify-center p-4 text-slate-800">
      
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8 flex justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/30 -z-10 -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 -translate-y-1/2 transition-all duration-500"
          style={{ width: \`\${((step - 1) / 4) * 100}%\` }}
        />
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isPassed = s.id < step;
          return (
            <div key={s.id} className="flex flex-col items-center">
              <div className={\`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 \${
                isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 
                isPassed ? 'bg-emerald-400 text-white' : 'bg-white/50 text-slate-400 backdrop-blur-md'
              }\`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={\`mt-2 text-xs font-bold \${isActive ? 'text-slate-800' : 'text-slate-500'}\`}>
                {s.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Wizard Card */}
      <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-grow"
          >
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-heading">Let's start with the basics</h2>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Trip Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Summer in Paris"
                    className="premium-input w-full"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea 
                    placeholder="What's the vibe?"
                    className="premium-input w-full min-h-[100px] py-4"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-heading">When are we going?</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      className="premium-input w-full"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                    <input 
                      type="date" 
                      className="premium-input w-full"
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-heading">Who's coming?</h2>
                <div className="p-6 border border-slate-200 rounded-2xl bg-white/50 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">Invite companions to collaborate on the itinerary.</p>
                  <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800 transition-colors">
                    + Invite via Email
                  </button>
                </div>
                <p className="text-xs text-center text-slate-500">You can always add people later.</p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-heading">Set your preferences</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Trip Type</label>
                    <select 
                      className="premium-input w-full"
                      value={formData.tripType}
                      onChange={e => setFormData({...formData, tripType: e.target.value})}
                    >
                      <option>Leisure</option>
                      <option>Business</option>
                      <option>Adventure</option>
                      <option>Family</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Total Budget Estimate</label>
                    <input 
                      type="number" 
                      placeholder="e.g., 5000"
                      className="premium-input w-full"
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Interest Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {['Culture', 'Food', 'Nightlife', 'Nature', 'Shopping', 'Relaxation'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={\`px-4 py-2 rounded-full text-sm font-semibold transition-all \${
                          formData.tags.includes(tag) 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white/60 text-slate-600 hover:bg-white/90'
                        }\`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-heading">Ready for takeoff?</h2>
                <div className="bg-white/40 p-6 rounded-2xl border border-white/50 space-y-4">
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500 font-semibold">Name</span>
                    <span className="font-bold">{formData.name || 'Untitled Trip'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500 font-semibold">Dates</span>
                    <span className="font-bold">{formData.startDate} to {formData.endDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500 font-semibold">Type</span>
                    <span className="font-bold">{formData.tripType}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500 font-semibold">Budget</span>
                    <span className="font-bold">${formData.budget || '0'} {formData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Tags</span>
                    <span className="font-bold">{formData.tags.join(', ') || 'None'}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-10 flex justify-between pt-6 border-t border-slate-200/50">
          <button 
            onClick={prevStep}
            className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all \${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-white/50'}\`}
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          {step < 5 ? (
            <button 
              onClick={nextStep}
              className="premium-button flex items-center gap-2"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleComplete}
              disabled={loading}
              className="premium-button flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? 'Creating...' : 'Create Trip'} <CheckCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
