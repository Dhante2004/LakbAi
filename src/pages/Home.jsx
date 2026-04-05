import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-800 p-8 text-white md:p-16">
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold leading-tight md:text-6xl"
          >
            Explore the Philippines, <br />
            <span className="text-emerald-300">Intelligently.</span>
          </motion.h1>
          <p className="text-lg text-emerald-100/90">
            Your offline-first travel companion. Discover hidden gems, 
            generate AI itineraries, and explore even without internet.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/explore" className="flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-emerald-800 transition-transform hover:scale-105">
              Start Exploring <ArrowRight size={18} />
            </Link>
            <Link to="/planner" className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-700/50 px-8 py-4 font-bold text-white backdrop-blur-sm transition-transform hover:scale-105">
              AI Planner <Sparkles size={18} />
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
      </section>

      {/* Quick Stats/Features */}
      <section className="grid gap-6 md:grid-cols-3">
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
            className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <feature.icon size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-emerald-900">{feature.title}</h3>
            <p className="text-sm text-emerald-600/80">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Featured Destinations Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-900">Popular Regions</h2>
          <Link to="/explore" className="text-sm font-semibold text-emerald-600 hover:underline">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {['Luzon', 'Visayas', 'Mindanao'].map((region, i) => (
            <motion.div 
              key={region}
              whileHover={{ y: -5 }}
              className="group relative h-48 overflow-hidden rounded-2xl bg-emerald-200"
            >
              <img 
                src={`https://picsum.photos/seed/${region}/600/400`} 
                alt={region}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white">{region}</h3>
                <p className="text-xs text-emerald-200">Explore destinations</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
