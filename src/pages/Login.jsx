import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react'; // <-- FIXED IMPORT HERE
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

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
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 relative">
      
      {/* Decorative background blobs for modern feel */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-300/20 blur-[80px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl"
      >
        <div className="mb-8 text-center space-y-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/50 shadow-inner">
            <LogIn className="text-emerald-700" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950">Welcome Back</h1>
          <p className="text-sm font-medium text-emerald-600/80">Enter your details to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-emerald-800 ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-500">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 py-3.5 pl-11 pr-4 text-emerald-900 transition-all placeholder:text-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-emerald-800 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-500">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 py-3.5 pl-11 pr-12 text-emerald-900 transition-all placeholder:text-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="••••••••"
              />
              {/* Eye Toggle Button */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-emerald-400 hover:text-emerald-600 transition-colors focus:outline-none"
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
                className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-600 border border-rose-100"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button 
            disabled={loading}
            className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span className="flex items-center gap-2">
                Login <LogIn size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-emerald-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-emerald-700 hover:text-emerald-500 hover:underline transition-colors">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}