import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import toast from 'react-hot-toast';
import { Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3 shadow-lg shadow-blue-600/30">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">MG Solutions</h1>
          <p className="text-gray-400 mt-1 text-sm">Employee & Project Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-5">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@mgsolutions.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-6">
            Contact your administrator if you don't have an account.
          </p>
        </div>
      </div>
    </div>
  );
}
