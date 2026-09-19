import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPerformance } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, statusColor, priorityColor } from '../../utils/helpers';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Performance() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    getPerformance(user._id)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!data) return <div className="p-8 text-gray-400">No performance data available yet.</div>;

  const { performance, hoursPerWeek, projects, recentReports } = data;

  const radarData = [
    { subject: 'Task Completion', A: performance.completionRate },
    { subject: 'On-time Delivery', A: performance.totalTasks > 0 ? Math.round((performance.completedOnTime / performance.totalTasks) * 100) : 0 },
    { subject: 'Report Consistency', A: Math.min(100, Math.round((performance.recentReports / 22) * 100)) },
    { subject: 'Avg Daily Hours', A: Math.min(100, Math.round((parseFloat(performance.avgDailyHours) / 8) * 100)) },
    { subject: 'Projects Active', A: Math.min(100, projects.length * 20) },
  ];

  const taskDistData = [
    { name: 'Completed', value: performance.taskStatusDist.completed },
    { name: 'In Progress', value: performance.taskStatusDist.inProgress },
    { name: 'Todo', value: performance.taskStatusDist.todo },
    { name: 'Cancelled', value: performance.taskStatusDist.cancelled },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 lg:p-8">
      <PageHeader title="My Performance" subtitle="Your work metrics and analytics" />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 lg:mb-6">
        {[
          { label: 'Completion Rate', value: `${performance.completionRate}%`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed On Time', value: performance.completedOnTime, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Hours', value: `${performance.totalHoursWorked}h`, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Avg Daily Hrs', value: `${performance.avgDailyHours}h`, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total Reports', value: performance.totalReports, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Reports (30d)', value: performance.recentReports, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Tasks', value: performance.totalTasks, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Projects', value: projects.length, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map(s => (
          <div key={s.label} className={`card border-0 ${s.bg}`}>
            <p className={`text-xl lg:text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Task Distribution</h3>
          {taskDistData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={taskDistData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`} fontSize={11}>
                  {taskDistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No tasks yet</div>
          )}
        </div>
      </div>

      {/* Hours Per Week Chart */}
      <div className="card mb-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Hours Worked Per Week</h3>
        {hoursPerWeek.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hoursPerWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id.week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip formatter={(v) => [`${v}h`, 'Hours']} />
              <Bar dataKey="totalHours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">No hours data yet. Submit daily reports to track hours.</div>
        )}
      </div>

      {/* Projects & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">My Projects ({projects.length})</h3>
          <div className="space-y-2">
            {projects.length === 0 && <p className="text-gray-400 text-sm">No projects assigned</p>}
            {projects.map(p => (
              <div key={p._id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <span className={`${statusColor(p.status)} flex-shrink-0`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Recent Reports ({recentReports.length})</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {recentReports.length === 0 && <p className="text-gray-400 text-sm">No recent reports</p>}
            {recentReports.map(r => (
              <div key={r._id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{formatDate(r.date)}</p>
                  <p className="text-xs text-gray-400">{r.hoursWorked}h · {r.status}</p>
                </div>
                <div className="flex-shrink-0">
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


