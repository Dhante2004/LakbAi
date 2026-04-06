import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export default function Home() {
  const { user } = useAuth(); 

  return (
    <div className="relative z-0 space-y-12 py-6">
      
      {/* --- EDGE-TO-EDGE BACKGROUND (Fixed for Sidebar) --- */}
      <div 
        className={`absolute top-[-30px] md:top-[-60px] left-[50%] h-[110%] -translate-x-[50%] bg-cover bg-top z-[-1] transition-all duration-300 ${
          user ? 'w-[100vw] md:w-[calc(100vw-16rem)]' : 'w-[100vw]'
        }`}
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        {/* Solid green tint layer */}
        <div className="absolute inset-0 bg-emerald-700/20 mix-blend-multiply"></div>
        {/* Gradient fade to blend with the rest of the page */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/30 via-emerald-50/80 to-emerald-50"></div>
      </div>

      {/* --- HERO CONTENT --- */}
      <section className="relative flex min-h-[500px] items-center">
        <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2">
         {/* Left Content: Text and Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            // Added mobile centering classes: items-center text-center md:items-start md:text-left
            className="flex flex-col items-center text-center md:items-start md:text-left gap-8"
          >
            {/* Logo */}
            <img 
              src="/logo-green.png" 
              alt="LakbAi Logo" 
              className="w-full max-w-[19rem] object-contain drop-shadow-lg md:max-w-[25rem]" 
            />
            
            <p className="max-w-md text-xl font-bold leading-relaxed text-emerald-800 drop-shadow-sm">
              LakbAi – is an Offline-first Tourism Information System with AI-Assisted Itinerary Planner
            </p>

            {/* Added mobile centering to the button container: justify-center md:justify-start */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link 
                to="/explore" 
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                BROWSE NOW <ArrowRight size={20} />
              </Link>
              <Link 
                to="/planner" 
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/90 px-8 py-4 font-bold text-emerald-800 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95"
              >
                ITINERARY AI <Sparkles size={20} />
              </Link>
            </div>
          </motion.div>

          {/* Right Content: INTERACTIVE HOVER ILLUSTRATION */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden w-full items-center justify-center md:flex"
          >
            {/* The 'group' class here acts as a trigger for hover states inside it */}
            <div className="relative w-full max-w-[90%] cursor-pointer lg:max-w-[85%] group perspective-1000">
              
              {/* Image 1: The Original Illustration (Fades out and scales down on hover) */}
              <img 
                src="/hero-illustration.png" 
                alt="Travel Planning" 
                className="relative z-10 h-auto w-full rounded-3xl object-contain drop-shadow-2xl transition-all duration-700 ease-in-out group-hover:scale-95 group-hover:opacity-0 group-hover:-rotate-3" 
              />

              <img 
                src="/hover.png" 
                alt="Travel Planning Alternate" 
                className="absolute inset-0 z-20 h-full w-full rounded-3xl object-contain drop-shadow-2xl opacity-0 scale-110 rotate-3 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100 group-hover:rotate-0" 
              />
              
            </div>
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
                src={`/${region.toLowerCase()}.jpg`} 
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