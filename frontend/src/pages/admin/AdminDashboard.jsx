import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../services/api';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, statusColor } from '../../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, FolderKanban, CheckSquare, FileText,
  TrendingUp, AlertCircle, Clock, Activity
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;
  if (!data) return null;

  const { stats, deptStats, recentProjects, recentReports, tasksByMonth, hoursPerDay } = data;

  const taskMonthData = tasksByMonth.map(t => ({
    name: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
    tasks: t.count
  }));

  const deptData = deptStats.map(d => ({ name: d._id || 'N/A', value: d.count }));

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle="MG Solutions — Overview"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="blue" subtitle={`${stats.activeEmployees} active`} />
        <StatCard title="Active Projects" value={stats.activeProjects} icon={FolderKanban} color="green" subtitle={`${stats.totalProjects} total`} />
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={CheckSquare} color="purple" subtitle={`${stats.completedTasks} completed`} />
        <StatCard title="Today's Reports" value={stats.todayReports} icon={FileText} color="orange" subtitle={`${stats.totalReports} total`} />
        <StatCard title="In Progress Tasks" value={stats.inProgressTasks} icon={Activity} color="indigo" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={Clock} color="yellow" />
        <StatCard title="Completed Projects" value={stats.completedProjects} icon={TrendingUp} color="teal" />
        <StatCard title="Missing Reports" value={stats.activeEmployees - stats.todayReports < 0 ? 0 : stats.activeEmployees - stats.todayReports} icon={AlertCircle} color="red" subtitle="today" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Tasks by Month */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Tasks Completed (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={taskMonthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Dept. Distribution</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No department data</div>
          )}
        </div>
      </div>

      {/* Hours Per Day */}
      {hoursPerDay.length > 0 && (
        <div className="card mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Team Hours Logged (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={hoursPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="totalHours" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Projects</h3>
          <div className="space-y-3">
            {recentProjects.length === 0 && <p className="text-gray-400 text-sm">No projects yet</p>}
            {recentProjects.map(p => (
              <div key={p._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">Deadline: {formatDate(p.deadline)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${p.completionPercentage}%` }} />
                  </div>
                  <span className={statusColor(p.status)}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Daily Reports</h3>
          <div className="space-y-3">
            {recentReports.length === 0 && <p className="text-gray-400 text-sm">No reports yet</p>}
            {recentReports.map(r => (
              <div key={r._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.employee?.name}</p>
                  <p className="text-xs text-gray-400">{r.project?.name} · {r.hoursWorked}h</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{formatDate(r.date)}</p>
                  {r.adminReview?.reviewed
                    ? <span className="badge-green">Reviewed</span>
                    : <span className="badge-yellow">Pending</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
