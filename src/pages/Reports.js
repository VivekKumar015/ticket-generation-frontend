import { useState, useEffect } from 'react';
import { getOverallReport, getProjectWiseReport } from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTag, FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const [overall, setOverall] = useState(null);
  const [projectReports, setProjectReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [o, p] = await Promise.all([
        getOverallReport(),
        getProjectWiseReport()
      ]);
      setOverall(o.data);
      setProjectReports(p.data);
      if (p.data.length > 0) setActiveProject(p.data[0]);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
    </div>
  );

  const statusChartData = overall ? Object.entries(overall.statusBreakdown || {}).map(([k, v]) => ({
    name: k.replace('_', ' '), count: Number(v)
  })) : [];

  const priorityChartData = overall ? Object.entries(overall.priorityBreakdown || {}).map(([k, v]) => ({
    name: k.replace('_', ' '), value: Number(v)
  })) : [];

  const projectBarData = projectReports.map(p => ({
    name: p.projectName?.substring(0, 8) || '',
    total: Number(p.totalTickets),
    open: Number(p.openTickets),
    resolved: Number(p.resolvedTickets)
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">System-wide performance and ticket analytics</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tickets', value: overall?.totalTickets, icon: FiTag, color: 'blue' },
          { label: 'Open', value: overall?.openTickets, icon: FiTrendingUp, color: 'orange' },
          { label: 'Resolved', value: overall?.resolvedTickets, icon: FiCheckCircle, color: 'green' },
          { label: 'SLA Breached', value: overall?.slaBreachedTickets, icon: FiAlertCircle, color: 'red' },
        ].map(({ label, value, icon: Icon, color }) => {
          const colors = {
            blue: 'text-blue-400 bg-blue-500/10',
            orange: 'text-orange-400 bg-orange-500/10',
            green: 'text-green-400 bg-green-500/10',
            red: 'text-red-400 bg-red-500/10'
          };
          return (
            <div key={label} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-xs">{label}</p>
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value ?? 0}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusChartData}>
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={priorityChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {priorityChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {priorityChartData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-gray-400 text-xs">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Comparison */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
        <h3 className="text-white font-semibold mb-4">Project-wise Ticket Comparison</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={projectBarData}>
            <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: '8px' }} />
            <Bar dataKey="total" fill="#6b7280" radius={[4,4,0,0]} name="Total" />
            <Bar dataKey="open" fill="#3b82f6" radius={[4,4,0,0]} name="Open" />
            <Bar dataKey="resolved" fill="#10b981" radius={[4,4,0,0]} name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-Project Deep Dive */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-700 overflow-x-auto">
          {projectReports.map(p => (
            <button key={p.projectName}
              onClick={() => setActiveProject(p)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition ${
                activeProject?.projectName === p.projectName
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {p.projectName}
            </button>
          ))}
        </div>

        {activeProject && (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total', value: activeProject.totalTickets, color: 'text-white' },
                { label: 'Open', value: activeProject.openTickets, color: 'text-blue-400' },
                { label: 'Resolved', value: activeProject.resolvedTickets, color: 'text-green-400' },
                { label: 'SLA Breached', value: activeProject.slaBreachedTickets, color: 'text-red-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value ?? 0}</p>
                  <p className="text-gray-400 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <FiClock className="text-gray-400" size={16} />
              <span className="text-gray-400 text-sm">
                Avg Resolution Time: <span className="text-white font-medium">
                  {activeProject.avgResolutionHours?.toFixed(2) || 0} working hours
                </span>
              </span>
            </div>

            {activeProject.employeePerformance?.length > 0 && (
              <div>
                <h4 className="text-white font-medium text-sm mb-3">Employee Performance</h4>
                <div className="space-y-2">
                  {activeProject.employeePerformance.map((emp, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-700/40 rounded-xl px-4 py-3">
                      <p className="text-white text-sm">{emp.employeeName}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-gray-400">Assigned: <span className="text-white">{emp.totalAssigned}</span></span>
                        <span className="text-gray-400">Resolved: <span className="text-green-400">{emp.resolved}</span></span>
                        <span className="text-gray-400">Avg: <span className="text-blue-400">{Number(emp.avgResolutionHours)?.toFixed(1)}h</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}