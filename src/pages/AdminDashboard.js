import { useState, useEffect } from 'react';
import { getAdminDashboard, configGetAllProjects } from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTag, FiAlertCircle, FiCheckCircle, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <div className={`p-2 rounded-xl ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value ?? 0}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminDashboard(), configGetAllProjects()])
      .then(([s, p]) => {
        setStats(s.data);
        setProjects(p.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const barData = stats ? [
    { name: 'Open', count: Number(stats.openTickets) },
    { name: 'Progress', count: Number(stats.inProgressTickets) },
    { name: 'Pending', count: Number(stats.pendingTickets) },
    { name: 'Resolved', count: Number(stats.resolvedTickets) },
    { name: 'Closed', count: Number(stats.closedTickets) },
    { name: 'Critical', count: Number(stats.criticalTickets) },
  ] : [];

  const pieData = stats ? [
    { name: 'Open', value: Number(stats.openTickets) },
    { name: 'In Progress', value: Number(stats.inProgressTickets) },
    { name: 'Resolved', value: Number(stats.resolvedTickets) },
    { name: 'Critical', value: Number(stats.criticalTickets) },
    { name: 'Pending', value: Number(stats.pendingTickets) },
    { name: 'Closed', value: Number(stats.closedTickets) },
  ] : [];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Overview of all tickets and system activity</p>
        </div>
        <div className="flex gap-3">
          <Link to="/configuration" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition">
            Configuration
          </Link>
          <Link to="/reports" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition">
            Reports
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard title="Total Tickets" value={stats?.totalTickets} icon={FiTag} color="blue" />
        <StatCard title="Open Tickets" value={stats?.openTickets} icon={FiTrendingUp} color="orange" />
        <StatCard title="In Progress" value={stats?.inProgressTickets} icon={FiClock} color="yellow" />
        <StatCard title="Resolved" value={stats?.resolvedTickets} icon={FiCheckCircle} color="green" />
        <StatCard title="Critical" value={stats?.criticalTickets} icon={FiAlertCircle} color="red" />
        <StatCard title="Total Users" value={stats?.totalUsers} icon={FiUsers} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Ticket Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Ticket Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-gray-400 text-xs">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Overview */}
      {projects.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold">Projects Overview</h3>
            <Link to="/configuration" className="text-blue-400 text-sm hover:underline">Manage →</Link>
          </div>
          <div className="divide-y divide-gray-700">
            {projects.slice(0, 5).map(p => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{p.name}</p>
                  <p className="text-gray-400 text-xs">SLA: {p.slaHours}h | {p.shiftName || 'No shift'}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-400">{p.openTickets} open</span>
                  <span className="text-green-400">{p.resolvedTickets} resolved</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${p.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}