import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', phone:'', department:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Join the ticket management system</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[{name:'firstName',label:'First Name'},{name:'lastName',label:'Last Name'}].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{f.label}</label>
                  <input name={f.name} value={form[f.name]} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>
            {[
              {name:'email',label:'Email',type:'email'},
              {name:'password',label:'Password',type:'password'},
              {name:'phone',label:'Phone (optional)',type:'text'},
              {name:'department',label:'Department (optional)',type:'text'}
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-300 mb-2">{f.label}</label>
                <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                  required={f.name === 'email' || f.name === 'password'}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}