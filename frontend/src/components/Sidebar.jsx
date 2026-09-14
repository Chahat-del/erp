import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials, avatarColor } from '../utils/helpers';
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  FileText, BarChart3, LogOut, ChevronRight, Building2
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

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MG Solutions</p>
            <p className="text-gray-400 text-xs">ERP System</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-700 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColor(user?.name)}`}>
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
  );
}
