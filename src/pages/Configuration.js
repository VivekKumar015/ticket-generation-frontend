import { useState, useEffect } from 'react';
import {
  configGetAllProjects, configCreateProject, configUpdateProject, configDeleteProject,
  configGetAllShifts, configCreateShift,
  configGetAllEmployees, configAssignEmployee, configRemoveEmployee,
  configGetProjectEmployees
} from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiClock, FiLayers, FiX } from 'react-icons/fi';

const TABS = ['Projects', 'Employees', 'Shifts', 'Project Authorization'];

export default function Configuration() {
  const [activeTab, setActiveTab] = useState('Projects');
  const [projects, setProjects] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Project form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: '', projectCode: '', description: '',
    supportEmail: '', slaHours: 24, shiftId: '', active: true
  });

  // Shift form
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    name: '', startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata'
  });

  // Employee assignment
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [roleInProject, setRoleInProject] = useState('');
  const [projectEmployees, setProjectEmployees] = useState({});
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, s, e] = await Promise.all([
        configGetAllProjects(),
        configGetAllShifts(),
        configGetAllEmployees()
      ]);
      setProjects(p.data);
      setShifts(s.data);
      setEmployees(e.data);
    } catch (err) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  // ===== PROJECT HANDLERS =====
  const handleSaveProject = async () => {
    try {
      const payload = { ...projectForm };
      if (!payload.shiftId) delete payload.shiftId;
      else payload.shiftId = Number(payload.shiftId);

      if (editProject) {
        await configUpdateProject(editProject.id, payload);
        toast.success('Project updated!');
      } else {
        await configCreateProject(payload);
        toast.success('Project created!');
      }
      setShowProjectForm(false);
      setEditProject(null);
      setProjectForm({ name: '', projectCode: '', description: '', supportEmail: '', slaHours: 24, shiftId: '', active: true });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleEditProject = (p) => {
    setEditProject(p);
    setProjectForm({
      name: p.name || '',
      projectCode: p.projectCode || '',
      description: p.description || '',
      supportEmail: p.supportEmail || '',
      slaHours: p.slaHours || 24,
      shiftId: '',
      active: p.active
    });
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await configDeleteProject(id);
      toast.success('Project deleted');
      loadAll();
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleToggleProject = async (p) => {
    try {
      await configUpdateProject(p.id, { active: !p.active });
      toast.success(p.active ? 'Project deactivated' : 'Project activated');
      loadAll();
    } catch {
      toast.error('Failed to update project');
    }
  };

  // ===== SHIFT HANDLERS =====
  const handleSaveShift = async () => {
    try {
      await configCreateShift(shiftForm);
      toast.success('Shift created!');
      setShowShiftForm(false);
      setShiftForm({ name: '', startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata' });
      loadAll();
    } catch (err) {
      toast.error('Failed to save shift');
    }
  };

  // ===== EMPLOYEE ASSIGNMENT =====
  const handleAssignEmployee = async () => {
    if (!selectedEmployee || selectedProjects.length === 0) {
      toast.error('Select employee and at least one project');
      return;
    }
    try {
      await configAssignEmployee({
        userId: Number(selectedEmployee),
        projectIds: selectedProjects.map(Number),
        roleInProject
      });
      toast.success('Employee assigned to projects!');
      setSelectedEmployee('');
      setSelectedProjects([]);
      setRoleInProject('');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign employee');
    }
  };

  const handleRemoveEmployee = async (userId, projectId) => {
    if (!window.confirm('Remove this employee from project?')) return;
    try {
      await configRemoveEmployee(userId, projectId);
      toast.success('Employee removed');
      loadAll();
      loadProjectEmployees(projectId);
    } catch {
      toast.error('Failed to remove employee');
    }
  };

  const loadProjectEmployees = async (projectId) => {
    try {
      const res = await configGetProjectEmployees(projectId);
      setProjectEmployees(prev => ({ ...prev, [projectId]: res.data }));
    } catch {}
  };

  const toggleProjectExpand = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
      loadProjectEmployees(projectId);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500";

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
    </div>
  );
return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Configuration</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage projects, employees, shifts and authorization
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition border-b-2 ${
              activeTab === tab
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= PROJECTS TAB ================= */}
      {activeTab === 'Projects' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">
              {projects.length} projects total
            </p>
            <button
              onClick={() => {
                setEditProject(null);
                setProjectForm({
                  name: '',
                  projectCode: '',
                  description: '',
                  supportEmail: '',
                  slaHours: 24,
                  shiftId: '',
                  active: true
                });
                setShowProjectForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition"
            >
              <FiPlus />
              New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div
                key={p.id}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{p.name}</h3>
                      {p.projectCode && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                          {p.projectCode}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {p.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProject(p)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <p className="text-white font-bold text-lg">{p.totalTickets || 0}</p>
                    <p className="text-gray-500 text-xs">Total</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <p className="text-blue-400 font-bold text-lg">{p.openTickets || 0}</p>
                    <p className="text-gray-500 text-xs">Open</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <p className="text-green-400 font-bold text-lg">{p.resolvedTickets || 0}</p>
                    <p className="text-gray-500 text-xs">Resolved</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">
                    SLA: {p.slaHours}h | {p.shiftName || 'No shift'}
                  </span>
                  <button
                    onClick={() => handleToggleProject(p)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {p.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= EMPLOYEES TAB ================= */}
      {activeTab === 'Employees' && (
        <div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">
              Assign Employee to Projects
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Select Employee
                </label>
                <select
                  className={inputClass}
                  value={selectedEmployee}
                  onChange={e => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Choose employee...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Role in Project
                </label>
                <input
                  className={inputClass}
                  value={roleInProject}
                  onChange={e => setRoleInProject(e.target.value)}
                  placeholder="e.g. L1 Support"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">
                Select Projects
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {projects.map(p => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl px-4 py-2.5 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-500"
                      checked={selectedProjects.includes(String(p.id))}
                      onChange={e => {
                        const id = String(p.id);
                        setSelectedProjects(prev =>
                          e.target.checked
                            ? [...prev, id]
                            : prev.filter(x => x !== id)
                        );
                      }}
                    />
                    <span className="text-white text-sm">{p.name}</span>
                    {p.projectCode && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full ml-auto">
                        {p.projectCode}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleAssignEmployee}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition"
            >
              Assign to Selected Projects
            </button>
          </div>
        </div>
      )}

      {/* ================= SHIFTS TAB ================= */}
      {activeTab === 'Shifts' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">
              {shifts.length} shifts configured
            </p>
            <button
              onClick={() => setShowShiftForm(!showShiftForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm"
            >
              <FiPlus />
              New Shift
            </button>
          </div>

          {showShiftForm && (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">New Shift</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Shift Name</label>
                  <input
                    className={inputClass}
                    value={shiftForm.name}
                    onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })}
                    placeholder="e.g. Morning Shift"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Timezone</label>
                  <input
                    className={inputClass}
                    value={shiftForm.timezone}
                    onChange={e => setShiftForm({ ...shiftForm, timezone: e.target.value })}
                    placeholder="e.g. Asia/Kolkata"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    className={inputClass}
                    value={shiftForm.startTime}
                    onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End Time</label>
                  <input
                    type="time"
                    className={inputClass}
                    value={shiftForm.endTime}
                    onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShiftForm(false)}
                  className="flex-1 py-2.5 border border-gray-600 text-gray-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveShift}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm"
                >
                  Create Shift
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shifts.map(s => (
              <div
                key={s.id}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <FiClock className="text-purple-400" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{s.name}</p>
                    <p className="text-gray-400 text-xs">{s.timezone}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-gray-700/50 rounded-xl px-4 py-3">
                  <div className="text-center">
                    <p className="text-white font-bold">{s.startTime}</p>
                    <p className="text-gray-500 text-xs">Start</p>
                  </div>
                  <div className="text-gray-500 text-xs">→</div>
                  <div className="text-center">
                    <p className="text-white font-bold">{s.endTime}</p>
                    <p className="text-gray-500 text-xs">End</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= PROJECT AUTHORIZATION TAB ================= */}
      {activeTab === 'Project Authorization' && (
        <div className="space-y-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-5"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleProjectExpand(project.id)}
              >
                <div>
                  <h3 className="text-white font-semibold">{project.name}</h3>
                  <p className="text-gray-400 text-xs">Click to view employees</p>
                </div>
                <FiUsers className="text-blue-400" />
              </div>

              {expandedProject === project.id && (
                <div className="mt-4 space-y-3">
                  {(projectEmployees[project.id] || []).length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-3">
                      No employees assigned to this project
                    </p>
                  ) : (
                    (projectEmployees[project.id] || []).map(emp => (
                      <div
                        key={emp.userId}
                        className="flex justify-between items-center bg-gray-700 rounded-xl px-4 py-3"
                      >
                        <div>
                          <p className="text-white text-sm">{emp.name}</p>
                          <p className="text-gray-400 text-xs">{emp.roleInProject}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveEmployee(emp.userId, project.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================= PROJECT MODAL ================= */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white font-semibold text-lg">
                {editProject ? 'Edit Project' : 'New Project'}
              </h3>
              <button
                onClick={() => setShowProjectForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className={inputClass}
                value={projectForm.name}
                onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="Project Name"
              />
              <input
                className={inputClass}
                value={projectForm.projectCode}
                onChange={e => setProjectForm({ ...projectForm, projectCode: e.target.value })}
                placeholder="Project Code (e.g. PROJ-01)"
              />
              <textarea
                className={inputClass}
                rows={3}
                value={projectForm.description}
                onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Description (optional)"
              />
              <input
                className={inputClass}
                value={projectForm.supportEmail}
                onChange={e => setProjectForm({ ...projectForm, supportEmail: e.target.value })}
                placeholder="Support Email"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">SLA Hours</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={projectForm.slaHours}
                    onChange={e => setProjectForm({ ...projectForm, slaHours: Number(e.target.value) })}
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Shift</label>
                  <select
                    className={inputClass}
                    value={projectForm.shiftId}
                    onChange={e => setProjectForm({ ...projectForm, shiftId: e.target.value })}
                  >
                    <option value="">No shift</option>
                    {shifts.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowProjectForm(false)}
                className="flex-1 py-2.5 border border-gray-600 text-gray-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                {editProject ? 'Update' : 'Create'} Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}