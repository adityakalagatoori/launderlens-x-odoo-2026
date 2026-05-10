"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Plus, Trash2, CheckCircle, Circle, BookOpen, Leaf, Package, PenLine, Loader2 } from 'lucide-react';
import { tripsAPI, citiesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function TripDetailPage() {
  const { tripId } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [trip, setTrip] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview'|'itinerary'|'budget'|'packing'|'journal'|'carbon'>('overview');
  // Forms
  const [expForm, setExpForm] = useState({ amount: '', category: 'Food', description: '' });
  const [noteForm, setNoteForm] = useState({ title: '', body: '', mood: '😊' });
  const [packItemForm, setPackItemForm] = useState({ name: '', category: 'Clothing' });
  const [carbonForm, setCarbonForm] = useState({ mode: 'flight' });

  const loadTrip = async () => {
    try {
      const res = await tripsAPI.getTrip(tripId as string);
      setTrip(res.data.data);
    } catch { router.push('/'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadTrip();
    citiesAPI.search().then(r => setCities(r.data.data)).catch(() => {});
  }, [tripId]);

  if (loading) return <div className="min-h-screen bg-travel-gradient flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#63D5DF]" /></div>;
  if (!trip) return null;

  const totalSpent = trip.expenses?.reduce((s: number, e: any) => s + e.amount, 0) || 0;
  const budgetPct = trip.budget > 0 ? Math.min(100, Math.round((totalSpent / trip.budget) * 100)) : 0;
  const totalCarbon = trip.carbonEmissions?.reduce((s: number, e: any) => s + e.kgCo2, 0) || 0;

  const addExpense = async () => {
    if (!expForm.amount) return;
    await tripsAPI.addExpense(trip.id, { ...expForm, userId: user.id });
    setExpForm({ amount: '', category: 'Food', description: '' });
    loadTrip();
  };
  const addNote = async () => {
    if (!noteForm.body) return;
    await tripsAPI.addNote(trip.id, { ...noteForm, userId: user.id });
    setNoteForm({ title: '', body: '', mood: '😊' });
    loadTrip();
  };
  const addStop = async (cityId: string) => {
    await tripsAPI.addStop(trip.id, { cityId, daysCount: 2 });
    loadTrip();
  };
  const addPackItem = async () => {
    if (!packItemForm.name) return;
    let list = trip.packingLists?.[0];
    if (!list) {
      const res = await tripsAPI.createPackingList(trip.id, { name: 'Main List' });
      list = res.data.data;
    }
    await tripsAPI.addPackingItem(trip.id, list.id, packItemForm);
    setPackItemForm({ name: '', category: 'Clothing' });
    loadTrip();
  };
  const togglePack = async (listId: string, itemId: string, current: boolean) => {
    await tripsAPI.togglePackingItem(trip.id, listId, itemId, !current);
    loadTrip();
  };
  const addCarbon = async () => {
    await tripsAPI.addCarbon(trip.id, carbonForm);
    loadTrip();
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <MapPin size={16} /> },
    { id: 'itinerary', label: 'Itinerary', icon: <Calendar size={16} /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign size={16} /> },
    { id: 'packing', label: 'Packing', icon: <Package size={16} /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen size={16} /> },
    { id: 'carbon', label: 'Carbon', icon: <Leaf size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-travel-gradient p-6 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/80 transition-colors"><ArrowLeft size={18} /></Link>
            <div>
              <h1 className="text-2xl font-bold font-outfit">{trip.name}</h1>
              <p className="text-sm text-slate-500">{trip.tripType} • {new Date(trip.startDate).toLocaleDateString()} → {new Date(trip.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-outfit">${trip.budget.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Budget</p>
          </div>
        </motion.div>

        {/* Tab Nav */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap ${tab === t.id ? 'bg-white shadow-md text-[#63D5DF]' : 'bg-white/30 text-slate-600 hover:bg-white/50'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-2">Budget Status</h3>
                <div className="text-3xl font-bold text-[#63D5DF]">${totalSpent.toFixed(0)}</div>
                <p className="text-xs text-slate-500 mb-3">of ${trip.budget} spent</p>
                <div className="w-full bg-white/40 rounded-full h-3"><div className="bg-gradient-to-r from-[#63D5DF] to-[#52C4CE] h-3 rounded-full transition-all" style={{ width: `${budgetPct}%` }} /></div>
              </div>
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-2">Stops</h3>
                <div className="text-3xl font-bold">{trip.itinerary?.length || 0}</div>
                <p className="text-xs text-slate-500">cities on your route</p>
              </div>
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-2">Carbon Footprint</h3>
                <div className="text-3xl font-bold text-green-600">{totalCarbon.toFixed(0)} kg</div>
                <p className="text-xs text-slate-500">CO₂ estimated</p>
              </div>
              {trip.description && <div className="md:col-span-3 glass-panel p-6 rounded-[2rem]"><h3 className="font-bold mb-2">Description</h3><p className="text-slate-600">{trip.description}</p></div>}
            </div>
          )}

          {tab === 'itinerary' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-4">Add a Destination Stop</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cities.map((c: any) => (
                    <button key={c.id} onClick={() => addStop(c.id)} className="bg-white/50 border border-white/60 rounded-2xl p-4 text-left hover:bg-white/80 transition-all">
                      <div className="font-bold">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.country}</div>
                    </button>
                  ))}
                </div>
              </div>
              {(trip.itinerary || []).map((stop: any, i: number) => (
                <motion.div key={stop.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-6 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold">{i + 1}</div>
                      <div><h4 className="font-bold text-lg">{stop.city?.name}</h4><p className="text-xs text-slate-500">{stop.city?.country} • {stop.daysCount} day{stop.daysCount > 1 ? 's' : ''}</p></div>
                    </div>
                    <button onClick={async () => { await tripsAPI.removeStop(trip.id, stop.id); loadTrip(); }} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                  {stop.activities?.length > 0 && (
                    <div className="space-y-2 ml-13">
                      {stop.activities.map((a: any) => (
                        <div key={a.id} className="bg-white/40 rounded-xl p-3 flex justify-between items-center text-sm">
                          <span className="font-medium">{a.activity?.name}</span>
                          <span className="text-slate-500">${a.activity?.cost}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'budget' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-4">Log Expense</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input type="number" placeholder="Amount" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} className="premium-input" />
                  <select value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})} className="premium-input">
                    {['Accommodation','Transport','Food','Activities','Shopping','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="text" placeholder="Description" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} className="premium-input" />
                  <button onClick={addExpense} className="premium-button"><Plus size={16} /> Add</button>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-[2rem]">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Expense History</h3><span className="font-bold text-lg text-[#63D5DF]">Total: ${totalSpent.toFixed(2)}</span></div>
                {trip.expenses?.length === 0 ? <p className="text-slate-500 text-center py-4">No expenses yet.</p> : (
                  <div className="space-y-3">
                    {trip.expenses?.map((e: any) => (
                      <div key={e.id} className="bg-white/40 rounded-2xl p-4 flex justify-between items-center">
                        <div><span className="font-bold">${e.amount}</span><span className="text-sm text-slate-500 ml-2">{e.category}</span>{e.description && <span className="text-sm text-slate-400 ml-2">— {e.description}</span>}</div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString()}</span>
                          <button onClick={async () => { await tripsAPI.deleteExpense(trip.id, e.id); loadTrip(); }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'packing' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-4">Add Item</h3>
                <div className="flex gap-3">
                  <input type="text" placeholder="Item name" value={packItemForm.name} onChange={e => setPackItemForm({...packItemForm, name: e.target.value})} className="premium-input flex-1" />
                  <select value={packItemForm.category} onChange={e => setPackItemForm({...packItemForm, category: e.target.value})} className="premium-input w-40">
                    {['Clothing','Toiletries','Electronics','Documents','Medicine','Accessories','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button onClick={addPackItem} className="premium-button w-auto px-6"><Plus size={16} /></button>
                </div>
              </div>
              {(trip.packingLists || []).map((list: any) => (
                <div key={list.id} className="glass-panel p-6 rounded-[2rem]">
                  <h3 className="font-bold mb-4">{list.name} ({list.items?.filter((i: any) => i.isPacked).length}/{list.items?.length})</h3>
                  <div className="space-y-2">
                    {list.items?.map((item: any) => (
                      <button key={item.id} onClick={() => togglePack(list.id, item.id, item.isPacked)} className={`w-full text-left bg-white/40 rounded-xl p-3 flex items-center gap-3 transition-all ${item.isPacked ? 'opacity-60' : ''}`}>
                        {item.isPacked ? <CheckCircle size={18} className="text-green-500" /> : <Circle size={18} className="text-slate-400" />}
                        <span className={`font-medium ${item.isPacked ? 'line-through' : ''}`}>{item.name}</span>
                        <span className="text-xs text-slate-400 ml-auto">{item.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'journal' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-4">New Journal Entry</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Title (optional)" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} className="premium-input" />
                  <textarea placeholder="What happened today? How are you feeling?" value={noteForm.body} onChange={e => setNoteForm({...noteForm, body: e.target.value})} className="premium-input min-h-[100px]" />
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {['😊','😐','😢','🤩','😴'].map(m => (
                        <button key={m} onClick={() => setNoteForm({...noteForm, mood: m})} className={`text-2xl p-2 rounded-xl transition-all ${noteForm.mood === m ? 'bg-white shadow-md scale-110' : 'hover:bg-white/50'}`}>{m}</button>
                      ))}
                    </div>
                    <button onClick={addNote} className="premium-button w-auto px-6 ml-auto"><PenLine size={16} /> Save Entry</button>
                  </div>
                </div>
              </div>
              {(trip.notes || []).map((note: any) => (
                <motion.div key={note.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-[2rem]">
                  <div className="flex justify-between items-start mb-3">
                    <div><h4 className="font-bold text-lg">{note.title || 'Untitled Entry'}</h4><p className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleString()}</p></div>
                    <div className="flex items-center gap-2">
                      {note.mood && <span className="text-2xl">{note.mood}</span>}
                      <button onClick={async () => { await tripsAPI.deleteNote(trip.id, note.id); loadTrip(); }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-slate-600 whitespace-pre-wrap">{note.body}</p>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'carbon' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-[2rem]">
                <h3 className="font-bold mb-4">Add Transport Emission</h3>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Transport Mode</label>
                    <select value={carbonForm.mode} onChange={e => setCarbonForm({...carbonForm, mode: e.target.value})} className="premium-input">
                      {['Flight','Car','Train','Bus','Ferry'].map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
                    </select>
                  </div>
                  <button onClick={addCarbon} className="premium-button w-auto px-6"><Plus size={16} /> Add</button>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-[2rem]">
                <div className="flex justify-between items-center mb-6"><h3 className="font-bold">Carbon Footprint</h3><span className="text-2xl font-bold text-green-600">{totalCarbon.toFixed(0)} kg CO₂</span></div>
                <div className="space-y-3">
                  {(trip.carbonEmissions || []).map((e: any) => (
                    <div key={e.id} className="bg-white/40 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3"><Leaf size={16} className="text-green-500" /><span className="font-medium capitalize">{e.mode}</span></div>
                      <span className="font-bold">{e.kgCo2} kg CO₂</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
