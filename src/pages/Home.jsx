import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // IMPORTED THIS

export default function Home() {
  const { user } = useAuth(); // GET USER STATE

  return (
    <div className="relative z-0 space-y-12 py-6">
      
      {/* --- EDGE-TO-EDGE BACKGROUND (Fixed for Sidebar) --- */}
      <div 
        className={`absolute top-[-30px] md:top-[-60px] left-[50%] h-[110%] -translate-x-[50%] bg-cover bg-top z-[-1] transition-all duration-300 ${
          user ? 'w-[100vw] md:w-[calc(100vw-16rem)]' : 'w-[100vw]'
        }`}
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/60 to-emerald-50"></div>
      </div>

      {/* --- HERO CONTENT --- */}
      <section className="relative flex min-h-[500px] items-center">
        <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2">
         {/* Left Content: Text and Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            {/* Logo (Adjusted size down by 20%: from max-w-[24rem/32rem] down to max-w-[19rem/25rem]) */}
            <img 
              src="/logo-green.png" 
              alt="LakbAi Logo" 
              className="w-full max-w-[19rem] object-contain drop-shadow-lg md:max-w-[25rem]" 
            />
            
            <p className="max-w-md text-xl font-bold leading-relaxed text-emerald-700 drop-shadow-md">
              LakbAi – is an Offline-first Tourism Information System with AI-Assisted Itinerary Planner
            </p>

            <div className="flex flex-wrap gap-4">
              <Link 
                to="/explore" 
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                BROWSE NOW <ArrowRight size={20} />
              </Link>
              <Link 
                to="/planner" 
                className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/95 px-8 py-4 font-bold text-emerald-800 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95"
              >
                ITINERARY AI <Sparkles size={20} />
              </Link>
            </div>
          </motion.div>

          {/* Right Content: Responsive Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden w-full items-center justify-center md:flex"
          >
            <img 
              src="/hero-illustration.png" 
              alt="Travel Planning" 
              className="h-auto w-full max-w-[90%] rounded-3xl object-contain drop-shadow-2xl lg:max-w-[85%]" 
            />
          </motion.div>
        </div>
      </section>

      {/* --- QUICK STATS/FEATURES --- */}
      <section className="grid gap-6 pt-8 md:grid-cols-3">
        {[
          { icon: Globe, title: "Offline Access", desc: "Access maps and guides without data." },
          { icon: Sparkles, title: "AI Powered", desc: "Personalized itineraries in seconds." },
          { icon: MapPin, title: "Region Aware", desc: "Optimized data for Luzon, Visayas, Mindanao." }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-sm backdrop-blur-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <feature.icon size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-emerald-900">{feature.title}</h3>
            <p className="text-sm font-medium text-emerald-700">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* --- FEATURED DESTINATIONS --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-900">Popular Regions</h2>
          <Link to="/explore" className="text-sm font-bold text-emerald-700 hover:text-emerald-600 hover:underline">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {['Luzon', 'Visayas', 'Mindanao'].map((region, i) => (
            <motion.div 
              key={region}
              whileHover={{ y: -5 }}
              className="group relative h-48 overflow-hidden rounded-2xl bg-emerald-200 shadow-md"
            >
              <img 
                src={`/${region.toLowerCase()}.jpeg`} 
                alt={region}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white">{region}</h3>
                <p className="text-xs font-medium text-emerald-200">Explore destinations</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
    </div>
  );
}