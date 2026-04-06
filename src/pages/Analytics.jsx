import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, MapPin, CalendarDays, Loader2, AlertCircle, FileText, Globe, Clock } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7'];

export default function Analytics() {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin';
  
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); 
        const response = await fetch('/api/analytics', { 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load real DB data.');
        const result = await response.json();
        setAnalyticsData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userData) fetchAnalytics();
  }, [userData]);

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-emerald-100 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
          <p className="mb-1 font-bold text-emerald-900">{label}</p>
          <p className="text-sm font-medium text-emerald-600">
            {payload[0].value.toLocaleString()} trips planned
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-emerald-100 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
          <p className="mb-1 font-bold text-emerald-900">{payload[0].name}</p>
          <p className="text-sm font-medium text-emerald-600">
            {payload[0].value} Destinations
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading || !analyticsData) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <p className="font-medium text-emerald-700">Crunching real database numbers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center">
        <AlertCircle size={48} className="text-rose-400" />
        <h2 className="text-xl font-bold text-rose-900">Connection Error</h2>
        <p className="text-rose-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-900">
          {isAdmin ? 'System Analytics (Real Data)' : 'Regional Analytics'}
        </h1>
        <p className="text-emerald-600">
          Viewing live data from MongoDB for <span className="font-bold text-emerald-800">{isAdmin ? 'All Regions' : userData?.region}</span>
        </p>
      </div>

      {/* Quick Stats Grid - DIFFERENTIATED BY ROLE FOR RELEVANCE */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <StatCard icon={Users} label="Registered Users" value={analyticsData.stats.totalUsers} trend="Live DB" delay={0} />
            <StatCard icon={FileText} label="Total Itineraries Created" value={analyticsData.stats.totalVisitors} trend="Platform Usage" delay={0.1} />
            <StatCard icon={MapPin} label="Approved Destinations" value={analyticsData.stats.activeDestinations} trend="Live Directory" delay={0.2} />
            <StatCard icon={Clock} label="Pending Approvals" value={analyticsData.stats.pendingRequests} trend="Needs Review" trendNeutral delay={0.3} />
          </>
        ) : (
          <>
            <StatCard icon={MapPin} label="Approved Destinations" value={analyticsData.stats.activeDestinations} trend="Live Directory" delay={0} />
            <StatCard icon={Clock} label="Pending Requests" value={analyticsData.stats.pendingRequests} trend="Waiting Approval" trendNeutral delay={0.1} />
            <StatCard icon={FileText} label="Itineraries Generated" value={analyticsData.stats.totalVisitors} trend="Regional Usage" delay={0.2} />
            <StatCard icon={CalendarDays} label="Peak Planning Month" value={analyticsData.stats.peakSeason} trend="Calculated" trendNeutral delay={0.3} />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Chart 1: Platform Engagement (Both Roles) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/50"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-emerald-900">Itineraries Generated</h2>
            <p className="text-sm text-emerald-600">Actual number of trips planned per month.</p>
          </div>
          
          <div className="h-[300px] w-full">
            {analyticsData.stats.totalVisitors > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyVisits} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#065f46', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#065f46', fontSize: 12 }} dx={-10} allowDecimals={false} />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line type="monotone" dataKey="visits" stroke="#059669" strokeWidth={3} dot={{ fill: '#059669', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-emerald-400 font-medium">
                <FileText size={32} className="mb-2 opacity-50" />
                <p>No itineraries generated yet.</p>
                <p className="text-xs opacity-70">Go to Planner and generate one!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chart 2: Top Destinations (Both Roles) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/50"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-emerald-900">Trending Destinations</h2>
            <p className="text-sm text-emerald-600">Most requested locations in the Planner.</p>
          </div>
          
          <div className="h-[300px] w-full">
            {analyticsData.topDestinations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.topDestinations} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#065f46', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#065f46', fontSize: 12 }} dx={-10} allowDecimals={false} />
                  <Tooltip content={<CustomLineTooltip />} cursor={{ fill: '#ecfdf5' }} />
                  <Bar dataKey="visitors" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-emerald-400 font-medium">
                No destination trends available yet.
              </div>
            )}
          </div>
        </motion.div>

        {/* --- ADMIN ONLY CHARTS --- */}
        {isAdmin && (
          <>
            {/* Chart 3: Destinations by Region */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/50"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-emerald-900">Approved by Region</h2>
                <p className="text-sm text-emerald-600">Database distribution across the Philippines.</p>
              </div>
              
              <div className="h-[300px] w-full">
                {analyticsData.destinationsByRegion?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analyticsData.destinationsByRegion} dataKey="count" nameKey="region" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={5}>
                        {analyticsData.destinationsByRegion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-emerald-400 font-medium">
                    No approved regions yet.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Chart 4: Destinations by Category */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/50"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-emerald-900">Approved by Category</h2>
                <p className="text-sm text-emerald-600">Database distribution by spot type.</p>
              </div>
              
              <div className="h-[300px] w-full">
                {analyticsData.destinationsByCategory?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analyticsData.destinationsByCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100} paddingAngle={2}>
                        {analyticsData.destinationsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-emerald-400 font-medium">
                    No approved categories yet.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper component
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