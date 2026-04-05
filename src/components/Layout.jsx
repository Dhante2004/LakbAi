import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// Added Inbox and BarChart3 for the new Admin links
import { Home, Map, Calendar, Settings, Menu, X, LogOut, User, Inbox, BarChart3 } from 'lucide-react';
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

  // Dynamically render navigation items based on user role
  const navItems = [
    { name: 'Home', path: '/', icon: Home, show: true },
    
    // Hide Explore and Planner from Admins, show to everyone else logged in
    { name: 'Explore', path: '/explore', icon: Map, show: !!user && !isAdmin },
    { name: 'Planner', path: '/planner', icon: Calendar, show: !!user && !isAdmin },
    
    // Dashboard is now exclusively for the Tourism Office
    { name: 'Dashboard', path: '/dashboard', icon: Settings, show: isTourismOffice },
    
    // NEW: Admin-exclusive routes
    { name: 'Requests', path: '/requests', icon: Inbox, show: isAdmin },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, show: isAdmin },
  ];

  const visibleNavItems = navItems.filter(item => item.show);

  return (
    <div className="min-h-screen bg-emerald-50 font-sans text-emerald-900">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-md md:hidden">
        <Link to="/" className="text-xl font-bold tracking-tight text-emerald-800">LakbAi</Link>
        <div className="flex items-center gap-4">
          {user && (
            <button onClick={handleLogout} className="p-2 text-rose-500">
              <LogOut size={20} />
            </button>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-emerald-800">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
          >
            <div className="flex h-full flex-col p-8 pt-24">
              <nav className="flex flex-col gap-4">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 rounded-2xl px-6 py-4 text-lg transition-all ${
                      location.pathname === item.path 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <item.icon size={24} />
                    <span className="font-bold">{item.name}</span>
                  </Link>
                ))}
              </nav>

              {user ? (
                <div className="mt-auto space-y-6 border-t border-emerald-50 pt-8">
                  <div className="flex items-center gap-4 px-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-900">{userData?.name || user.email}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">{userData?.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-4 rounded-2xl px-6 py-4 text-rose-600 transition-all hover:bg-rose-50"
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
                    className="flex w-full justify-center rounded-2xl bg-emerald-800 py-4 font-bold text-white shadow-lg shadow-emerald-100"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full justify-center rounded-2xl border border-emerald-100 py-4 font-bold text-emerald-800"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-emerald-100 bg-white p-6 md:flex">
        <Link to="/" className="mb-12 text-2xl font-bold tracking-tight text-emerald-800">LakbAi</Link>
        
        <nav className="flex flex-1 flex-col gap-2">
          {visibleNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                location.pathname === item.path 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="mt-auto space-y-4 border-t border-emerald-50 pt-6">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <User size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold text-emerald-900">{userData?.name || user.email}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">{userData?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-rose-600 transition-all hover:bg-rose-50"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="mt-auto space-y-2 pt-6">
            <Link to="/login" className="flex w-full justify-center rounded-xl bg-emerald-800 py-3 font-bold text-white shadow-lg shadow-emerald-100">
              Login
            </Link>
            <Link to="/signup" className="flex w-full justify-center rounded-xl border border-emerald-100 py-3 font-bold text-emerald-800">
              Sign Up
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="pb-24 md:ml-64 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-5xl px-6 pt-6 md:px-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-emerald-100 bg-white/90 px-4 py-3 backdrop-blur-md md:hidden">
        {visibleNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${
              location.pathname === item.path ? 'text-emerald-600' : 'text-emerald-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}