import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Phone, MapPin, Building, Map, AlignLeft } from 'lucide-react';

export default function Requests() {
  // --- MOCK DATA ---
  // In a real app, this would be fetched from your backend
  const [requests, setRequests] = useState([
    {
      id: 1,
      agencyName: 'Palawan Tourism Office',
      agencyPhone: '+63 917 123 4567', // Added phone number
      destinationTitle: 'Hidden Lagoon',
      category: 'Nature',
      location: 'Palawan',
      address: 'Brgy. Buena Suerte, El Nido, Palawan',
      coordinates: '11.1965, 119.3245', // Used for map snapshot
      description: 'A beautiful secret lagoon surrounded by limestone cliffs. Requesting to add this to the official tourist map.',
      status: 'pending',
      dateSubmitted: '2026-04-05'
    },
    {
      id: 2,
      agencyName: 'Cebu City Tourism',
      agencyPhone: '+63 920 987 6543', // Added phone number
      destinationTitle: 'Magellan\'s Cross Pavilion',
      category: 'Historical',
      location: 'Cebu',
      address: 'P. Burgos St, Cebu City, Cebu',
      coordinates: '10.2936, 123.9019', // Used for map snapshot
      description: 'Historical site update with new operating hours and guidelines.',
      status: 'pending',
      dateSubmitted: '2026-04-04'
    }
  ]);

  const handleApprove = (id) => {
    // TODO: Connect to backend to mark as approved
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const handleReject = (id) => {
    // TODO: Connect to backend to mark as rejected/deleted
    if (window.confirm('Are you sure you want to reject this request?')) {
      setRequests((prev) => prev.filter((req) => req.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-900">Pending Requests</h1>
        <p className="text-emerald-600">Review and approve new destination submissions from agencies.</p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-100 bg-white p-12 text-center shadow-xl shadow-emerald-100/50">
          <Check size={48} className="mb-4 text-emerald-200" />
          <h3 className="text-xl font-bold text-emerald-900">All caught up!</h3>
          <p className="text-emerald-600">There are no pending requests to review.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100/50"
              >
                {/* Header: Agency Info */}
                <div className="border-b border-emerald-100 bg-emerald-50/50 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 font-bold text-emerald-900">
                        <Building size={18} className="text-emerald-600" />
                        {req.agencyName}
                      </h3>
                      {/* New Phone Number Field */}
                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <Phone size={14} className="text-emerald-500" />
                        {req.agencyPhone}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Body: Destination Info & Map Snapshot */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-emerald-900">{req.destinationTitle}</h4>
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        {req.category}
                      </span>
                    </div>
                  </div>

                  <div className="mb-5 space-y-3">
                    <p className="flex items-start gap-2 text-sm text-emerald-700">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span>
                        <span className="block font-bold">{req.location}</span>
                        {req.address}
                      </span>
                    </p>
                    <p className="flex items-start gap-2 text-sm text-emerald-700">
                      <AlignLeft size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                      {req.description}
                    </p>
                  </div>

                  {/* New Map Snapshot Field */}
                  <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
                    <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-100/50 px-4 py-2 text-xs font-bold text-emerald-800">
                      <Map size={14} /> Map Snapshot ({req.coordinates})
                    </div>
                    <div className="h-40 w-full bg-emerald-200/20">
                      <iframe
                        title={`Map of ${req.destinationTitle}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        // Embedding Google Maps via coordinates
                        src={`https://maps.google.com/maps?q=${req.coordinates}&z=14&output=embed`}
                      ></iframe>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto flex gap-3 pt-4 border-t border-emerald-50">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 font-bold text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700"
                    >
                      <X size={18} /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition-transform hover:scale-[1.02] hover:bg-emerald-700"
                    >
                      <Check size={18} /> Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}