import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ChangePassword() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 8) e.newPassword = 'Must be at least 8 characters';
    else if (form.newPassword === form.currentPassword) e.newPassword = 'New password must be different from current';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your new password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      toast.success('Password changed! Please sign in again.');
      setTimeout(() => {
        logoutUser();
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      if (msg.toLowerCase().includes('current')) {
        setErrors({ currentPassword: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const backPath = user?.role === 'admin' ? '/admin' : '/employee';

  const PasswordField = ({ id, label, value, showKey, onChange }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show[showKey] ? 'text' : 'password'}
          className={`input pl-10 pr-10 ${errors[id] ? 'border-red-400 focus:ring-red-400' : ''}`}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
          }}
          autoComplete={showKey === 'current' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-lg">
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-5 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-500">Update your account password</p>
        </div>
      </div>

      <div className="card">
        {/* Who is changing */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-blue-500`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            showKey="current"
            value={form.currentPassword}
            onChange={(v) => setForm(f => ({ ...f, currentPassword: v }))}
          />

          <PasswordField
            id="newPassword"
            label="New Password"
            showKey="new"
            value={form.newPassword}
            onChange={(v) => setForm(f => ({ ...f, newPassword: v }))}
          />

          {/* Strength indicator */}
          {form.newPassword.length > 0 && (
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map(i => {
                  const strength = form.newPassword.length >= i * 3 ? true : false;
                  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
                  return (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${strength ? colors[i - 1] : 'bg-gray-200'}`}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-gray-400">
                {form.newPassword.length < 6 ? 'Too short' : form.newPassword.length < 9 ? 'Weak' : form.newPassword.length < 12 ? 'Good' : 'Strong'}
              </p>
            </div>
          )}

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            showKey="confirm"
            value={form.confirmPassword}
            onChange={(v) => setForm(f => ({ ...f, confirmPassword: v }))}
          />

          {/* Match indicator */}
          {form.confirmPassword.length > 0 && (
            <p className={`text-xs flex items-center gap-1 ${form.newPassword === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
              {form.newPassword === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate(backPath)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
