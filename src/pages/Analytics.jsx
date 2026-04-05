import React from 'react';
import { BarChart3, Users, MapPin, Database, ShieldCheck } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export default function Analytics() {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null; // Protect route

  // --- MOCK DATA FOR CHARTS ---

  // 1. Area Chart Data (Monthly Visitors)
  const visitorData = [
    { name: 'Jan', visitors: 4000 },
    { name: 'Feb', visitors: 3000 },
    { name: 'Mar', visitors: 5000 },
    { name: 'Apr', visitors: 4500 },
    { name: 'May', visitors: 6000 },
    { name: 'Jun', visitors: 8500 },
  ];

  // 2. Bar Chart Data (Top Destinations by interactions)
  const destinationData = [
    { name: 'El Nido', interactions: 840 },
    { name: 'Siargao', interactions: 650 },
    { name: 'Boracay', interactions: 520 },
    { name: 'Chocolate Hills', interactions: 380 },
    { name: 'Baguio', interactions: 290 },
  ];

  // 3. Pie Chart Data (Database Shards Distribution)
  const shardData = [
    { name: 'Luzon Shard', value: 45 },
    { name: 'Visayas Shard', value: 30 },
    { name: 'Mindanao Shard', value: 25 },
  ];
  const PIE_COLORS = ['#059669', '#34d399', '#a7f3d0']; // Emerald theme colors

  // 4. Line Chart Data (System Latency/Health)
  const systemHealthData = [
    { time: '08:00', ping: 45 },
    { time: '10:00', ping: 52 },
    { time: '12:00', ping: 120 }, // Peak hour spike
    { time: '14:00', ping: 48 },
    { time: '16:00', ping: 41 },
    { time: '18:00', ping: 60 },
  ];

  const stats = [
    { label: 'Total Visitors', value: '12.4k', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Top Destination', value: 'El Nido', icon: MapPin, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'System Health', value: 'Optimal', icon: ShieldCheck, color: 'bg-purple-50 text-purple-600' },
    { label: 'Shards Active', value: '3 (Region)', icon: Database, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-8 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-emerald-900">Platform Analytics</h1>
        <p className="text-emerald-600">Visual breakdown of system metrics and user engagement.</p>
      </header>
      
      {/* Top Stats Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-emerald-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-emerald-900">{stat.value}</h3>
          </div>
        ))}
      </section>
      
      {/* Charts Grid */}
      <section className="grid gap-6 lg:grid-cols-2">
        
        {/* Chart 1: Area Chart (Visitors) */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-emerald-900">Visitor Growth (YTD)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecfdf5" />
                <XAxis dataKey="name" tick={{fill: '#065f46', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#065f46', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="visitors" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bar Chart (Top Destinations) */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-emerald-900">Most Explored Destinations</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ecfdf5" />
                <XAxis type="number" tick={{fill: '#065f46', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{fill: '#065f46', fontSize: 12}} axisLine={false} tickLine={false} width={100} />
                <Tooltip cursor={{fill: '#f0fdf4'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="interactions" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Pie Chart (Sharding Distribution) */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-emerald-900">Database Load by Shard (%)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shardData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {shardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#065f46' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Line Chart (System Health) */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-emerald-900">API Latency (ms)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={systemHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecfdf5" />
                <XAxis dataKey="time" tick={{fill: '#065f46', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#065f46', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="ping" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>
    </div>
  );
}