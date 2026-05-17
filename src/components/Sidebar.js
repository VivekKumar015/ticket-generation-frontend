import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiTicket, FiPlus, FiUsers, FiSettings, FiLogOut, FiBarChart2 } from 'react-icons/fi';

export default function Sidebar({ open, setOpen }) {
  const { user, logout, isAdmin, isEmployee } = useAuth();

  const navItems = [
    { to: isAdmin() ? '/admin' : isEmployee() ? '/employee' : '/user', icon: FiHome, label: 'Dashboard' },
    { to: '/tickets', icon: FiTicket, label: 'All Tickets', show: isAdmin() || isEmployee() },
    { to: '/tickets/new', icon: FiPlus, label: 'New Ticket' },
    { to: '/admin', icon: FiBarChart2, label: 'Analytics', show: isAdmin() },
    { to: '/profile', icon: FiSettings, label: 'Profile' },
  ].filter(item => item.show !== false);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-30 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiTicket color="white" size={20} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">TicketSystem</p>
              <p className="text-xs text-gray-400">{user?.role?.replace('ROLE_','').replace('_',' ')}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 rounded-xl text-sm transition">
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}