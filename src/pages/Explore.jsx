import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Heart, Loader2, Mail, Phone, Building, X, Map, ChevronRight, Star } from 'lucide-react';
import { db } from '../db/index';
import { useAuth } from '../context/AuthContext';

export default function Explore() {
  const { user } = useAuth(); 
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedDest, setSelectedDest] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0); // For the 5-star hover effect
  
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(`favorites_${user?._id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(`favorites_${user?._id || 'guest'}`, JSON.stringify(favorites));
  }, [favorites, user]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations');
        if (!response.ok) throw new Error('Failed to fetch from server');
        
        const data = await response.json();
        setDestinations(data);
        await db.destinations.bulkPut(data); 

      } catch (err) {
        setError('Failed to load data. Checking offline cache...');
        try {
          const localData = await db.destinations.toArray();
          if (localData.length > 0) {
            setDestinations(localData);
            setError(''); 
          }
        } catch (localErr) {
          console.error("Local load failed too", localErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  /// API Call to submit a real 5-star rating
  const submitRating = async (ratingValue) => {
    if (!user) return alert("Please log in to rate destinations.");
    
    try {
      const token = localStorage.getItem('token');
      // Failsafe: Handle both _id and id depending on how the data was cached
      const destId = selectedDest._id || selectedDest.id; 
      
      const response = await fetch(`/api/destinations/${destId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingValue })
      });

      if (response.ok) {
        const updatedDest = await response.json();
        // Update local state and modal instantly
        setSelectedDest(updatedDest);
        setDestinations(prev => prev.map(d => (d._id || d.id) === (updatedDest._id || updatedDest.id) ? updatedDest : d));
        await db.destinations.put(updatedDest); // Backup offline
      } else {
        const errorData = await response.json();
        alert(`Could not save rating: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Failed to submit rating", err);
      alert("Network error: Could not submit rating. Check your connection.");
    }
  };

  const filtered = destinations.filter(d => {
    if (showFavorites && !favorites.includes(d._id)) return false;

    const safeName = d.name || d.title || 'Unknown';
    const safeDesc = d.description || '';
    const matchesSearch = safeName.toLowerCase().includes(search.toLowerCase()) ||
                          safeDesc.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = region === 'All' || d.region === region || d.location === region;
    
    return matchesSearch && matchesRegion;
  });

  const getRelatedDestinations = () => {
    if (!selectedDest) return [];
    return destinations
      .filter(d => d.region === selectedDest.region && d._id !== selectedDest._id)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <header className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-emerald-950">Explore Destinations</h1>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
            <input 
              type="text" 
              placeholder="Search spots, beaches, mountains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border-2 border-emerald-50 bg-white py-4 pl-12 pr-4 font-medium text-emerald-900 shadow-sm transition-all focus:border-emerald-500 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide items-center">
            {['All', 'Luzon', 'Visayas', 'Mindanao'].map((r) => (
              <button
                key={r}
                onClick={() => { setRegion(r); setShowFavorites(false); }} 
                className={`whitespace-nowrap rounded-2xl px-8 py-4 font-bold transition-all ${
                  region === r && !showFavorites
                    ? 'bg-emerald-800 text-white shadow-lg' 
                    : 'bg-white text-emerald-700 hover:bg-emerald-50 border-2 border-emerald-50'
                }`}
              >
                {r}
              </button>
            ))}

            <div className="h-8 w-px bg-emerald-100 mx-1 hidden md:block"></div>

            {/* Favorites Icon Only (Moved after Mindanao) */}
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              title="My Favorites"
              className={`flex items-center justify-center rounded-2xl p-4 transition-all ${
                showFavorites 
                  ? 'bg-rose-100 border-2 border-rose-200 shadow-md' 
                  : 'bg-white hover:bg-rose-50 border-2 border-emerald-50'
              }`}
            >
              <Heart size={22} className={showFavorites ? "fill-rose-600 text-rose-600" : "text-emerald-300"} />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-center font-medium text-rose-600">
          {error}
        </div>
      )}

      {/* Main Grid */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((dest) => {
          // Calculate REAL Average Rating!
          const ratings = dest.ratings || [];
          const avgRating = ratings.length > 0 
            ? (ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(1)
            : 'New';

          return (
            <motion.div 
              key={dest._id || Math.random()}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex flex-col overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10"
            >
              <div className="relative h-56 overflow-hidden bg-emerald-100">
                <img 
                  src={dest.image || dest.imageUrl || 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=500&q=80'} 
                  alt={dest.name || dest.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                
                {/* Real Data Rating Badge Overlay */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-950 shadow-md backdrop-blur-md">
                  <Star size={14} className={ratings.length > 0 ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
                  {avgRating} {ratings.length > 0 && <span className="font-medium text-emerald-600/70">({ratings.length})</span>}
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(dest._id); }}
                  className="absolute right-4 top-4 rounded-full bg-white/80 p-2.5 backdrop-blur-md transition-colors hover:bg-rose-50"
                >
                  <Heart size={18} className={favorites.includes(dest._id) ? "fill-rose-500 text-rose-500" : "text-emerald-700"} />
                </button>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-500">
                  <MapPin size={14} /> {dest.region || 'Unknown'}
                </div>
                <h3 className="mb-3 text-2xl font-black text-emerald-950">
                  {dest.name || dest.title || 'Unnamed Destination'}
                </h3>
                <p className="mb-6 line-clamp-2 text-emerald-700/80">
                  {dest.description || 'No description available.'}
                </p>
                
                <div className="mt-auto pt-4 border-t border-emerald-50">
                  <button 
                    onClick={() => setSelectedDest(dest)}
                    className="w-full rounded-2xl bg-emerald-50 py-3.5 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-900 hover:text-white"
                  >
                    Explore Details
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Landscape Detail Modal */}
      <AnimatePresence>
        {selectedDest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedDest(null)}
              className="absolute inset-0 bg-emerald-950/70 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl md:flex-row"
            >
              <button 
                onClick={() => setSelectedDest(null)}
                className="absolute right-6 top-6 z-20 rounded-full bg-white/50 p-2.5 text-emerald-900 backdrop-blur-md transition-colors hover:bg-white"
              >
                <X size={20} />
              </button>

              {/* LEFT COLUMN: Media (Image & Map) */}
              <div className="flex h-64 w-full flex-col md:h-auto md:w-2/5 lg:w-1/2">
                <div className="relative h-1/2 w-full bg-emerald-100">
                  <img 
                    src={selectedDest.image || selectedDest.imageUrl || 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=500&q=80'} 
                    className="h-full w-full object-cover" 
                    alt={selectedDest.name} 
                  />
                </div>
                
                {/* Live Google Maps Embed */}
                <div className="relative h-1/2 w-full bg-slate-200">
                  <iframe 
                    title="map"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      selectedDest.coordinates || 
                      selectedDest.address || 
                      `${selectedDest.name}, ${selectedDest.region}, Philippines`
                    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  />
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md text-emerald-800">
                    <Map size={14} className="text-emerald-500" /> Live Map
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Information */}
              <div className="flex w-full flex-col overflow-y-auto bg-stone-50 p-8 md:w-3/5 lg:w-1/2 lg:p-12">
                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-500">
                      <MapPin size={16} /> {selectedDest.region || 'Unknown Region'}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      {selectedDest.category || 'Nature'}
                    </span>
                    
                    {/* Real Average Rating Display */}
                    <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-emerald-950 shadow-sm border border-emerald-50">
                      <Star size={14} className={(selectedDest.ratings?.length > 0) ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
                      {selectedDest.ratings?.length > 0 
                        ? (selectedDest.ratings.reduce((sum, r) => sum + r.value, 0) / selectedDest.ratings.length).toFixed(1)
                        : 'New'}
                    </span>
                  </div>
                  
                  <h2 className="mb-2 text-4xl font-black text-emerald-950 leading-tight">
                    {selectedDest.name || selectedDest.title}
                  </h2>
                  
                  {selectedDest.address && (
                    <p className="mb-6 font-medium text-emerald-700/80">
                      📍 {selectedDest.address}
                    </p>
                  )}
                  
                  <p className="text-lg leading-relaxed text-emerald-800/80">
                    {selectedDest.description || 'No description available for this destination.'}
                  </p>
                </div>

                {/* 5-STAR INTERACTIVE RATING UI */}
                <div className="mb-10 rounded-[1.5rem] bg-emerald-900 text-white p-6 shadow-md flex items-center justify-between">
                  <div>
                    <h3 className="font-black">Rate this destination</h3>
                    <p className="text-sm text-emerald-200">Share your experience!</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      // Check if the current user has already rated this to highlight it permanently
                      const userRating = selectedDest.ratings?.find(r => r.userId === user?._id)?.value || 0;
                      return (
                        <button 
                          key={star}
                          onClick={() => submitRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="transition-transform hover:scale-110 active:scale-90"
                        >
                          <Star 
                            size={28} 
                            className={`transition-colors ${
                              star <= (hoveredStar || userRating)
                                ? "fill-amber-400 text-amber-400" 
                                : "fill-emerald-950/20 text-emerald-700"
                            }`} 
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Submitter Info */}
                <div className="mb-10 rounded-[1.5rem] border border-emerald-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 text-xs font-black uppercase tracking-widest text-emerald-400">Tourism Office Contact</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <p className="flex items-center gap-3 text-sm font-bold text-emerald-900">
                      <span className="rounded-full bg-emerald-50 p-2"><Building size={16} className="text-emerald-600" /></span>
                      {selectedDest.submittedBy?.name || 'Local Tourism Office'}
                    </p>
                    <p className="flex items-center gap-3 text-sm font-bold text-emerald-900">
                      <span className="rounded-full bg-emerald-50 p-2"><Mail size={16} className="text-emerald-600" /></span>
                      <span className="truncate">{selectedDest.submittedBy?.email || 'N/A'}</span>
                    </p>
                    <p className="flex items-center gap-3 text-sm font-bold text-emerald-900 sm:col-span-2">
                      <span className="rounded-full bg-emerald-50 p-2"><Phone size={16} className="text-emerald-600" /></span>
                      {selectedDest.submittedBy?.phone || 'No contact number provided'}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-auto pt-6">
                  <button 
                    onClick={() => toggleFavorite(selectedDest._id)}
                    className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black transition-all hover:scale-[1.02] active:scale-95 ${
                      favorites.includes(selectedDest._id)
                        ? 'bg-rose-100 text-rose-600 border-2 border-rose-200'
                        : 'bg-emerald-900 text-white shadow-xl hover:bg-emerald-800'
                    }`}
                  >
                    <Heart size={20} className={favorites.includes(selectedDest._id) ? "fill-rose-600" : ""} /> 
                    {favorites.includes(selectedDest._id) ? 'Saved to Favorites' : 'Add to Favorites'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Empty State for Searches and Favorites */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-400">
          {showFavorites ? (
            <>
              <Heart size={64} className="mb-6 opacity-20" />
              <p className="text-xl font-bold text-emerald-900">No favorites yet</p>
              <p className="text-emerald-600">Click the heart icon on any destination to save it here!</p>
            </>
          ) : (
            <>
              <Search size={64} className="mb-6 opacity-20" />
              <p className="text-xl font-bold text-emerald-900">No destinations found</p>
              <p className="text-emerald-600">Try adjusting your search or region filter.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}