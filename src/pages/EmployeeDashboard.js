import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedTickets, getTicketsByProject } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FiTag, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentProject } = useAuth();

  useEffect(() => {
    loadTickets();
  }, [currentProject]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      let res;
      if (currentProject?.projectId) {
        res = await getTicketsByProject(currentProject.projectId);
      } else {
        res = await getAssignedTickets();
      }
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const open = tickets.filter(t => t.status === 'OPEN').length;
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
  const critical = tickets.filter(t => t.priority === 'P1_CRITICAL').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {currentProject ? currentProject.projectName + ' — Tickets' : 'My Assigned Tickets'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {currentProject ? 'Showing tickets for selected project' : 'All tickets from your assigned projects'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total', value: tickets.length, icon: FiTag, color: 'text-blue-400 bg-blue-500/10' },
          { title: 'Open', value: open, icon: FiAlertCircle, color: 'text-orange-400 bg-orange-500/10' },
          { title: 'In Progress', value: inProgress, icon: FiClock, color: 'text-yellow-400 bg-yellow-500/10' },
          { title: 'Resolved', value: resolved, icon: FiCheckCircle, color: 'text-green-400 bg-green-500/10' },
        ].map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">{title}</p>
              <div className={`p-2 rounded-xl ${color}`}><Icon size={16} /></div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-white font-semibold">Tickets ({tickets.length})</h3>
          <Link to="/tickets/new" className="text-blue-400 text-sm hover:underline">+ New Ticket</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {currentProject ? 'No tickets in this project yet' : 'No tickets assigned yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {tickets.map(t => (
              <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition">
                <div className="flex-1">
                  <p className="text-blue-400 text-xs font-mono mb-1">{t.ticketNumber}</p>
                  <p className="text-white text-sm font-medium">{t.title}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {t.createdByName} • {t.projectName || 'No Project'}
                    {t.slaStatus === 'SLA_BREACHED' && (
                      <span className="ml-2 text-red-400 font-medium">⚠ SLA Breached</span>
                    )}
                    {t.slaStatus === 'SLA_WARNING' && (
                      <span className="ml-2 text-yellow-400 font-medium">⚡ SLA Warning</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={(priorityColors[t.priority] || 'bg-gray-500/20 text-gray-400') + ' text-xs px-2 py-1 rounded-full font-medium'}>
                    {t.priority?.replace('_', ' ')}
                  </span>
                  <span className={(statusColors[t.status] || 'bg-gray-500/20 text-gray-400') + ' text-xs px-2 py-1 rounded-full font-medium'}>
                    {t.status?.replace('_', ' ')}
                  </span>
                  <Link to={'/tickets/' + t.id}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Update
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}