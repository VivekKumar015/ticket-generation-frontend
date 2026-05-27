import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FiMenu, FiBell, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { configGetEmployeeProjects } from '../api/axios';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, currentProject, switchProject, isEmployee, isAdmin } = useAuth();

  useEffect(() => {
    if (user && (isEmployee() || isAdmin())) {
      configGetEmployeeProjects(user.userId)
        .then(r => setProjects(r.data))
        .catch(() => {});
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">

        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(o => !o)} className="md:hidden text-gray-400 hover:text-white">
              <FiMenu size={24} />
            </button>

            {/* Project Switcher — shows for employee and admin */}
            {(isEmployee() || isAdmin()) && projects.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-sm text-white transition">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{currentProject ? currentProject.projectName : 'All Projects'}</span>
                  <FiChevronDown size={14} className="text-gray-400" />
                </button>

                {showDropdown && (
                  <div className="absolute top-12 left-0 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 min-w-48">
                    <button
                      onClick={() => { switchProject(null); setShowDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition rounded-t-xl ${!currentProject ? 'text-blue-400' : 'text-white'}`}>
                      All Projects
                    </button>
                    {projects.map(p => (
                      <button key={p.projectId}
                        onClick={() => { switchProject(p); setShowDropdown(false); }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition ${currentProject?.projectId === p.projectId ? 'text-blue-400' : 'text-white'}`}>
                        {p.projectName}
                        {p.roleInProject && (
                          <span className="text-gray-500 text-xs ml-2">{p.roleInProject}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <p className="text-gray-400 text-sm">
                Welcome, <span className="text-white font-medium">{user?.firstName}</span>
              </p>
            </div>
            <button className="relative text-gray-400 hover:text-white">
              <FiBell size={20} />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.firstName?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}