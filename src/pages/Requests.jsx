import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Phone, MapPin, Building, Map, AlignLeft, Loader2, Eye, Calendar, Mail, User } from 'lucide-react';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/destinations/pending', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pending requests');
        }

        const data = await response.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError('Failed to load pending requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/destinations/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setRequests((prev) => prev.filter((req) => req._id !== id));
        if (selectedRequest && selectedRequest._id === id) setSelectedRequest(null);
      } else {
        alert("Failed to approve destination.");
      }
    } catch (err) {
      console.error("Error approving:", err);
      alert("An error occurred while approving.");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject and delete this request?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/destinations/${id}/reject`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setRequests((prev) => prev.filter((req) => req._id !== id));
          if (selectedRequest && selectedRequest._id === id) setSelectedRequest(null);
        } else {
          alert("Failed to reject destination.");
        }
      } catch (err) {
        console.error("Error rejecting:", err);
        alert("An error occurred while rejecting.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-900">Pending Requests</h1>
        <p className="text-emerald-600">Review and approve new destination submissions from agencies.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-center text-rose-600">
          {error}
        </div>
      )}

      {requests.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-100 bg-white p-12 text-center shadow-xl shadow-emerald-100/50">
          <Check size={48} className="mb-4 text-emerald-200" />
          <h3 className="text-xl font-bold text-emerald-900">All caught up!</h3>
          <p className="text-emerald-600">There are no pending requests to review.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all hover:shadow-lg hover:shadow-emerald-100/50"
              >
                {/* Clean Image Header */}
                <div className="relative h-48 w-full bg-emerald-100">
                  <img 
                    src={req.image || 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=500&q=80'} 
                    alt={req.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
                    Pending Review
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    <Building size={12} className="text-emerald-300" />
                    <span className="truncate max-w-[150px]">{req.submittedBy?.name || 'Unknown Agency'}</span>
                  </div>
                </div>

                {/* Minimal Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-500">
                    <MapPin size={12} /> {req.region}
                  </div>
                  <h4 className="mb-1 text-xl font-bold text-emerald-900">{req.name}</h4>
                  <p className="mb-4 line-clamp-2 text-sm text-emerald-600/80">{req.description}</p>
                  
                  {/* View Details Button */}
                  <div className="mt-auto pt-2">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      <Eye size={16} /> View Full Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* --- DETAILED REVIEW MODAL --- */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] bg-white p-0 shadow-2xl custom-scrollbar"
            >
              <button 
                onClick={() => setSelectedRequest(null)}
                className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
              >
                <X size={20} />
              </button>

              {/* Modal Cover Image */}
              <div className="h-64 w-full bg-emerald-100 relative">
                <img 
                  src={selectedRequest.image || 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=500&q=80'} 
                  className="h-full w-full object-cover" 
                  alt={selectedRequest.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-8">
                  <span className="mb-2 inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Pending Approval
                  </span>
                  <h2 className="text-3xl font-bold text-white">{selectedRequest.name}</h2>
                </div>
              </div>

              <div className="p-8">
                {/* General Info */}
                <div className="mb-8 flex flex-wrap gap-4 text-sm font-semibold text-emerald-700">
                  <p className="flex items-center gap-1 rounded-full bg-emerald-50 px-4 py-2">
                    <MapPin size={16} className="text-emerald-500" /> {selectedRequest.region}
                  </p>
                  <p className="flex items-center gap-1 rounded-full bg-emerald-50 px-4 py-2">
                    <AlignLeft size={16} className="text-emerald-500" /> {selectedRequest.category || 'Nature'}
                  </p>
                  <p className="flex items-center gap-1 rounded-full bg-emerald-50 px-4 py-2">
                    <Calendar size={16} className="text-emerald-500" /> Submitted {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Submitter Info */}
                <div className="mb-8 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-500">Agency / Submitter Info</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <p className="flex items-center gap-3 text-sm font-medium text-emerald-800">
                      <Building size={16} className="text-emerald-400" /> {selectedRequest.submittedBy?.name || 'Unknown Agency'}
                    </p>
                    <p className="flex items-center gap-3 text-sm font-medium text-emerald-800">
                      <Mail size={16} className="text-emerald-400" /> {selectedRequest.submittedBy?.email || 'No email provided'}
                    </p>
                    <p className="flex items-center gap-3 text-sm font-medium text-emerald-800">
                      <Phone size={16} className="text-emerald-400" /> {selectedRequest.submittedBy?.phone || 'No phone provided'}
                    </p>
                  </div>
                </div>

                {/* Description & Address */}
                <div className="mb-8 space-y-4 text-emerald-800">
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-500">Full Address</h3>
                    <p className="text-sm">{selectedRequest.address || 'No specific address provided.'}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-500">Description</h3>
                    <p className="leading-relaxed">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Map Snapshot Field */}
                <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
                  <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-100/50 px-4 py-3 text-xs font-bold text-emerald-800">
                    <Map size={14} /> Map Location ({selectedRequest.coordinates || 'No coordinates'})
                  </div>
                  <div className="h-48 w-full bg-emerald-200/20">
                    {selectedRequest.coordinates ? (
                      <iframe
                        title={`Map of ${selectedRequest.name}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        // UPDATED: Correct formatting for a Google Maps coordinate embed!
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedRequest.coordinates)}&z=14&output=embed`}
                      ></iframe>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-emerald-600">
                        Map not available
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-emerald-50">
                  <button
                    onClick={() => handleReject(selectedRequest._id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-rose-100 bg-white py-4 font-bold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                  >
                    <X size={20} /> Reject & Delete
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest._id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-200 transition-transform hover:scale-[1.02] hover:bg-emerald-700"
                  >
                    <Check size={20} /> Approve Destination
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}