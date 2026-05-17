import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets } from '../api/axios';
import StatCard from '../components/StatCard';
import { FiTicket, FiClock, FiCheckCircle, FiPlus } from 'react-icons/fi';

const statusColors = {
  OPEN: 'bg-blue-500/20 text-blue-400', IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
  PENDING: 'bg-orange-500/20 text-orange-400', RESOLVED: 'bg-green-500/20 text-green-400',
  CLOSED: 'bg-gray-500/20 text-gray-400', REOPENED: 'bg-purple-500/20 text-purple-400',
};

export default function UserDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTickets().then(r => { setTickets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tickets</h1>
          <p className="text-gray-400 text-sm mt-1">Track your support tickets</p>
        </div>
        <Link to="/tickets/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <FiPlus /> Raise Ticket
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Tickets" value={tickets.length} icon={FiTicket} color="blue" />
        <StatCard title="In Progress" value={tickets.filter(t => t.status === 'IN_PROGRESS').length} icon={FiClock} color="yellow" />
        <StatCard title="Resolved" value={tickets.filter(t => t.status === 'RESOLVED').length} icon={FiCheckCircle} color="green" />
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No tickets yet</p>
            <Link to="/tickets/new" className="text-blue-400 hover:underline text-sm">Raise your first ticket →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {tickets.map(t => (
              <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition">
                <div>
                  <p className="text-blue-400 text-xs font-mono mb-1">{t.ticketNumber}</p>
                  <p className="text-white text-sm font-medium">{t.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{t.assignedToName ? `Assigned to ${t.assignedToName}` : 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[t.status]}`}>
                    {t.status?.replace('_',' ')}
                  </span>
                  <Link to={`/tickets/${t.id}`} className="text-blue-400 hover:text-blue-300 text-sm">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}