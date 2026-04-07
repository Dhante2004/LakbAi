import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, Calendar, MapPin, Wallet, Trash2, Edit2, X, Compass, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/index';

export default function Planner() {
  const [destination, setDestination] = useState('');
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('Moderate');
  const [interests, setInterests] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [displayedResult, setDisplayedResult] = useState(""); // What the user actually sees
  const typingQueue = useRef(""); // The background queue holding incoming characters
  
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [registeredDestinations, setRegisteredDestinations] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  const { user } = useAuth();
  const interestOptions = ['Nature', 'Food', 'Culture', 'Adventure', 'Relaxation', 'Shopping'];

  // Smooth AI Typing Effect Loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (typingQueue.current.length > 0) {
        // Take up to 3 characters at a time for a smooth but fast "hallucination" effect
        const charsToTake = Math.min(3, typingQueue.current.length);
        setDisplayedResult(prev => prev + typingQueue.current.substring(0, charsToTake));
        typingQueue.current = typingQueue.current.substring(charsToTake);
      }
    }, 15); // Speed of typing
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [itRes, destRes] = await Promise.all([
          fetch('/api/itineraries', { headers }),
          fetch('/api/destinations')
        ]);

        if (itRes.ok) {
          const itData = await itRes.json();
          setSavedItineraries(itData);
          await db.itineraries.bulkPut(itData);
        }
        if (destRes.ok) {
          const destData = await destRes.json();
          setRegisteredDestinations(destData);
        }
      } catch (err) {
        console.warn("Offline. Loading from cache...");
        const localIt = await db.itineraries.toArray();
        setSavedItineraries(localIt);
      } finally {
        setFetching(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const toggleInterest = (interest) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const startEdit = (itinerary) => {
    setIsEditing(itinerary._id);
    setDestination(itinerary.destination);
    setDays(itinerary.days);
    setBudget(itinerary.budget);
    setInterests(itinerary.interests || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDisplayedResult("");
    typingQueue.current = ""; 
    setShowModal(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ destination, days, budget, interests })
      });
      
      if (!response.body) throw new Error("Stream not supported");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullContent = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        typingQueue.current += chunk; // Add to queue instead of screen directly
      }
      
      // Save to database once finished
      if (isEditing) {
        const updateRes = await fetch(`/api/itineraries/${isEditing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ destination, days, budget, interests, content: fullContent })
        });
        const updatedData = await updateRes.json();
        setSavedItineraries(prev => prev.map(it => it._id === isEditing ? updatedData : it));
        
        // NEW: Instantly update the offline database
        await db.itineraries.put(updatedData);
        
        setIsEditing(null);
      } else {
        const saveRes = await fetch('/api/itineraries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ destination, days, budget, interests, content: fullContent })
        });
        const newIt = await saveRes.json();
        setSavedItineraries(prev => [newIt, ...prev]);
        
        // NEW: Instantly save the newly created itinerary to the offline database
        await db.itineraries.put(newIt);
      }

      setDestination('');
      setInterests([]);
      setDays(3);
      setBudget('Moderate');
    } catch (err) {
      typingQueue.current = "Error generating itinerary. Please try again.";
    } finally {
      setLoading(false);
    }
  };

  const deleteItinerary = async (id) => {
    if (!window.confirm("Delete this itinerary?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/itineraries/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        setSavedItineraries(prev => prev.filter(it => it._id !== id));
        await db.itineraries.delete(id);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const viewItinerary = (content) => {
    setDisplayedResult(content);
    typingQueue.current = ""; // Clear queue so it shows instantly
    setShowModal(true);
  };

  // CLEAN TEXT FORMATTER (Removes ** and ## and makes them beautiful HTML)
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      // Format Main Headers
      if (line.startsWith('## ') || line.startsWith('# ')) {
        const cleanLine = line.replace(/^[#]+ /, '').replace(/\*\*/g, '');
        return <h2 key={i} className="mt-8 mb-4 text-2xl font-black text-emerald-950">{cleanLine}</h2>;
      }
      // Format Sub Headers
      if (line.startsWith('### ')) {
        const cleanLine = line.replace(/^[#]+ /, '').replace(/\*\*/g, '');
        return <h3 key={i} className="mt-6 mb-3 text-xl font-bold text-emerald-800">{cleanLine}</h3>;
      }
      // Format Lists
      if (line.startsWith('* ') || line.startsWith('- ')) {
        let cleanLine = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-950 font-bold">$1</strong>');
        return <li key={i} className="ml-5 mb-2 list-disc marker:text-emerald-500 text-emerald-800" dangerouslySetInnerHTML={{ __html: cleanLine }} />;
      }
      // Format regular text (bolding)
      let cleanLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-950 font-bold">$1</strong>');
      return cleanLine.trim() ? <p key={i} className="mb-4 text-emerald-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanLine }} /> : null;
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 py-10 px-4 sm:px-6">
      <header className="text-center">
        <h1 className="text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
          {isEditing ? 'Refine Your Journey' : 'Design Your Perfect Trip'}
        </h1>
        <p className="mt-3 text-lg text-emerald-700/80">
          Tell us your preferences and watch our AI craft a personalized planner live.
        </p>
      </header>

      {/* Landscape Form Section */}
      <section className="rounded-[2.5rem] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/5 sm:p-10">
        <form onSubmit={handleGenerate} className="flex flex-col gap-8">
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* SEARCHABLE DESTINATION INPUT */}
            <div className="space-y-2 relative">
              <label className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <MapPin size={18} className="text-emerald-500" /> Destination
              </label>
              <input 
                required 
                type="text"
                value={destination} 
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowDestDropdown(true);
                }}
                onFocus={() => setShowDestDropdown(true)}
                onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)} // Delay so click registers
                placeholder="Type a location..."
                className="w-full rounded-2xl border-2 border-emerald-50 bg-emerald-50/30 px-5 py-4 font-medium text-emerald-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
              
              {/* AUTOCOMPLETE DROPDOWN */}
              <AnimatePresence>
                {showDestDropdown && destination && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-emerald-100 bg-white p-2 shadow-2xl"
                  >
                    {registeredDestinations
                      .filter(d => d.name.toLowerCase().includes(destination.toLowerCase()))
                      .map(d => (
                        <li 
                          key={d._id}
                          onClick={() => {
                            setDestination(d.name);
                            setShowDestDropdown(false);
                          }}
                          className="cursor-pointer rounded-xl px-4 py-3 text-sm font-bold text-emerald-900 transition-colors hover:bg-emerald-50"
                        >
                          {d.name} <span className="font-normal text-emerald-500">({d.region})</span>
                        </li>
                    ))}
                    {registeredDestinations.filter(d => d.name.toLowerCase().includes(destination.toLowerCase())).length === 0 && (
                       <li className="px-4 py-3 text-sm text-emerald-500">No matches found.</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <Calendar size={18} className="text-emerald-500" /> Days
              </label>
              <input 
                type="number" min="1" max="14" value={days} onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full rounded-2xl border-2 border-emerald-50 bg-emerald-50/30 px-5 py-4 font-medium text-emerald-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <Wallet size={18} className="text-emerald-500" /> Budget
              </label>
              <select 
                value={budget} onChange={(e) => setBudget(e.target.value)}
                className="w-full appearance-none rounded-2xl border-2 border-emerald-50 bg-emerald-50/30 px-5 py-4 font-medium text-emerald-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none"
              >
                <option>Budget</option>
                <option>Moderate</option>
                <option>Luxury</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex-1 space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <Compass size={18} className="text-emerald-500" /> Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(opt => (
                  <button
                    key={opt} type="button" onClick={() => toggleInterest(opt)}
                    className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                      interests.includes(opt) ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {interests.includes(opt) && <CheckCircle2 size={16} />}
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex w-full gap-3 md:w-auto">
              {isEditing && (
                <button type="button" onClick={() => setIsEditing(null)} className="rounded-2xl border-2 border-rose-100 bg-rose-50 px-6 font-bold text-rose-600 transition-colors hover:bg-rose-100">
                  Cancel
                </button>
              )}
              <button 
                type="submit" disabled={loading || !destination}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-10 py-4 font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-emerald-800 disabled:pointer-events-none disabled:opacity-60 md:flex-none"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {isEditing ? 'Regenerate' : 'Create Planner'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Saved Plans Section */}
      <section className="pt-8">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="text-2xl font-black text-emerald-950">Your Saved Planners</h2>
          <div className="h-px flex-1 bg-emerald-100"></div>
          <span className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-bold text-emerald-800">
            {savedItineraries.length} Saved
          </span>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fetching ? (
            <div className="col-span-full flex flex-col items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            </div>
          ) : savedItineraries.length === 0 ? (
             <div className="col-span-full rounded-3xl border-2 border-dashed border-emerald-100 bg-emerald-50/50 py-20 text-center">
              <Compass className="mx-auto mb-4 h-12 w-12 text-emerald-300" />
              <h3 className="text-lg font-bold text-emerald-900">No planners yet</h3>
              <p className="text-emerald-600">Your AI-generated itineraries will appear here.</p>
            </div>
          ) : (
            savedItineraries.map((it) => (
              <motion.div 
                key={it._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5"
              >
                <div className="bg-emerald-50/50 p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-xl font-black text-emerald-950">{it.destination}</h3>
                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => startEdit(it)} className="rounded-xl bg-white p-2 text-emerald-600 shadow-sm hover:text-emerald-800"><Edit2 size={16} /></button>
                      <button onClick={() => deleteItinerary(it._id)} className="rounded-xl bg-white p-2 text-rose-500 shadow-sm hover:text-rose-700"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm font-bold text-emerald-700">
                    <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 shadow-sm"><Calendar size={14} className="text-emerald-500" /> {it.days} Days</span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 shadow-sm"><Wallet size={14} className="text-emerald-500" /> {it.budget}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="relative text-sm font-medium leading-relaxed text-emerald-600/80 line-clamp-4">
                    {/* Render clean text on the cards too */}
                    {it.content.replace(/[#*]/g, '')}
                    <div className="absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <button onClick={() => viewItinerary(it.content)} className="mt-6 w-full rounded-xl bg-emerald-900/5 py-3 font-bold text-emerald-800 transition-colors hover:bg-emerald-900 hover:text-white">
                    Open Planner
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Streaming / Result Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-md sm:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] bg-stone-50 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-stone-200 bg-white px-8 py-6">
                <h2 className="flex items-center gap-3 text-2xl font-black text-stone-800">
                  {loading ? <Loader2 className="animate-spin text-emerald-500" /> : <Sparkles className="text-emerald-500" />}
                  {loading ? "Drafting Planner..." : "Your Custom Planner"}
                </h2>
                <button onClick={() => setShowModal(false)} className="rounded-full bg-stone-100 p-2 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-800">
                  <X size={20} />
                </button>
              </div>
              
              {/* Clean Formatted Text Output */}
              <div className="flex-1 overflow-y-auto px-8 py-10 sm:px-12">
                <div className="mx-auto max-w-2xl text-lg">
                  {!displayedResult && <span className="text-stone-400 font-serif italic">Thinking...</span>}
                  
                  {/* The actual clean output rendering */}
                  {formatText(displayedResult)}

                  {(loading || typingQueue.current.length > 0) && (
                    <span className="ml-2 inline-block h-4 w-4 animate-pulse rounded-full bg-emerald-500" />
                  )}
                </div>
              </div>

              {!loading && typingQueue.current.length === 0 && (
                <div className="border-t border-stone-200 bg-white px-8 py-6 text-right">
                  <button onClick={() => setShowModal(false)} className="rounded-2xl bg-emerald-900 px-10 py-4 font-bold text-white shadow-lg transition-transform hover:-translate-y-1">
                    Looks Great
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}