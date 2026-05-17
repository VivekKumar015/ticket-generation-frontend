import { useState, useEffect } from 'react';
import { getAdminDashboard } from '../api/axios';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTicket, FiAlertCircle, FiCheckCircle, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard().then(r => { setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Open', value: Number(stats.openTickets) },
    { name: 'In Progress', value: Number(stats.inProgressTickets) },
    { name: 'Resolved', value: Number(stats.resolvedTickets) },
    { name: 'Critical', value: Number(stats.criticalTickets) },
    { name: 'Pending', value: Number(stats.pendingTickets) },
    { name: 'Closed', value: Number(stats.closedTickets) },
  ] : [];

  const barData = stats ? [
    { name: 'Open', count: Number(stats.openTickets) },
    { name: 'Progress', count: Number(stats.inProgressTickets) },
    { name: 'Pending', count: Number(stats.pendingTickets) },
    { name: 'Resolved', count: Number(stats.resolvedTickets) },
    { name: 'Closed', count: Number(stats.closedTickets) },
    { name: 'Critical', count: Number(stats.criticalTickets) },
  ] : [];

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of all tickets and system activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard title="Total Tickets" value={stats?.totalTickets} icon={FiTicket} color="blue" />
        <StatCard title="Open Tickets" value={stats?.openTickets} icon={FiTrendingUp} color="orange" />
        <StatCard title="In Progress" value={stats?.inProgressTickets} icon={FiClock} color="yellow" />
        <StatCard title="Resolved" value={stats?.resolvedTickets} icon={FiCheckCircle} color="green" />
        <StatCard title="Critical" value={stats?.criticalTickets} icon={FiAlertCircle} color="red" />
        <StatCard title="Total Users" value={stats?.totalUsers} icon={FiUsers} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6">Ticket Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6">Ticket Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-gray-400 text-xs">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}