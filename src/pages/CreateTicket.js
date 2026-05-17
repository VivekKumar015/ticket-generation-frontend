import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, getAllProjects, getAllEmployees } from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function CreateTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('P3_MEDIUM');
  const [supportLevel, setSupportLevel] = useState('L1');
  const [projectId, setProjectId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getAllProjects().then(r => setProjects(r.data)).catch(() => {});
    if (isAdmin()) {
      getAllEmployees().then(r => setEmployees(r.data)).catch(() => {});
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        category,
        priority,
        supportLevel
      };
      if (projectId) payload.projectId = Number(projectId);
      if (assignedToId) payload.assignedToId = Number(assignedToId);

      await createTicket(payload);
      toast.success('Ticket created successfully!');
      navigate('/tickets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition text-sm";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Create New Ticket</h1>
        <p className="text-gray-400 text-sm mt-1">Fill in the details to raise a support ticket</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Brief description of the issue"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Detailed description of the issue..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Bug, Feature, Support"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className={inputClass}>
                <option value="P1_CRITICAL">P1 - Critical</option>
                <option value="P2_HIGH">P2 - High</option>
                <option value="P3_MEDIUM">P3 - Medium</option>
                <option value="P4_LOW">P4 - Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Support Level
              </label>
              <select
                value={supportLevel}
                onChange={e => setSupportLevel(e.target.value)}
                className={inputClass}>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project
            </label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className={inputClass}>
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {isAdmin() && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assign To Employee
              </label>
              <select
                value={assignedToId}
                onChange={e => setAssignedToId(e.target.value)}
                className={inputClass}>
                <option value="">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl text-sm font-medium transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition">
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}