import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, UserCog, Mail, User, Phone, Building } from 'lucide-react';

export default function EditProfile() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    designation: user?.designation || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const backPath = user?.role === 'admin' ? '/admin' : '/employee';

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        designation: form.designation.trim(),
      });

      // Update stored user data
      const updatedUser = { ...user, ...res.data.user };
      loginUser(localStorage.getItem('token'), updatedUser);

      toast.success('Profile updated successfully!');
      navigate(backPath);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      if (msg.toLowerCase().includes('email')) {
        setErrors({ email: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-lg">
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-5 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <UserCog className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-sm text-gray-500">Update your account information</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" /> Full Name *
            </label>
            <input
              className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address *
            </label>
            <input
              type="email"
              className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            <p className="text-xs text-gray-400 mt-1">Email will be saved in lowercase. Must be unique.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone
            </label>
            <input
              className="input"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          {/* Department */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-gray-400" /> Department
            </label>
            <input
              className="input"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            />
          </div>

          {/* Designation */}
          <div>
            <label className="label">Designation</label>
            <input
              className="input"
              value={form.designation}
              onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => navigate(backPath)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <UserCog className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
