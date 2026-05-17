import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTickets, searchTickets } from '../api/axios';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';

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

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      const res = Object.keys(params).length
        ? await searchTickets(params)
        : await getAllTickets();
      setTickets(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">All Tickets</h1>
          <p className="text-gray-400 text-sm mt-1">{tickets.length} tickets found</p>
        </div>
        <Link to="/tickets/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <FiPlus /> New Ticket
        </Link>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none">
          <option value="">All Status</option>
          {['OPEN','IN_PROGRESS','PENDING','RESOLVED','CLOSED','REOPENED'].map(s =>
            <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none">
          <option value="">All Priority</option>
          {['P1_CRITICAL','P2_HIGH','P3_MEDIUM','P4_LOW'].map(p =>
            <option key={p} value={p}>{p.replace('_',' ')}</option>)}
        </select>
        <button onClick={fetchTickets}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition">
          <FiFilter /> Filter
        </button>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No tickets found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Ticket ID','Title','Priority','Status','Assigned To','Created','Action'].map(h =>
                    <th key={h} className="text-left text-gray-400 text-xs font-medium px-5 py-4 uppercase tracking-wide">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                    <td className="px-5 py-4 text-blue-400 font-mono text-sm">{t.ticketNumber}</td>
                    <td className="px-5 py-4 text-white text-sm max-w-xs truncate">{t.title}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[t.priority] || 'text-gray-400'}`>
                        {t.priority?.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[t.status] || 'text-gray-400'}`>
                        {t.status?.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{t.assignedToName || 'Unassigned'}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-4">
                      <Link to={`/tickets/${t.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium">View</Link>
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