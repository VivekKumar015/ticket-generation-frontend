import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedTickets } from '../api/axios';
import StatCard from '../components/StatCard';
import { FiTag, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const statusColors = {
  OPEN: 'bg-blue-500/20 text-blue-400', IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
  PENDING: 'bg-orange-500/20 text-orange-400', RESOLVED: 'bg-green-500/20 text-green-400',
  CLOSED: 'bg-gray-500/20 text-gray-400', REOPENED: 'bg-purple-500/20 text-purple-400',
};

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssignedTickets().then(r => { setTickets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const open = tickets.filter(t => t.status === 'OPEN').length;
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
  const critical = tickets.filter(t => t.priority === 'P1_CRITICAL').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Assigned Tickets</h1>
        <p className="text-gray-400 text-sm mt-1">Manage and resolve your assigned tickets</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Assigned" value={tickets.length} icon={FiTag} color="blue" />
        <StatCard title="Open" value={open} icon={FiAlertCircle} color="orange" />
        <StatCard title="In Progress" value={inProgress} icon={FiClock} color="yellow" />
        <StatCard title="Resolved" value={resolved} icon={FiCheckCircle} color="green" />
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Assigned Tickets</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No tickets assigned to you yet</div>
        ) : (
          <div className="divide-y divide-gray-700">
            {tickets.map(t => (
              <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition">
                <div className="flex-1">
                  <p className="text-blue-400 text-xs font-mono mb-1">{t.ticketNumber}</p>
                  <p className="text-white text-sm font-medium">{t.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{t.createdByName} • {t.projectName || 'No Project'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[t.status]}`}>
                    {t.status?.replace('_',' ')}
                  </span>
                  <Link to={`/tickets/${t.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium">Update</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}