import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await changePassword(form);
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="text-white text-lg font-semibold">{user?.firstName} {user?.lastName}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
              {user?.role?.replace('ROLE_','').replace('_',' ')}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[{name:'currentPassword',label:'Current Password'},{name:'newPassword',label:'New Password'}].map(f => (
            <div key={f.name}>
              <label className="block text-sm text-gray-400 mb-2">{f.label}</label>
              <input type="password" value={form[f.name]}
                onChange={e => setForm({...form, [f.name]: e.target.value})} required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition">
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}