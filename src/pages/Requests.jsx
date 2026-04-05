import React, { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, User, MapPin, Eye, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Requests() {
  const { isAdmin } = useAuth();
  const [pendingDestinations, setPendingDestinations] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchPendingDestinations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/destinations/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPendingDestinations(data);
        }
      } catch (err) {
        console.error('Failed to fetch pending destinations', err);
      }
    };

    if (isAdmin) fetchPendingDestinations();
  }, [isAdmin]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/destinations/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingDestinations(prev => prev.filter(d => d._id !== id));
      setSelectedRequest(null); // Close modal if open
      alert('Destination Approved!');
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Are you sure you want to reject this submission?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/destinations/${id}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingDestinations(prev => prev.filter(d => d._id !== id));
      setSelectedRequest(null); // Close modal if open
    } catch (err) {
      alert('Failed to reject');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <ShieldCheck size={64} className="text-emerald-200" />
        <h2 className="text-2xl font-bold text-emerald-900">Access Restricted</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-emerald-900">Pending Requests</h1>
        <p className="text-emerald-600">Review and approve destinations submitted by the Tourism Office.</p>
      </header>
      
      {pendingDestinations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 p-12 text-center text-emerald-500">
          No pending approvals at this time.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingDestinations.map(dest => (
            <div key={dest._id} className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500">
                  <MapPin size={14} /> {dest.region}
                </div>
                <h3 className="mb-1 text-xl font-bold text-emerald-900">{dest.name}</h3>
                <div className="mb-4 flex items-center gap-2 text-sm text-emerald-600/80">
                  <User size={14} /> 
                  Requested by: <span className="font-medium text-emerald-700">{dest.submittedBy?.name || 'Unknown User'}</span>
                </div>
                <p className="line-clamp-2 text-sm text-gray-600">{dest.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-emerald-50 pt-4">
                <button 
                  onClick={() => setSelectedRequest(dest)}
                  className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-800 hover:underline"
                >
                  <Eye size={16} /> View Details
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleReject(dest._id)} className="rounded-full bg-rose-50 p-2 text-rose-600 hover:bg-rose-100">
                    <X size={16} />
                  </button>
                  <button onClick={() => handleApprove(dest._id)} className="rounded-full bg-emerald-100 p-2 text-emerald-700 hover:bg-emerald-200">
                    <Check size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Details */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-900/40 p-4 backdrop-blur-sm md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-emerald-100 p-6">
                <h2 className="text-xl font-bold text-emerald-900">Review Submission</h2>
                <button 
                  onClick={() => setSelectedRequest(null)} 
                  className="rounded-full bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 hover:text-rose-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-6">
                <img 
                  src={selectedRequest.image} 
                  alt={selectedRequest.name} 
                  className="mb-6 h-64 w-full rounded-2xl object-cover shadow-sm"
                  onError={(e) => { e.target.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Image+Load+Failed' }}
                />
                
                <div className="mb-6 grid gap-4 rounded-2xl bg-emerald-50 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase">Destination Name</p>
                    <p className="text-lg font-bold text-emerald-900">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase">Region</p>
                    <p className="flex items-center gap-1 font-medium text-emerald-900">
                      <MapPin size={16} className="text-emerald-500"/> {selectedRequest.region}
                    </p>
                  </div>
                  <div className="sm:col-span-2 border-t border-emerald-200/50 pt-4 mt-2">
                    <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Submitter Details</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900">{selectedRequest.submittedBy?.name || 'Unknown Tourism Officer'}</p>
                        <p className="text-sm text-emerald-600">{selectedRequest.submittedBy?.email || 'No email provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-emerald-800">Description provided:</p>
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedRequest.description}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-emerald-100 bg-emerald-50/50 p-6">
                <button 
                  onClick={() => handleReject(selectedRequest._id)}
                  className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-rose-600 shadow-sm transition-all hover:bg-rose-50 hover:shadow-md"
                >
                  <X size={18} /> Reject Submission
                </button>
                <button 
                  onClick={() => handleApprove(selectedRequest._id)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-200"
                >
                  <Check size={18} /> Approve & Publish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}