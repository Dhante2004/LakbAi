import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, MapPin, CalendarDays, Loader2, AlertCircle } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export default function Analytics() {
  const { userData } = useAuth();
  
  // --- STATE FOR REAL DATA ---
  const [analyticsData, setAnalyticsData] = useState({
    monthlyVisits: [],
    topDestinations: [],
    stats: {
      totalVisitors: '0',
      avgDaily: '0',
      activeDestinations: '0',
      peakSeason: 'N/A'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Pass the agency's region as a query parameter so the backend filters it
        const regionQuery = userData?.region ? `?region=${encodeURIComponent(userData.region)}` : '';
        
        // Ensure you have an authentication token if your API is protected
        const token = localStorage.getItem('token'); 
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Replace this URL with your actual backend endpoint
        const response = await fetch(`/api/analytics${regionQuery}`, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to load analytics data');
        }
        
        const result = await response.json();
        setAnalyticsData(result);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchAnalytics();
    }
  }, [userData]);

  // Custom Tooltip for Recharts to match our Tailwind theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-emerald-100 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
          <p className="mb-1 font-bold text-emerald-900">{label}</p>
          <p className="text-sm font-medium text-emerald-600">
            {payload[0].value.toLocaleString()} visitors
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <p className="font-medium text-emerald-700">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center">
        <AlertCircle size={48} className="text-rose-400" />
        <h2 className="text-xl font-bold text-rose-900">Oops! Something went wrong</h2>
        <p className="text-rose-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-rose-600 px-6 py-2 font-bold text-white shadow-lg shadow-rose-200 transition-transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-900">Analytics Dashboard</h1>
        <p className="text-emerald-600">
          Viewing tourism performance for <span className="font-bold text-emerald-800">{userData?.region || 'your region'}</span>
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Users} 
          label="Total Visitors (YTD)" 
          value={analyticsData.stats.totalVisitors} 
          trend="+12.5%" 
          delay={0} 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Avg. Daily Visitors" 
          value={analyticsData.stats.avgDaily} 
          trend="+5.2%" 
          delay={0.1} 
        />
        <StatCard 
          icon={MapPin} 
          label="Active Destinations" 
          value={analyticsData.stats.activeDestinations} 
          trend="No change" 
          trendNeutral 
          delay={0.2} 
        />
        <StatCard 
          icon={CalendarDays} 
          label="Peak Season" 
          value={analyticsData.stats.peakSeason} 
          trend="Upcoming" 
          trendNeutral 
          delay={0.3} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Chart 1: Tourist Visits Over Time */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/50"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-emerald-900">Tourist Visits (Current Year)</h2>
            <p className="text-sm text-emerald-600">Monthly foot traffic across all destinations.</p>
          </div>
          
          <div className="h-[300px] w-full">
            {analyticsData.monthlyVisits.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyVisits} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#065f46', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#065f46', fontSize: 12 }} 
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#059669" 
                    strokeWidth={3}
                    dot={{ fill: '#059669', strokeWidth: 2, r: 4, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-emerald-400 font-medium">
                No visit data available yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Chart 2: Top Destinations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/50"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-emerald-900">Top Destinations</h2>
            <p className="text-sm text-emerald-600">Most visited locations in your region.</p>
          </div>
          
          <div className="h-[300px] w-full">
            {analyticsData.topDestinations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.topDestinations} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#065f46', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#065f46', fontSize: 12 }} 
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ecfdf5' }} />
                  <Bar 
                    dataKey="visitors" 
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-emerald-400 font-medium">
                No destination data available yet
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// Helper component for the statistic cards at the top
function StatCard({ icon: Icon, label, value, trend, trendNeutral, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-white p-5 shadow-lg shadow-emerald-100/40"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon size={20} />
        </div>
        <span className={`text-xs font-bold ${trendNeutral ? 'text-emerald-500' : 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-emerald-900">{value}</h3>
        <p className="text-sm font-medium text-emerald-600">{label}</p>
      </div>
    </motion.div>
  );
}