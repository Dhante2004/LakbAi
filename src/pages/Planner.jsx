import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, Calendar, MapPin, Wallet, Heart, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Planner() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('Moderate');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [fetching, setFetching] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/itineraries', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSavedItineraries(data);
        }
      } catch (err) {
        console.error("Failed to fetch itineraries:", err);
      } finally {
        setFetching(false);
      }
    };

    if (user) fetchItineraries();
  }, [user]);

  const interestOptions = ['Nature', 'Food', 'Culture', 'Adventure', 'Relaxation', 'Shopping'];

  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const genResponse = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ destination, days, budget, interests })
      });
      
      const genData = await genResponse.json();
      if (!genResponse.ok) throw new Error(genData.message || 'Generation failed');
      
      const plan = genData.plan;
      setResult(plan);
      
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination,
          days,
          budget,
          interests,
          content: plan
        })
      });

      if (response.ok) {
        const newItinerary = await response.json();
        setSavedItineraries(prev => [newItinerary, ...prev]);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteItinerary = async (id) => {
    try {
      // For now, let's just implement a simple delete on the frontend state
      // In a real app, you'd have a DELETE /api/itineraries/:id endpoint
      setSavedItineraries(prev => prev.filter(it => it._id !== id));
      // await fetch(`/api/itineraries/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    } catch (err) {
      console.error("Error deleting itinerary:", err);
    }
  };

  return (
    <div className="space-y-12 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-emerald-900">AI Itinerary Planner</h1>
        <p className="text-emerald-600">Let AI craft your perfect trip, powered by MongoDB Atlas.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <section className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <MapPin size={16} /> Destination
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Palawan, Cebu, Baguio"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <Calendar size={16} /> Duration (Days)
                </label>
                <input 
                  type="number" 
                  min="1" max="14"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <Wallet size={16} /> Budget
                </label>
                <select 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option>Budget</option>
                  <option>Moderate</option>
                  <option>Luxury</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-emerald-800">Interests</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleInterest(opt)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      interests.includes(opt) 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 py-4 font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Generating...' : 'Generate Itinerary'}
            </button>
          </form>
        </section>

        {/* Results/Saved */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-emerald-900">Saved Itineraries</h2>
          <div className="space-y-4">
            {fetching ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-emerald-400" />
              </div>
            ) : savedItineraries.map((it) => (
              <motion.div 
                key={it._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold text-emerald-900">{it.destination}</h3>
                  <button 
                    onClick={() => deleteItinerary(it._id)}
                    className="text-emerald-300 hover:text-rose-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex gap-4 text-xs text-emerald-500">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {it.days} Days</span>
                  <span className="flex items-center gap-1"><Wallet size={12} /> {it.budget}</span>
                </div>
                <div className="mt-4 max-h-32 overflow-hidden text-sm text-emerald-600/80">
                  <div className="prose prose-sm prose-emerald">
                    {it.content.substring(0, 150)}...
                  </div>
                </div>
                <button 
                  onClick={() => setResult(it.content)}
                  className="mt-4 text-xs font-bold text-emerald-600 hover:underline"
                >
                  View Full Plan
                </button>
              </motion.div>
            ))}
            {!fetching && savedItineraries.length === 0 && (
              <div className="rounded-2xl border border-dashed border-emerald-200 p-12 text-center text-emerald-400">
                <p>No saved plans yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Result Modal/Overlay */}
      {result && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-900/40 p-6 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-emerald-900">Your Itinerary</h2>
              <button onClick={() => setResult(null)} className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                <X size={20} />
              </button>
            </div>
            <div className="prose prose-emerald max-w-none whitespace-pre-wrap text-emerald-800">
              {result}
            </div>
            <button 
              onClick={() => setResult(null)}
              className="mt-8 w-full rounded-xl bg-emerald-600 py-4 font-bold text-white"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function X({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
