import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Users, MapPin, AlertCircle, Database, ShieldCheck, Plus, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { userData, isAdmin, isTourismOffice } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pendingDestinations, setPendingDestinations] = useState([]);
  const [newDest, setNewDest] = useState({
    name: '',
    region: 'Luzon',
    description: '',
    image: '',
    rating: 4.5
  });

  const stats = [
    { label: 'Total Visitors', value: '12.4k', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Top Destination', value: 'El Nido', icon: MapPin, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'System Health', value: 'Optimal', icon: ShieldCheck, color: 'bg-purple-50 text-purple-600' },
    { label: 'Shards Active', value: '3 (Region)', icon: Database, color: 'bg-orange-50 text-orange-600' },
  ];

  // 1. Fetch pending destinations when the component loads (if admin)
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

    if (isAdmin) {
      fetchPendingDestinations();
    }
  }, [isAdmin]);

  const handleAddDestination = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/destinations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDest)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add destination');
      }

      setShowForm(false);
      setNewDest({ name: '', region: 'Luzon', description: '', image: '', rating: 4.5 });
      
      // 2. Alert changes based on role
      alert(isAdmin ? 'Destination added and approved!' : 'Submitted! Waiting for Admin approval.');
      if (isAdmin) window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert('Error adding destination: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Admin Approval Function
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/destinations/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingDestinations(prev => prev.filter(d => d._id !== id));
      alert('Destination Approved!');
    } catch (err) {
      alert('Failed to approve');
    }
  };

  // 4. Admin Rejection Function
  const handleReject = async (id) => {
    if(!window.confirm("Are you sure you want to reject and delete this submission?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/destinations/${id}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingDestinations(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      alert('Failed to reject');
    }
  };

  if (!isAdmin && !isTourismOffice) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <ShieldCheck size={64} className="text-emerald-200" />
        <h2 className="text-2xl font-bold text-emerald-900">Access Restricted</h2>
        <p className="max-w-md text-emerald-600">
          The dashboard is reserved for Tourism Office and Admin users. 
          Please use the Explore or Planner tabs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-emerald-900">Tourism Dashboard</h1>
          <p className="text-emerald-600">Regional data management & analytics.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-2 font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:scale-105"
          >
            <Plus size={18} />
            Add Destination
          </button>
          <div className="hidden items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700 md:flex">
            <AlertCircle size={14} />
            {userData?.role?.toUpperCase()} Mode Active
          </div>
        </div>
      </header>

      {showForm && (
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm"
        >
          <h2 className="mb-6 text-xl font-bold text-emerald-900">Add New Destination</h2>
          <form onSubmit={handleAddDestination} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-800">Name</label>
              <input 
                type="text" required
                value={newDest.name}
                onChange={e => setNewDest({...newDest, name: e.target.value})}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-800">Region</label>
              <select 
                value={newDest.region}
                onChange={e => setNewDest({...newDest, region: e.target.value})}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
              >
                <option>Luzon</option>
                <option>Visayas</option>
                <option>Mindanao</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-emerald-800">Description</label>
              <textarea 
                required
                value={newDest.description}
                onChange={e => setNewDest({...newDest, description: e.target.value})}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-800">Image URL</label>
              <input 
                type="url" required
                value={newDest.image}
                onChange={e => setNewDest({...newDest, image: e.target.value})}
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button 
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                {loading ? 'Adding...' : 'Save Destination'}
              </button>
            </div>
          </form>
        </motion.section>
      )}

      {/* Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-emerald-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-emerald-900">{stat.value}</h3>
          </motion.div>
        ))}
      </section>

      {/* Main Panels */}
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">

          {/* 5. NEW: Pending Approvals UI (Visible only to Admins) */}
          {isAdmin && pendingDestinations.length > 0 && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-amber-900">
                <AlertCircle className="text-amber-600" /> Pending Approvals
              </h2>
              <div className="space-y-4">
                {pendingDestinations.map(dest => (
                  <div key={dest._id} className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-bold text-amber-900">{dest.name}</h3>
                      <p className="text-xs text-amber-600">Region: {dest.region}</p>
                    </div>
                    <div className="mt-4 flex gap-2 sm:mt-0">
                      <button 
                        onClick={() => handleReject(dest._id)}
                        className="flex items-center gap-1 rounded-lg bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-200"
                      >
                        <X size={14} /> Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(dest._id)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <Check size={14} /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sharding Info */}
          <div className="rounded-3xl bg-emerald-900 p-8 text-white">
            <h2 className="mb-4 text-xl font-bold">MongoDB Atlas Sharding Configuration</h2>
            <div className="space-y-4 font-mono text-sm text-emerald-200">
              <div className="rounded-lg bg-black/20 p-4">
                <p className="text-emerald-400">// Shard Key: {'{ region: 1 }'}</p>
                <p>sh.shardCollection("tourism.destinations", {'{ "region": 1 }'})</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-emerald-700 p-4">
                  <p className="font-bold text-white">Shard A</p>
                  <p className="text-xs">Region: Luzon</p>
                </div>
                <div className="rounded-lg border border-emerald-700 p-4">
                  <p className="font-bold text-white">Shard B</p>
                  <p className="text-xs">Region: Visayas</p>
                </div>
                <div className="rounded-lg border border-emerald-700 p-4">
                  <p className="font-bold text-white">Shard C</p>
                  <p className="text-xs">Region: Mindanao</p>
                </div>
              </div>
              <p className="text-xs italic text-emerald-400">
                Data is automatically partitioned across clusters based on geographic region to ensure low latency and high scalability.
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-emerald-900">Recent Activity</h2>
            <div className="space-y-6">
              {[
                { user: 'Tourist_421', action: 'Generated Itinerary', time: '2 mins ago', target: 'Siargao' },
                { user: 'Admin_Juan', action: 'Updated Destination', time: '15 mins ago', target: 'Chocolate Hills' },
                { user: 'Tourist_882', action: 'Saved Favorite', time: '1 hour ago', target: 'El Nido' },
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between border-b border-emerald-50 pb-4 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900">{act.user}</p>
                      <p className="text-xs text-emerald-500">{act.action} - <span className="font-medium text-emerald-700">{act.target}</span></p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sidebar Panel */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-emerald-900">System Logs</h2>
            <div className="space-y-3">
              {[
                { type: 'Sync', msg: 'Background sync completed', status: 'success' },
                { type: 'DB', msg: 'Shard B rebalancing', status: 'info' },
                { type: 'Auth', msg: 'New officer registered', status: 'success' },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-3 text-xs">
                  <div className={`mt-1 h-2 w-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="font-bold text-emerald-800">{log.type}</p>
                    <p className="text-emerald-600/80">{log.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-emerald-600 p-8 text-white shadow-lg shadow-emerald-100">
            <BarChart3 size={32} className="mb-4 opacity-50" />
            <h3 className="mb-2 text-lg font-bold">Analytics Pro</h3>
            <p className="mb-6 text-sm text-emerald-100">Unlock deeper insights into tourist behavior and regional trends.</p>
            <button className="w-full rounded-xl bg-white py-3 text-sm font-bold text-emerald-600">Upgrade Now</button>
          </div>
        </section>
      </div>
    </div>
  );
}