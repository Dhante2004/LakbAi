import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Mail, Lock, User, Loader2, Globe, Phone } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('tourist');
  const [region, setRegion] = useState('');
  const [contactNumber, setContactNumber] = useState(''); // Added state for contact number
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Pass the new contact number to your signup function
      await signup({ 
        name, 
        email, 
        password, 
        role, 
        // Only submit these fields if the role is tourism_office
        region: role === 'tourism_office' ? region : '',
        contactNumber: role === 'tourism_office' ? contactNumber : ''
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/50"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-900">Join LakbAi</h1>
          <p className="text-emerald-600">Create your tourism account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <User size={16} /> Full Name
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <Mail size={16} /> Email
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <Lock size={16} /> Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <Globe size={16} /> Account Type
            </label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none transition-colors"
            >
              <option value="tourist">Tourist</option>
              <option value="tourism_office">Tourism Office / Agency</option>
            </select>
          </div>

          {/* Smooth expanding section for Agency Details */}
          <AnimatePresence>
            {role === 'tourism_office' && (
              <motion.div 
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="mt-4 space-y-5 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-200/60 pb-2">
                    Agency Details
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                      <MapPin size={16} /> Assigned Region
                    </label>
                    <select 
                      required={role === 'tourism_office'}
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select Region</option>
                      <option value="Luzon">Luzon</option>
                      <option value="Visayas">Visayas</option>
                      <option value="Mindanao">Mindanao</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                      <Phone size={16} /> Contact Number
                    </label>
                    <input 
                      type="tel" 
                      required={role === 'tourism_office'}
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="+63 900 000 0000"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="text-sm font-medium text-rose-500">{error}</p>
          )}

          <button 
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 py-4 font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />}
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-emerald-600">
          Already have an account? <Link to="/login" className="font-bold text-emerald-800 hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

function MapPin({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  );
}