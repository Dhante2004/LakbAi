import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, Sparkles, MapPin } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
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
      <div className="absolute top-0 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-400/20 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex w-full max-w-5xl flex-col md:flex-row overflow-hidden rounded-[2.5rem] bg-emerald-800 shadow-2xl shadow-emerald-900/40"
      >
        {/* --- LEFT COLUMN: Branding & Welcome --- */}
        <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-emerald-900 p-12 text-white md:flex md:w-5/12 lg:w-1/2">
          {/* Faint background image overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
            style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          ></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-emerald-950 shadow-lg">
              <MapPin size={24} strokeWidth={2.5} />
            </div>
            <Link to="/" className="flex items-center">
                      <img src="/logo-white.png" alt="LakbAi" className="h-8 object-contain drop-shadow-md" />
                    </Link>
          </div>

          <div className="relative z-10 mt-12 mb-8">
            <h1 className="text-4xl font-extrabold leading-tight text-white lg:text-5xl">
              Welcome <br/>
              <span className="text-emerald-400">Back.</span>
            </h1>
            <p className="mt-6 text-lg font-medium leading-relaxed text-emerald-100/90">
              Log in to access your offline itineraries, discover approved destinations, and explore the Philippines intelligently.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <Sparkles size={16} /> AI-Powered Travel Companion
          </div>
        </div>

        {/* --- RIGHT COLUMN: Login Form --- */}
        <div className="flex w-full flex-col justify-center p-8 md:w-7/12 md:p-12 lg:p-16 lg:w-1/2">
          <div className="mb-8 md:hidden">
            <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
            <p className="text-emerald-200">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="ml-1 text-sm font-bold text-emerald-100">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-600">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-emerald-50 py-4 pl-11 pr-4 text-emerald-950 transition-all placeholder:text-emerald-600/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-emerald-100">Password</label>
                <a href="#" className="text-xs font-bold text-emerald-400 hover:text-emerald-300"></a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-600">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-emerald-50 py-4 pl-11 pr-12 text-emerald-950 transition-all placeholder:text-emerald-600/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-emerald-600 hover:text-emerald-800 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm font-medium text-rose-200 text-center">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button 
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-4 font-extrabold text-emerald-950 shadow-lg shadow-emerald-950/40 transition-all hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-xl hover:shadow-emerald-950/50 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Login to Account <LogIn size={18} className="transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-emerald-200">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}