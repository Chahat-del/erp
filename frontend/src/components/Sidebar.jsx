import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials, avatarColor } from '../utils/helpers';
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  FileText, BarChart3, LogOut, Building2, X
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  { to: '/admin/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/admin/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/admin/reports', icon: FileText, label: 'Daily Reports' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

const employeeLinks = [
  { to: '/employee', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/employee/projects', icon: FolderKanban, label: 'My Projects' },
  { to: '/employee/tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/employee/reports', icon: FileText, label: 'Daily Reports' },
  { to: '/employee/performance', icon: BarChart3, label: 'Performance' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
    onClose?.();
  };

  const handleNav = () => onClose?.();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo + close btn */}
        <div className="px-4 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">MG Solutions</p>
              <p className="text-gray-400 text-xs">ERP System</p>
            </div>
          </div>
          {/* Close button — only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={handleNav}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-3 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(user?.name)}`}>
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
