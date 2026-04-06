import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, Calendar, Menu, X, LogOut, User, Inbox, BarChart3, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, logout, isTourismOffice, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home, show: true },
    
    // TOURIST ONLY: Hide from Admins and Tourism Offices
    { name: 'Explore', path: '/explore', icon: Map, show: !!user && !isAdmin && !isTourismOffice },
    { name: 'Planner', path: '/planner', icon: Calendar, show: !!user && !isAdmin && !isTourismOffice },
    
    // AGENCY ONLY
    { name: 'Destinations', path: '/destinations', icon: MapPin, show: isTourismOffice },
    
    // ADMIN ONLY
    { name: 'Requests', path: '/requests', icon: Inbox, show: isAdmin },
    
    // SHARED (ADMIN & AGENCY)
    { name: 'Analytics', path: '/analytics', icon: BarChart3, show: isAdmin || isTourismOffice },
  ];

  const visibleNavItems = navItems.filter(item => item.show);

  return (
    <div className="min-h-screen bg-emerald-50 font-sans text-emerald-900 overflow-x-hidden">
      {/* Added overflow-x-hidden to prevent horizontal scrolling issues */}
      
      {/* 1. SHARED MOBILE HEADER (Green Fade) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-emerald-500/30 bg-gradient-to-r from-emerald-800/95 to-emerald-600/95 px-6 py-4 shadow-md backdrop-blur-md md:hidden">
        <Link to="/" className="flex items-center">
          <img src="/logo-white.png" alt="LakbAi" className="h-8 object-contain drop-shadow-md" />
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* 2. DESKTOP HEADER (GUESTS ONLY) */}
      {!user && (
        <header className="sticky top-0 z-40 hidden w-full items-center justify-between border-b border-emerald-500/30 bg-gradient-to-r from-emerald-800/95 to-emerald-600/95 px-10 py-4 shadow-lg backdrop-blur-md md:flex">
          <Link to="/" className="flex items-center transition-transform hover:scale-105">
            <img src="/logo-white.png" alt="LakbAi" className="h-10 object-contain drop-shadow-md" />
          </Link>
          
          <div className="flex items-center gap-6 rounded-full border border-white/20 bg-white/10 px-8 py-2.5 shadow-inner backdrop-blur-sm">
            <nav className="flex items-center gap-6 border-r border-white/20 pr-6">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-bold uppercase tracking-widest transition-all ${
                    location.pathname === item.path 
                      ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' 
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-5">
              <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-emerald-50 transition-colors hover:text-white">
                Login
              </Link>
              <Link to="/signup" className="rounded-full bg-white px-6 py-2 text-sm font-bold uppercase tracking-widest text-emerald-800 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50 active:scale-95">
                Sign Up
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* 3. MOBILE MENU OVERLAY (Updated to Dark Green) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-emerald-800 md:hidden"
          >
            <div className="flex h-full flex-col p-8 pt-8">
              <div className="flex justify-end mb-4">
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white">
                  <X size={28} />
                </button>
              </div>

              <nav className="flex flex-col gap-4">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 rounded-2xl px-6 py-4 text-lg transition-all ${
                      location.pathname === item.path 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                        : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                    }`}
                  >
                    <item.icon size={24} />
                    <span className="font-bold">{item.name}</span>
                  </Link>
                ))}
              </nav>

              {user ? (
                <div className="mt-auto space-y-6 border-t border-emerald-700 pt-8">
                  <div className="flex items-center gap-4 px-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-white shadow-inner">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{userData?.name || user.email}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">{userData?.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-4 rounded-2xl px-6 py-4 text-rose-300 transition-all hover:bg-rose-500/20 hover:text-rose-100"
                  >
                    <LogOut size={24} />
                    <span className="font-bold text-lg">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="mt-auto space-y-4 pt-8">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full justify-center rounded-2xl bg-white py-4 font-bold text-emerald-800 shadow-lg"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full justify-center rounded-2xl border border-white/30 py-4 font-bold text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. DESKTOP SIDEBAR (LOGGED IN ONLY - Updated to Dark Green) */}
      {user && (
        <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col bg-emerald-800 p-6 shadow-2xl md:flex">
          <Link to="/" className="mb-12 flex items-center transition-transform hover:scale-105">
            <img src="/logo-white.png" alt="LakbAi" className="h-8 object-contain drop-shadow-md" />
          </Link>
          
          <nav className="flex flex-1 flex-col gap-2">
            {visibleNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  location.pathname === item.path 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                    : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4 border-t border-emerald-700 pt-6">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white shadow-inner">
                <User size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold text-white">{userData?.name || user.email}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">{userData?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-rose-300 transition-all hover:bg-rose-500/20 hover:text-rose-100"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* 5. MAIN CONTENT */}
      <main className={`pb-32 md:pb-24 transition-all duration-300 ${user ? 'md:ml-64' : 'md:ml-0'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-5xl px-6 pt-6 md:p-8 md:px-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 6. MODERN MOBILE BOTTOM NAV */}
      <div className="fixed bottom-6 left-0 z-40 flex w-full justify-center px-6 md:hidden">
        <nav className="flex w-full max-w-md items-center justify-around rounded-full border border-white/50 bg-white/80 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-lg">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center justify-center gap-2 rounded-full px-4 py-2.5 transition-all duration-300 ease-out ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <item.icon size={20} className={isActive ? "shrink-0" : ""} />
                
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    className="overflow-hidden text-[11px] font-bold uppercase tracking-wider"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );
}