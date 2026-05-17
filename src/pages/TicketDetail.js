import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllTickets, updateTicket, addComment, getComments, getAllEmployees } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSend } from 'react-icons/fi';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isEmployee, user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTickets().then(r => {
      const t = r.data.find(t => String(t.id) === id);
      if (t) { setTicket(t); setStatus(t.status); setResolution(t.resolutionDetails || ''); }
      setLoading(false);
    });
    getComments(id).then(r => setComments(r.data)).catch(() => {});
    if (isAdmin()) getAllEmployees().then(r => setEmployees(r.data)).catch(() => {});
  }, [id]);

  const handleUpdate = async () => {
    try {
      const payload = { status };
      if (resolution) payload.resolutionDetails = resolution;
      if (assignedToId) payload.assignedToId = Number(assignedToId);
      await updateTicket(id, payload);
      toast.success('Ticket updated!');
      navigate(-1);
    } catch { toast.error('Update failed'); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment(id, { content: comment });
      setComment('');
      getComments(id).then(r => setComments(r.data));
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div></div>;
  if (!ticket) return <div className="text-center text-gray-400 py-16">Ticket not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition">
        <FiArrowLeft /> Back
      </button>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-400 font-mono text-sm mb-1">{ticket.ticketNumber}</p>
            <h1 className="text-xl font-bold text-white">{ticket.title}</h1>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-6">{ticket.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[['Priority', ticket.priority], ['Status', ticket.status],
            ['Category', ticket.category], ['Support Level', ticket.supportLevel],
            ['Created By', ticket.createdByName], ['Assigned To', ticket.assignedToName || 'Unassigned']
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-gray-500 text-xs">{l}</p>
              <p className="text-white mt-1">{v || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {(isAdmin() || isEmployee()) && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Update Ticket</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                {['OPEN','IN_PROGRESS','PENDING','RESOLVED','CLOSED','REOPENED'].map(s =>
                  <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            {isAdmin() && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Assign To</label>
                <select value={assignedToId} onChange={e => setAssignedToId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Keep current</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Resolution Details</label>
              <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Add resolution details..." />
            </div>
            <button onClick={handleUpdate}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition">
              Update Ticket
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Comments ({comments.length})</h3>
        <div className="space-y-4 mb-4">
          {comments.map(c => (
            <div key={c.id} className="bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {c.author?.firstName?.[0]}
                </div>
                <p className="text-white text-sm font-medium">{c.author?.firstName} {c.author?.lastName}</p>
                <p className="text-gray-500 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</p>
              </div>
              <p className="text-gray-300 text-sm">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet</p>}
        </div>
        <div className="flex gap-3">
          <input value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Add a comment..."
            onKeyDown={e => e.key === 'Enter' && handleComment()}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" />
          <button onClick={handleComment}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}