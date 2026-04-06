import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Mail, Lock, User, Loader2, Globe, Phone, MapPin, Sparkles } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('tourist');
  const [region, setRegion] = useState('');
  const [contactNumber, setContactNumber] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup({ 
        name, 
        email, 
        password, 
        role, 
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
    <div className="flex min-h-[80vh] items-center justify-center p-4 py-12 relative overflow-hidden">
      
      {/* Background ambient glows */}
      <div className="absolute top-0 right-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />
      <div className="absolute bottom-0 left-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-400/20 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex w-full max-w-5xl flex-col md:flex-row-reverse overflow-hidden rounded-[2.5rem] bg-emerald-800 shadow-2xl shadow-emerald-900/40"
      >
        {/* --- RIGHT COLUMN: Branding & Welcome (Reversed for visual balance) --- */}
        <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-emerald-900 p-12 text-white md:flex md:w-5/12 lg:w-1/2">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
            style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          ></div>
          
          <div className="relative z-10 flex items-center justify-end gap-3">
            <Link to="/" className="flex items-center">
                      <img src="/logo-white.png" alt="LakbAi" className="h-8 object-contain drop-shadow-md" />
                    </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-emerald-950 shadow-lg">
              <MapPin size={24} strokeWidth={2.5} />
            </div>
          </div>

          <div className="relative z-10 mt-12 mb-8 text-right">
            <h1 className="text-4xl font-extrabold leading-tight text-white lg:text-5xl">
              Join the <br/>
              <span className="text-emerald-400">Journey.</span>
            </h1>
            <p className="mt-6 text-lg font-medium leading-relaxed text-emerald-100/90">
              Create an account to save your AI-generated itineraries, or register as a Tourism Agency to manage local destinations.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-end gap-2 text-sm font-semibold text-emerald-400">
            <Sparkles size={16} /> Fast, Free, and Offline-Ready
          </div>
        </div>

        {/* --- LEFT COLUMN: Signup Form --- */}
        <div className="flex w-full flex-col justify-center p-8 md:w-7/12 md:p-12 lg:p-16 lg:w-1/2">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
            <p className="text-emerald-200 mt-1">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            
            {/* GRID 1: Name & Email side-by-side on larger screens */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold text-emerald-100">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-600">
                    <User size={16} />
                  </div>
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border-0 bg-emerald-50 py-3.5 pl-10 pr-4 text-emerald-950 transition-all placeholder:text-emerald-600/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold text-emerald-100">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-600">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border-0 bg-emerald-50 py-3.5 pl-10 pr-4 text-emerald-950 transition-all placeholder:text-emerald-600/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* GRID 2: Password & Role */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold text-emerald-100">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-600">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border-0 bg-emerald-50 py-3.5 pl-10 pr-4 text-emerald-950 transition-all placeholder:text-emerald-600/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold text-emerald-100">Account Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-600">
                    <Globe size={16} />
                  </div>
                  <select 
                    value={role} onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-2xl border-0 bg-emerald-50 py-3.5 pl-10 pr-4 text-emerald-950 transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                  >
                    <option value="tourist">Tourist</option>
                    <option value="tourism_office">Tourism Agency</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Agency Details Section */}
            <AnimatePresence>
              {role === 'tourism_office' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mt-2 space-y-4 rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-5 shadow-inner">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Agency Details
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="ml-1 text-xs font-bold text-emerald-100">Assigned Region</label>
                        <select 
                          required={role === 'tourism_office'} value={region} onChange={(e) => setRegion(e.target.value)}
                          className="w-full rounded-xl border-0 bg-emerald-50 py-3 px-4 text-sm text-emerald-950 transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                        >
                          <option value="">Select Region...</option>
                          <option value="Luzon">Luzon</option>
                          <option value="Visayas">Visayas</option>
                          <option value="Mindanao">Mindanao</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="ml-1 text-xs font-bold text-emerald-100">Contact Number</label>
                        <input 
                          type="tel" required={role === 'tourism_office'} value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}
                          className="w-full rounded-xl border-0 bg-emerald-50 py-3 px-4 text-sm text-emerald-950 placeholder:text-emerald-600/50 transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                          placeholder="+63 900 000 0000"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm font-medium text-rose-200 text-center"
              >
                {error}
              </motion.div>
            )}

            <button 
              disabled={loading}
              className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-4 font-extrabold text-emerald-950 shadow-lg shadow-emerald-950/40 transition-all hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-xl hover:shadow-emerald-950/50 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={18} className="transition-transform group-hover:scale-110" />}
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-emerald-200">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}