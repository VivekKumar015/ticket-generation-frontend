import { FiMenu, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ setOpen }) {
  const { user } = useAuth();
  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      <button onClick={() => setOpen(o => !o)} className="md:hidden text-gray-400 hover:text-white">
        <FiMenu size={24} />
      </button>
      <div className="hidden md:block">
        <p className="text-gray-400 text-sm">Welcome back, <span className="text-white font-medium">{user?.firstName}</span></p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-white">
          <FiBell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
        </button>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user?.firstName?.[0]}
        </div>
      </div>
    </header>
  );
}