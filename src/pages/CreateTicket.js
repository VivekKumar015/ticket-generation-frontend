import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, getAllProjects, getAllEmployees } from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function CreateTicket() {
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    priority: 'P3_MEDIUM', supportLevel: 'L1',
    projectId: '', assignedToId: ''
  });
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getAllProjects().then(r => setProjects(r.data)).catch(() => {});
    if (isAdmin()) getAllEmployees().then(r => setEmployees(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.projectId) delete payload.projectId;
      if (!payload.assignedToId) delete payload.assignedToId;
      else payload.assignedToId = Number(payload.assignedToId);
      if (payload.projectId) payload.projectId = Number(payload.projectId);
      await createTicket(payload);
      toast.success('Ticket created successfully!');
      navigate('/tickets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally { setLoading(false); }
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition text-sm";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Create New Ticket</h1>
        <p className="text-gray-400 text-sm mt-1">Fill in the details to raise a support ticket</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Issue Title *">
            <input className={inputClass} required value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Brief description of the issue" />
          </Field>

          <Field label="Description *">
            <textarea className={inputClass} required rows={4} value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Detailed description of the issue..." />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <input className={inputClass} value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                placeholder="e.g. Bug, Feature" />
            </Field>
            <Field label="Priority">
              <select className={inputClass} value={form.priority}
                onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="P1_CRITICAL">P1 - Critical</option>
                <option value="P2_HIGH">P2 - High</option>
                <option value="P3_MEDIUM">P3 - Medium</option>
                <option value="P4_LOW">P4 - Low</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Support Level">
              <select className={inputClass} value={form.supportLevel}
                onChange={e => setForm({...form, supportLevel: e.target.value})}>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
              </select>
            </Field>
            <Field label="Project">
              <select className={inputClass} value={form.projectId}
                onChange={e => setForm({...form, projectId: e.target.value})}>
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          </div>

          {isAdmin() && (
            <Field label="Assign To Employee">
              <select className={inputClass} value={form.assignedToId}
                onChange={e => setForm({...form, assignedToId: e.target.value})}>
                <option value="">Unassigned</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </Field>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl text-sm font-medium transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition">
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}