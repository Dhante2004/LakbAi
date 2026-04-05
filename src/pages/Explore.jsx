import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// jericho you add this to imports: User, Mail, Phone, Calendar, Info, X
import { Search, MapPin, Star, Heart, Loader2, User, Mail, Phone, Calendar, Info, X } from 'lucide-react';
import { db } from '../db/index';

export default function Explore() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // jericho you add this to state:
  const [selectedDest, setSelectedDest] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations');
        if (!response.ok) throw new Error('Failed to fetch from server');
        
        const data = await response.json();
        setDestinations(data);
        await db.destinations.bulkPut(data); 

      } catch (err) {
        console.warn("Offline or server unreachable. Loading from local cache...");
        try {
          const localData = await db.destinations.toArray();
          if (localData.length > 0) {
            setDestinations(localData);
          } else {
            setError('You are offline and have no cached destinations.');
          }
        } catch (localErr) {
          setError('Failed to load local data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const filtered = destinations.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                         d.description.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = region === 'All' || d.region === region;
    return matchesSearch && matchesRegion;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-emerald-900">Explore Destinations</h1>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
            <input 
              type="text" 
              placeholder="Search spots, beaches, mountains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-white py-4 pl-12 pr-4 text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Luzon', 'Visayas', 'Mindanao'].map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`whitespace-nowrap rounded-full px-6 py-2 font-medium transition-all ${
                  region === r 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-center text-rose-600">
          {error}
        </div>
      )}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((dest) => (
          <motion.div 
            key={dest._id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-100"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={dest.image} 
                alt={dest.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                <Star size={12} fill="currentColor" className="text-yellow-400" />
                {dest.rating}
              </div>
            </div>
            <div className="p-6">
              <div className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-500">
                <MapPin size={12} />
                {dest.region}
              </div>
              <h3 className="mb-2 text-xl font-bold text-emerald-900">{dest.name}</h3>
              <p className="line-clamp-2 text-sm text-emerald-600/80">{dest.description}</p>
              
              {/* jericho you add this to make View Details clickable */}
              <button 
                onClick={() => setSelectedDest(dest)}
                className="mt-4 w-full rounded-xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </section>

      {/* jericho you add this Detail Modal Section */}
      <AnimatePresence>
        {selectedDest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDest(null)}
              className="absolute inset-0 bg-emerald-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2.5rem] bg-white p-0 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedDest(null)}
                className="absolute right-6 top-6 z-10 rounded-full bg-black/20 p-2 text-white backdrop-blur-md hover:bg-black/40"
              >
                <X size={20} />
              </button>

              <div className="h-64 w-full">
                <img src={selectedDest.image} className="h-full w-full object-cover" alt={selectedDest.name} />
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-emerald-900">{selectedDest.name}</h2>
                  <p className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                    <MapPin size={14} /> {selectedDest.region}
                  </p>
                </div>

                {/* Uploader Info */}
                <div className="mb-8 space-y-3 rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Posted By</p>
                  <div className="flex items-center gap-3 text-emerald-700">
                    <User size={18} />
                    <span className="text-sm font-medium">{selectedDest.postedBy?.name || 'Local Guide'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-700">
                    <Mail size={18} />
                    <span className="text-sm font-medium">{selectedDest.postedBy?.email || 'contact@lakbai.com'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-700">
                    <Phone size={18} />
                    <span className="text-sm font-medium">{selectedDest.postedBy?.phone || '+63 912 345 6789'}</span>
                  </div>
                </div>

                <p className="mb-8 text-emerald-800/80 leading-relaxed">
                  {selectedDest.description}
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-800 py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95">
                    <Calendar size={18} /> Add to Planner
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-100 bg-white py-4 font-bold text-emerald-800 transition-colors hover:bg-emerald-50">
                    <Info size={18} /> More on this place
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-400">
          <Search size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No destinations found</p>
        </div>
      )}
    </div>
  );
}