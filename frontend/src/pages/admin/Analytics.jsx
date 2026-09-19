import { useEffect, useState } from 'react';
import { getAdminDashboard, getEmployees, getPerformance } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getInitials, avatarColor } from '../../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [empPerf, setEmpPerf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [perfLoading, setPerfLoading] = useState(false);

  useEffect(() => {
    Promise.all([getAdminDashboard(), getEmployees({ isActive: 'true' })])
      .then(([d, e]) => { setDashboard(d.data); setEmployees(e.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEmp) { setEmpPerf(null); return; }
    setPerfLoading(true);
    getPerformance(selectedEmp)
      .then(r => setEmpPerf(r.data))
      .catch(() => {})
      .finally(() => setPerfLoading(false));
  }, [selectedEmp]);

  if (loading) return <LoadingSpinner fullPage />;

  const { stats, deptStats, tasksByMonth, hoursPerDay } = dashboard;

  const taskMonthData = tasksByMonth.map(t => ({
    month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
    completed: t.count
  }));

  const deptData = deptStats.map(d => ({ name: d._id || 'N/A', value: d.count }));

  const overallTaskData = [
    { name: 'Completed', value: stats.completedTasks, fill: '#10b981' },
    { name: 'In Progress', value: stats.inProgressTasks, fill: '#3b82f6' },
    { name: 'Pending', value: stats.pendingTasks, fill: '#f59e0b' },
  ];

  const projectData = [
    { name: 'Active', value: stats.activeProjects, fill: '#10b981' },
    { name: 'Completed', value: stats.completedProjects, fill: '#3b82f6' },
    { name: 'Other', value: stats.totalProjects - stats.activeProjects - stats.completedProjects, fill: '#d1d5db' },
  ];

  const empRadarData = empPerf ? [
    { subject: 'Task Completion', A: empPerf.performance.completionRate },
    { subject: 'On-time Delivery', A: empPerf.performance.totalTasks > 0 ? Math.round((empPerf.performance.completedOnTime / empPerf.performance.totalTasks) * 100) : 0 },
    { subject: 'Report Consistency', A: empPerf.performance.recentReports * (100 / 30) > 100 ? 100 : Math.round(empPerf.performance.recentReports * (100 / 22)) },
    { subject: 'Avg Daily Hours', A: Math.min(100, Math.round((parseFloat(empPerf.performance.avgDailyHours) / 8) * 100)) },
    { subject: 'Tasks Assigned', A: Math.min(100, empPerf.performance.totalTasks * 5) },
  ] : [];

  return (
    <div className="p-4 lg:p-8">
      <PageHeader title="Analytics" subtitle="Overall performance & insights" />

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
        {[
          { label: 'Total Employees', value: stats.totalEmployees, sub: `${stats.activeEmployees} active`, color: 'bg-blue-500' },
          { label: 'Total Projects', value: stats.totalProjects, sub: `${stats.activeProjects} active`, color: 'bg-green-500' },
          { label: 'Total Tasks', value: stats.totalTasks, sub: `${stats.completedTasks} done`, color: 'bg-purple-500' },
          { label: 'Total Reports', value: stats.totalReports, sub: `${stats.todayReports} today`, color: 'bg-orange-500' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-10 rounded-full flex-shrink-0 ${s.color}`} />
              <div className="min-w-0">
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs font-medium text-gray-600 truncate">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Task Completion Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={taskMonthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={overallTaskData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${value}`} fontSize={11}>
                {overallTaskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend formatter={(v) => v} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Project Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={projectData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" label={({ value }) => value} fontSize={11}>
                {projectData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Department-wise Headcount</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Hours Trend */}
      {hoursPerDay.length > 0 && (
        <div className="card mb-4 lg:mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Team Hours Logged — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hoursPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip />
              <Bar dataKey="totalHours" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Individual Employee Performance */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Individual Employee Performance</h3>
        <div className="mb-6">
          <label className="label">Select Employee</label>
          <select className="input w-full lg:max-w-xs" value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}>
            <option value="">Choose an employee...</option>
            {employees.map(e => (
              <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>
            ))}
          </select>
        </div>

        {perfLoading && <LoadingSpinner />}

        {empPerf && !perfLoading && (
          <div>
            {/* Employee Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${avatarColor(empPerf.employee.name)}`}>
                {getInitials(empPerf.employee.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">{empPerf.employee.name}</h4>
                <p className="text-sm text-gray-500 truncate">{empPerf.employee.designation} · {empPerf.employee.department}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center sm:ml-auto">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{empPerf.performance.completionRate}%</p>
                  <p className="text-xs text-gray-400">Completion</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{empPerf.performance.totalHoursWorked}h</p>
                  <p className="text-xs text-gray-400">Hours</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Radar Chart */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Performance Radar</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={empRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name={empPerf.employee.name} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Hours Per Week */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Hours Per Week</h4>
                {empPerf.hoursPerWeek.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={empPerf.hoursPerWeek}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="_id.week" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} width={30} />
                      <Tooltip formatter={(v) => [`${v}h`, 'Hours']} />
                      <Bar dataKey="totalHours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No hours data</div>
                )}
              </div>

              {/* Stats mini cards */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Tasks', value: empPerf.performance.totalTasks, color: 'text-blue-600' },
                  { label: 'On Time', value: empPerf.performance.completedOnTime, color: 'text-green-600' },
                  { label: 'Late', value: empPerf.performance.completedLate, color: 'text-red-600' },
                  { label: 'Avg Daily Hrs', value: `${empPerf.performance.avgDailyHours}h`, color: 'text-purple-600' },
                  { label: 'Total Reports', value: empPerf.performance.totalReports, color: 'text-orange-600' },
                  { label: 'Reports (30d)', value: empPerf.performance.recentReports, color: 'text-teal-600' },
                  { label: 'Projects', value: empPerf.projects.length, color: 'text-indigo-600' },
                  { label: 'Pending Tasks', value: empPerf.performance.taskStatusDist.todo, color: 'text-yellow-600' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!selectedEmp && !perfLoading && (
          <div className="text-center py-10 text-gray-400 text-sm">
            Select an employee to view their performance analytics
          </div>
        )}
      </div>
    </div>
  );
}


