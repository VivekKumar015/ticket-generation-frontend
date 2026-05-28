import { useState, useEffect } from 'react';
import {
  configGetAllProjects, configCreateProject, configUpdateProject, configDeleteProject,
  configGetAllShifts, configCreateShift, configUpdateShift,
  configGetAllUsers, configCreateEmployee, configUpdateEmployee,
  configDeleteEmployee, configToggleEmployeeStatus,
  configAssignEmployee, configRemoveEmployee, configGetProjectEmployees
} from '../api/axios';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit2, FiTrash2, FiUsers, FiClock,
  FiLayers, FiX, FiToggleLeft, FiToggleRight, FiSearch
} from 'react-icons/fi';

const TABS = ['Projects', 'Employees', 'Shifts', 'Project Authorization'];

const roleLabels = {
  ROLE_SUPER_ADMIN: 'Super Admin',
  ROLE_SUPPORT_EMPLOYEE: 'Support Employee',
  ROLE_USER: 'User'
};

const roleColors = {
  ROLE_SUPER_ADMIN: 'bg-red-500/20 text-red-400',
  ROLE_SUPPORT_EMPLOYEE: 'bg-blue-500/20 text-blue-400',
  ROLE_USER: 'bg-green-500/20 text-green-400'
};

export default function Configuration() {
  const [activeTab, setActiveTab] = useState('Projects');
  const [projects, setProjects] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search
  const [projectSearch, setProjectSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Project form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: '', projectCode: '', description: '',
    supportEmail: '', slaHours: 24, shiftId: '', active: true
  });

  // Employee form
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phone: '', department: '', role: 'ROLE_SUPPORT_EMPLOYEE', active: true
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

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, s, u] = await Promise.all([
        configGetAllProjects(),
        configGetAllShifts(),
        configGetAllUsers()
      ]);
      setProjects(p.data);
      setShifts(s.data);
      setUsers(u.data);
    } catch (err) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition";

  // ===== PROJECT HANDLERS =====
  const resetProjectForm = () => {
    setProjectForm({ name: '', projectCode: '', description: '', supportEmail: '', slaHours: 24, shiftId: '', active: true });
    setEditProject(null);
    setShowProjectForm(false);
  };

  const handleSaveProject = async () => {
    if (!projectForm.name.trim()) { toast.error('Project name is required'); return; }
    try {
      const payload = { ...projectForm };
      if (!payload.shiftId) delete payload.shiftId;
      else payload.shiftId = Number(payload.shiftId);
      if (editProject) {
        await configUpdateProject(editProject.id, payload);
        toast.success('Project updated successfully!');
      } else {
        await configCreateProject(payload);
        toast.success('Project created successfully!');
      }
      resetProjectForm();
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleEditProject = (p) => {
    setEditProject(p);
    setProjectForm({
      name: p.name || '', projectCode: p.projectCode || '',
      description: p.description || '', supportEmail: p.supportEmail || '',
      slaHours: p.slaHours || 24, shiftId: '', active: p.active
    });
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    try {
      await configDeleteProject(id);
      toast.success('Project deleted');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleToggleProject = async (p) => {
    try {
      await configUpdateProject(p.id, { active: !p.active });
      toast.success(p.active ? 'Project deactivated' : 'Project activated');
      loadAll();
    } catch { toast.error('Failed to update project'); }
  };

  // ===== EMPLOYEE HANDLERS =====
  const resetEmployeeForm = () => {
    setEmployeeForm({ firstName: '', lastName: '', email: '', password: '', phone: '', department: '', role: 'ROLE_SUPPORT_EMPLOYEE', active: true });
    setEditEmployee(null);
    setShowEmployeeForm(false);
  };

  const handleSaveEmployee = async () => {
    if (!employeeForm.firstName.trim() || !employeeForm.lastName.trim()) {
      toast.error('First name and last name are required'); return;
    }
    if (!editEmployee && !employeeForm.email.trim()) {
      toast.error('Email is required'); return;
    }
    try {
      if (editEmployee) {
        const payload = { ...employeeForm };
        if (!payload.password) delete payload.password;
        await configUpdateEmployee(editEmployee.id, payload);
        toast.success('Employee updated successfully!');
      } else {
        if (!employeeForm.password) {
          toast.error('Password is required for new employee'); return;
        }
        await configCreateEmployee(employeeForm);
        toast.success('Employee created! Default password set.');
      }
      resetEmployeeForm();
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleEditEmployee = (emp) => {
    setEditEmployee(emp);
    setEmployeeForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      password: '',
      phone: emp.phone || '',
      department: emp.department || '',
      role: emp.role || 'ROLE_SUPPORT_EMPLOYEE',
      active: emp.active
    });
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Deactivate employee "${name}"?`)) return;
    try {
      await configDeleteEmployee(id);
      toast.success('Employee deactivated');
      loadAll();
    } catch (err) {
      toast.error('Failed to deactivate employee');
    }
  };

  const handleToggleEmployee = async (id) => {
    try {
      const msg = await configToggleEmployeeStatus(id);
      toast.success(typeof msg.data === 'string' ? msg.data : 'Status updated');
      loadAll();
    } catch { toast.error('Failed to update status'); }
  };

  // ===== SHIFT HANDLERS =====
  const handleSaveShift = async () => {
    if (!shiftForm.name.trim()) { toast.error('Shift name is required'); return; }
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

  // ===== ASSIGNMENT HANDLERS =====
  const handleAssignEmployee = async () => {
    if (!selectedEmployee || selectedProjects.length === 0) {
      toast.error('Select employee and at least one project'); return;
    }
    try {
      await configAssignEmployee({
        userId: Number(selectedEmployee),
        projectIds: selectedProjects.map(Number),
        roleInProject
      });
      toast.success('Employee assigned to projects!');
      setSelectedEmployee(''); setSelectedProjects([]); setRoleInProject('');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign employee');
    }
  };

  const handleRemoveEmployee = async (userId, projectId) => {
    if (!window.confirm('Remove this employee from project?')) return;
    try {
      await configRemoveEmployee(userId, projectId);
      toast.success('Employee removed from project');
      loadProjectEmployees(projectId);
    } catch { toast.error('Failed to remove employee'); }
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

  // Filtered lists
  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.projectCode?.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.firstName + ' ' + u.lastName)?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    u.department?.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Configuration</h1>
        <p className="text-gray-400 text-sm mt-1">Manage projects, employees, shifts and project authorization</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-700">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition -mb-px border-b-2 ${
              activeTab === tab
                ? 'text-blue-400 border-blue-400 bg-blue-500/5'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-700/30'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ===================== PROJECTS TAB ===================== */}
      {activeTab === 'Projects' && (
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={15} />
              <input
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                placeholder="Search projects..."
                className="pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 w-56"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{filteredProjects.length} projects</span>
              <button
                onClick={() => { resetProjectForm(); setShowProjectForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
                <FiPlus size={16} /> New Project
              </button>
            </div>
          </div>

          {/* Project Form Modal */}
          {showProjectForm && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-white font-semibold text-lg">
                    {editProject ? 'Edit Project' : 'Create New Project'}
                  </h3>
                  <button onClick={resetProjectForm} className="text-gray-400 hover:text-white p-1">
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Project Name *</label>
                      <input className={inputClass} value={projectForm.name}
                        onChange={e => setProjectForm({...projectForm, name: e.target.value})}
                        placeholder="e.g. Alpha" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Project Code</label>
                      <input className={inputClass} value={projectForm.projectCode}
                        onChange={e => setProjectForm({...projectForm, projectCode: e.target.value})}
                        placeholder="e.g. ALPHA-01" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                    <textarea className={inputClass} rows={2} value={projectForm.description}
                      onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                      placeholder="Project description..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Support Email</label>
                      <input className={inputClass} type="email" value={projectForm.supportEmail}
                        onChange={e => setProjectForm({...projectForm, supportEmail: e.target.value})}
                        placeholder="support@company.com" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">SLA Hours</label>
                      <input className={inputClass} type="number" min="1" value={projectForm.slaHours}
                        onChange={e => setProjectForm({...projectForm, slaHours: Number(e.target.value)})}
                        placeholder="24" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Shift (for SLA calculation)</label>
                    <select className={inputClass} value={projectForm.shiftId}
                      onChange={e => setProjectForm({...projectForm, shiftId: e.target.value})}>
                      <option value="">Select Shift</option>
                      {shifts.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                      ))}
                    </select>
                  </div>
                  {editProject && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-gray-400">Active Status</label>
                      <button
                        onClick={() => setProjectForm({...projectForm, active: !projectForm.active})}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          projectForm.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {projectForm.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={resetProjectForm}
                    className="flex-1 py-2.5 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl text-sm transition">
                    Cancel
                  </button>
                  <button onClick={handleSaveProject}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
                    {editProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiLayers size={40} className="mx-auto mb-3 opacity-30" />
              <p>No projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map(p => (
                <div key={p.id} className={`bg-gray-800 border rounded-2xl p-5 transition ${
                  p.active ? 'border-gray-700 hover:border-gray-600' : 'border-red-900/30 opacity-70'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold">{p.name}</h3>
                        {p.projectCode && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                            {p.projectCode}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                        {p.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => handleEditProject(p)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition"
                        title="Edit">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleToggleProject(p)}
                        className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition"
                        title={p.active ? 'Deactivate' : 'Activate'}>
                        {p.active ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                      </button>
                      <button onClick={() => handleDeleteProject(p.id, p.name)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition"
                        title="Delete">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-gray-700/50 rounded-lg p-2">
                      <p className="text-white font-bold text-base">{p.totalTickets || 0}</p>
                      <p className="text-gray-500 text-xs">Total</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2">
                      <p className="text-blue-400 font-bold text-base">{p.openTickets || 0}</p>
                      <p className="text-gray-500 text-xs">Open</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2">
                      <p className="text-green-400 font-bold text-base">{p.resolvedTickets || 0}</p>
                      <p className="text-gray-500 text-xs">Resolved</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>SLA: {p.slaHours}h</span>
                    <span>{p.shiftName || 'No shift'}</span>
                    {p.supportEmail && <span className="truncate max-w-24">{p.supportEmail}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== EMPLOYEES TAB ===================== */}
      {activeTab === 'Employees' && (
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={15} />
              <input
                value={employeeSearch}
                onChange={e => setEmployeeSearch(e.target.value)}
                placeholder="Search by name, email..."
                className="pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{filteredUsers.length} users</span>
              <button
                onClick={() => { resetEmployeeForm(); setShowEmployeeForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
                <FiPlus size={16} /> New Employee
              </button>
            </div>
          </div>

          {/* Employee Form Modal */}
          {showEmployeeForm && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-white font-semibold text-lg">
                    {editEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </h3>
                  <button onClick={resetEmployeeForm} className="text-gray-400 hover:text-white p-1">
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">First Name *</label>
                      <input className={inputClass} value={employeeForm.firstName}
                        onChange={e => setEmployeeForm({...employeeForm, firstName: e.target.value})}
                        placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Last Name *</label>
                      <input className={inputClass} value={employeeForm.lastName}
                        onChange={e => setEmployeeForm({...employeeForm, lastName: e.target.value})}
                        placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">
                      Email {editEmployee ? '(cannot change)' : '*'}
                    </label>
                    <input className={inputClass} type="email" value={employeeForm.email}
                      onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})}
                      disabled={!!editEmployee}
                      placeholder="john@company.com" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">
                      Password {editEmployee ? '(leave blank to keep current)' : '*'}
                    </label>
                    <input className={inputClass} type="password" value={employeeForm.password}
                      onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})}
                      placeholder={editEmployee ? 'Leave blank to keep current' : 'Min 6 characters'} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
                      <input className={inputClass} value={employeeForm.phone}
                        onChange={e => setEmployeeForm({...employeeForm, phone: e.target.value})}
                        placeholder="+91 9876543210" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Department</label>
                      <input className={inputClass} value={employeeForm.department}
                        onChange={e => setEmployeeForm({...employeeForm, department: e.target.value})}
                        placeholder="IT Support" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Role *</label>
                    <select className={inputClass} value={employeeForm.role}
                      onChange={e => setEmployeeForm({...employeeForm, role: e.target.value})}>
                      <option value="ROLE_SUPPORT_EMPLOYEE">Support Employee</option>
                      <option value="ROLE_SUPER_ADMIN">Super Admin</option>
                      <option value="ROLE_USER">Normal User</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={resetEmployeeForm}
                    className="flex-1 py-2.5 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl text-sm transition">
                    Cancel
                  </button>
                  <button onClick={handleSaveEmployee}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
                    {editEmployee ? 'Update Employee' : 'Create Employee'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Employees Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-3.5 uppercase tracking-wide">Employee</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-3.5 uppercase tracking-wide">Role</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-3.5 uppercase tracking-wide">Department</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-3.5 uppercase tracking-wide">Projects</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-3.5 uppercase tracking-wide">Status</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-3.5 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">No users found</td>
                    </tr>
                  ) : (
                    filteredUsers.map(emp => (
                      <tr key={emp.id} className={`border-b border-gray-700/50 hover:bg-gray-700/20 transition ${!emp.active ? 'opacity-50' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                              <p className="text-gray-400 text-xs">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[emp.role] || 'bg-gray-500/20 text-gray-400'}`}>
                            {roleLabels[emp.role] || emp.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-sm">
                          {emp.department || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {emp.assignedProjects?.length > 0 ? (
                              emp.assignedProjects.slice(0, 2).map(proj => (
                                <span key={proj} className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                                  {proj}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-xs">None</span>
                            )}
                            {emp.assignedProjects?.length > 2 && (
                              <span className="text-xs text-gray-500">+{emp.assignedProjects.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${emp.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {emp.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <button onClick={() => handleEditEmployee(emp)}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition"
                              title="Edit">
                              <FiEdit2 size={14} />
                            </button>
                            <button onClick={() => handleToggleEmployee(emp.id)}
                              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition"
                              title={emp.active ? 'Deactivate' : 'Activate'}>
                              {emp.active ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                            </button>
                            <button onClick={() => handleDeleteEmployee(emp.id, emp.firstName + ' ' + emp.lastName)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition"
                              title="Deactivate">
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SHIFTS TAB ===================== */}
      {activeTab === 'Shifts' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-gray-400 text-sm">{shifts.length} shifts configured</p>
            <button onClick={() => setShowShiftForm(!showShiftForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
              <FiPlus size={16} /> New Shift
            </button>
          </div>

          {showShiftForm && (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">Create New Shift</h3>
                <button onClick={() => setShowShiftForm(false)} className="text-gray-400 hover:text-white">
                  <FiX size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Shift Name *</label>
                  <input className={inputClass} value={shiftForm.name}
                    onChange={e => setShiftForm({...shiftForm, name: e.target.value})}
                    placeholder="Morning Shift" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Start Time *</label>
                  <input className={inputClass} type="time" value={shiftForm.startTime}
                    onChange={e => setShiftForm({...shiftForm, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">End Time *</label>
                  <input className={inputClass} type="time" value={shiftForm.endTime}
                    onChange={e => setShiftForm({...shiftForm, endTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Timezone</label>
                  <select className={inputClass} value={shiftForm.timezone}
                    onChange={e => setShiftForm({...shiftForm, timezone: e.target.value})}>
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">EST (New York)</option>
                    <option value="Europe/London">GMT (London)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-gray-500 text-xs">
                  ⚠️ Saturday & Sunday automatically excluded from SLA calculations
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowShiftForm(false)}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-xl text-sm hover:bg-gray-700 transition">
                    Cancel
                  </button>
                  <button onClick={handleSaveShift}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
                    Create Shift
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shifts.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-gray-400">
                <FiClock size={40} className="mx-auto mb-3 opacity-30" />
                <p>No shifts configured yet</p>
              </div>
            ) : (
              shifts.map(s => (
                <div key={s.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <FiClock className="text-purple-400" size={18} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{s.name}</p>
                      <p className="text-gray-400 text-xs">{s.timezone}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-700/50 rounded-xl px-4 py-3">
                    <div className="text-center">
                      <p className="text-white font-bold">{s.startTime}</p>
                      <p className="text-gray-500 text-xs">Start</p>
                    </div>
                    <div className="text-gray-500">→</div>
                    <div className="text-center">
                      <p className="text-white font-bold">{s.endTime}</p>
                      <p className="text-gray-500 text-xs">End</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400 font-bold text-xs">Mon-Fri</p>
                      <p className="text-gray-500 text-xs">Working Days</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================== PROJECT AUTHORIZATION TAB ===================== */}
      {activeTab === 'Project Authorization' && (
        <div>
          {/* Assign Employee Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Assign Employee to Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Select Employee</label>
                <select className={inputClass} value={selectedEmployee}
                  onChange={e => setSelectedEmployee(e.target.value)}>
                  <option value="">Choose employee...</option>
                  {users.filter(u => u.role === 'ROLE_SUPPORT_EMPLOYEE' && u.active).map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Role in Project</label>
                <input className={inputClass} value={roleInProject}
                  onChange={e => setRoleInProject(e.target.value)}
                  placeholder="e.g. L1 Support, Manager" />
              </div>
              <div className="flex items-end">
                <button onClick={handleAssignEmployee}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
                  Assign to Projects
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Select Projects (click to toggle)</label>
              <div className="flex flex-wrap gap-2">
                {projects.filter(p => p.active).map(p => (
                  <button key={p.id}
                    onClick={() => {
                      const id = String(p.id);
                      setSelectedProjects(prev =>
                        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                      selectedProjects.includes(String(p.id))
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                    }`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Project Employee Authorization */}
          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleProjectExpand(p.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FiLayers className="text-blue-400" size={14} />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">{p.name}</p>
                      <p className="text-gray-400 text-xs">
                        {p.projectCode && p.projectCode + ' • '}SLA: {p.slaHours}h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                    <FiUsers className="text-gray-400" size={15} />
                    <span className="text-gray-400 text-sm">{expandedProject === p.id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedProject === p.id && (
                  <div className="border-t border-gray-700 px-6 py-4">
                    {!projectEmployees[p.id] ? (
                      <p className="text-gray-500 text-sm text-center py-4">Loading...</p>
                    ) : projectEmployees[p.id].length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No employees assigned — use the form above to assign employees
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {projectEmployees[p.id].map(emp => (
                          <div key={emp.userId}
                            className="flex items-center justify-between bg-gray-700/40 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {emp.name?.[0]}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{emp.name}</p>
                                <p className="text-gray-400 text-xs">{emp.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {emp.roleInProject && (
                                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                                  {emp.roleInProject}
                                </span>
                              )}
                              <button
                                onClick={() => handleRemoveEmployee(emp.userId, p.id)}
                                className="text-red-400 hover:text-red-300 text-xs hover:bg-red-500/10 px-3 py-1 rounded-lg transition">
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}