"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Star, DollarSign, Globe, CheckCircle, Clock, X, ArrowLeft, Save } from 'lucide-react';
import { guidesAPI } from '@/lib/api';

export default function GuideDashboardPage() {
  const router = useRouter();
  const [guide, setGuide] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<any[]>([]);
  const [showAcceptModal, setShowAcceptModal] = useState<string | null>(null);
  const [acceptMessage, setAcceptMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('traveloop-guide-token');
    if (!token) { router.push('/guide/login'); return; }
    loadProfile();
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cities');
      const data = await res.json();
      if (data.success) setCities(data.data);
    } catch(e){}
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Temporarily set the auth header for guide token
      const token = localStorage.getItem('traveloop-guide-token');
      const res = await fetch('http://localhost:5000/api/guides/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setGuide(data.data); setForm({ name:data.data.name, phone:data.data.phone||'', bio:data.data.bio||'', ratePerDay:data.data.ratePerDay, experience:data.data.experience, specialties:data.data.specialties||'', cityId:data.data.cityId }); }
      else { router.push('/guide/login'); }
    } catch { router.push('/guide/login'); }
    finally { setLoading(false); }
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('traveloop-guide-token');
      await fetch('http://localhost:5000/api/guides/me', { method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(form) });
      setEditing(false); loadProfile();
    } catch(e){console.error(e)}
  };

  const updateBooking = async (bookingId:string, status:string, message?:string) => {
    try {
      const token = localStorage.getItem('traveloop-guide-token');
      await fetch(`http://localhost:5000/api/guides/booking/${bookingId}/status`, { method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({status, message}) });
      setShowAcceptModal(null);
      setAcceptMessage('');
      loadProfile();
    } catch(e){console.error(e)}
  };

  const logout = () => { localStorage.removeItem('traveloop-guide-token'); router.push('/guide/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!guide) return null;

  return (
    <div className="min-h-screen p-6 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={()=>router.push('/')} className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/80 border border-white/40"><ArrowLeft size={18}/></button>
            <div><h1 className="text-3xl font-bold font-outfit">🗺️ Guide Dashboard</h1><p className="text-slate-500 text-sm">Manage your profile & bookings</p></div>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-xl text-sm">Logout</button>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">My Profile</h2><button onClick={()=>setEditing(!editing)} className="text-sm text-[#63D5DF] font-bold">{editing?'Cancel':'Edit'}</button></div>
          {editing ? (
            <div className="space-y-4">
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Name" className="premium-input"/>
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone" className="premium-input"/>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.ratePerDay} onChange={e=>setForm({...form,ratePerDay:e.target.value})} placeholder="Rate/Day" className="premium-input"/>
                <input type="number" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} placeholder="Experience (yrs)" className="premium-input"/>
              </div>
              <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Bio" rows={3} className="premium-input resize-none"/>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.specialties} onChange={e=>setForm({...form,specialties:e.target.value})} placeholder="Specialties" className="premium-input"/>
                <select value={form.cityId} onChange={e=>setForm({...form,cityId:e.target.value})} className="premium-input">
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button onClick={saveProfile} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl"><Save size={16}/> Save</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-xs text-gray-500 font-bold uppercase">Name</span><p className="font-bold">{guide.name}</p></div>
              <div><span className="text-xs text-gray-500 font-bold uppercase">Email</span><p className="font-bold">{guide.email}</p></div>
              <div><span className="text-xs text-gray-500 font-bold uppercase">City</span><p className="font-bold">{guide.city?.name}, {guide.city?.country}</p></div>
              <div><span className="text-xs text-gray-500 font-bold uppercase">Rate/Day</span><p className="font-bold">${guide.ratePerDay}</p></div>
              <div><span className="text-xs text-gray-500 font-bold uppercase">Experience</span><p className="font-bold">{guide.experience} years</p></div>
              <div><span className="text-xs text-gray-500 font-bold uppercase">Rating</span><p className="font-bold">⭐ {guide.rating}</p></div>
              {guide.bio && <div className="col-span-2"><span className="text-xs text-gray-500 font-bold uppercase">Bio</span><p className="text-gray-600">{guide.bio}</p></div>}
              {guide.specialties && <div className="col-span-2"><span className="text-xs text-gray-500 font-bold uppercase">Specialties</span><p className="font-bold">{guide.specialties}</p></div>}
            </div>
          )}
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">📋 Bookings ({guide.bookings?.length||0})</h2>
          {guide.bookings?.length > 0 ? (
            <div className="space-y-3">{guide.bookings.map((b:any)=>(
              <div key={b.id} className="flex items-center justify-between bg-white/40 rounded-xl p-4">
                <div>
                  <p className="font-bold">{b.trip?.name||'Trip'}</p>
                  <p className="text-sm text-gray-500">by {b.user?.name||b.user?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status==='CONFIRMED'?'bg-emerald-100 text-emerald-600':b.status==='CANCELLED'?'bg-red-100 text-red-600':'bg-amber-100 text-amber-600'}`}>{b.status}</span>
                  {b.status==='PENDING'&&<><button onClick={()=>setShowAcceptModal(b.id)} className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold">Accept</button><button onClick={()=>updateBooking(b.id,'CANCELLED')} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">Decline</button></>}
                </div>
              </div>
            ))}</div>
          ) : <p className="text-gray-400 text-center py-6">No bookings yet. Once travelers find you, bookings will appear here!</p>}
        </div>

        {/* Accept Modal */}
        {showAcceptModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={()=>setShowAcceptModal(null)}>
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="glass-panel w-full max-w-md p-8 rounded-[2rem]" onClick={e=>e.stopPropagation()}>
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold">Confirm Acceptance</h3>
                 <button onClick={()=>setShowAcceptModal(null)}><X size={20}/></button>
               </div>
               <div className="space-y-4">
                 <p className="text-sm text-slate-500">Include a message for the traveler (e.g. your phone number, pricing details, or a welcome note).</p>
                 <textarea 
                    value={acceptMessage} 
                    onChange={e=>setAcceptMessage(e.target.value)} 
                    placeholder="Type your message here..." 
                    rows={4} 
                    className="premium-input resize-none"
                 />
                 <div className="flex gap-3">
                   <button onClick={()=>setShowAcceptModal(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                   <button onClick={()=>updateBooking(showAcceptModal, 'CONFIRMED', acceptMessage)} className="flex-1 py-3 bg-[#63D5DF] text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all">Accept Booking</button>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
