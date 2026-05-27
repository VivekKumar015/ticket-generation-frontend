import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTickets, getMyTickets, searchTickets } from '../api/axios';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getVisibleTickets, getTicketsByProject, searchTickets } from '../api/axios';

const statusColors = {
  OPEN: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
  PENDING: 'bg-orange-500/20 text-orange-400',
  RESOLVED: 'bg-green-500/20 text-green-400',
  CLOSED: 'bg-gray-500/20 text-gray-400',
  REOPENED: 'bg-purple-500/20 text-purple-400',
};

const priorityColors = {
  P1_CRITICAL: 'bg-red-500/20 text-red-400',
  P2_HIGH: 'bg-orange-500/20 text-orange-400',
  P3_MEDIUM: 'bg-yellow-500/20 text-yellow-400',
  P4_LOW: 'bg-green-500/20 text-green-400',
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const { isAdmin, isEmployee } = useAuth();

const fetchTickets = async () => {
  setLoading(true);
  try {
    let res;
    if (search || status || priority) {
      // Use search with filters
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      res = await searchTickets(params);
    } else {
      // Use role-based visibility endpoint
      res = await getVisibleTickets();
    }
    setTickets(res.data);
  } catch (err) {
    console.error('Failed to fetch tickets', err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => { fetchTickets(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isAdmin() ? 'All Tickets' : isEmployee() ? 'Assigned Tickets' : 'My Tickets'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{tickets.length} tickets found</p>
        </div>
        <Link to="/tickets/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <FiPlus /> New Ticket
        </Link>
      </div>

      {(isAdmin() || isEmployee()) && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 mb-5 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none">
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="PENDING">PENDING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REOPENED">REOPENED</option>
          </select>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none">
            <option value="">All Priority</option>
            <option value="P1_CRITICAL">P1 CRITICAL</option>
            <option value="P2_HIGH">P2 HIGH</option>
            <option value="P3_MEDIUM">P3 MEDIUM</option>
            <option value="P4_LOW">P4 LOW</option>
          </select>
          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition">
            <FiFilter /> Filter
          </button>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-3">No tickets found</p>
            <Link to="/tickets/new" className="text-blue-400 hover:underline text-sm">
              Create your first ticket →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 text-xs font-medium px-5 py-4 uppercase tracking-wide">Ticket ID</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-5 py-4 uppercase tracking-wide">Title</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-5 py-4 uppercase tracking-wide">Priority</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-5 py-4 uppercase tracking-wide">Status</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-5 py-4 uppercase tracking-wide">Assigned To</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-5 py-4 uppercase tracking-wide">Created</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-5 py-4 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                    <td className="px-5 py-4 text-blue-400 font-mono text-sm">{t.ticketNumber}</td>
                    <td className="px-5 py-4 text-white text-sm max-w-xs truncate">{t.title}</td>
                    <td className="px-5 py-4">
                      <span className={(priorityColors[t.priority] || 'bg-gray-500/20 text-gray-400') + ' text-xs px-2 py-1 rounded-full font-medium'}>
                        {t.priority ? t.priority.replace('_', ' ') : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={(statusColors[t.status] || 'bg-gray-500/20 text-gray-400') + ' text-xs px-2 py-1 rounded-full font-medium'}>
                        {t.status ? t.status.replace('_', ' ') : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{t.assignedToName || 'Unassigned'}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <Link to={'/tickets/' + t.id}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}