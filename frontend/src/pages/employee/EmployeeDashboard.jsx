import { useEffect, useState } from 'react';
import { getEmployeeDashboard, updateProjectProgress } from '../../services/api';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { formatDate, statusColor, priorityColor } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FolderKanban, CheckSquare, Clock, FileText,
  AlertCircle, TrendingUp, Plus, Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressModal, setProgressModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    getEmployeeDashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleProgressSave = async () => {
    if (!progressModal) return;
    setSaving(true);
    try {
      await updateProjectProgress(progressModal.project._id, {
        completionPercentage: progressModal.value
      });
      toast.success(`Progress updated to ${progressModal.value}%`);
      setProgressModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!data) return null;

  const { stats, myProjects, myTasks, recentReports, overdueTasks, taskTrend } = data;

  const trendData = taskTrend.map(t => ({ date: t._id, tasks: t.count }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{greeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 text-xs lg:text-sm mt-0.5 flex flex-wrap gap-1">
          {user?.employeeId && <span>{user.employeeId}</span>}
          {user?.department && <><span>·</span><span>{user.department}</span></>}
          {user?.designation && <><span>·</span><span>{user.designation}</span></>}
        </p>
      </div>

      {/* Today's report alert */}
      {!stats.todayReportSubmitted && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-800 text-sm">Daily report not submitted yet</p>
              <p className="text-xs text-orange-600">Don't forget to submit today's work report.</p>
            </div>
          </div>
          <Link to="/employee/reports" className="btn-primary text-sm self-start sm:self-auto flex-shrink-0">
            Submit Now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 lg:mb-6">
        <StatCard title="My Projects" value={stats.totalProjects} icon={FolderKanban} color="blue" />
        <StatCard title="In Progress" value={stats.inProgressTasks} icon={TrendingUp} color="indigo" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={Clock} color="yellow" />
        <StatCard title="Completed" value={stats.completedTasks} icon={CheckSquare} color="green" />
        <StatCard title="Weekly Hours" value={`${stats.weeklyHours}h`} icon={Clock} color="purple" subtitle="Last 7 days" />
        <StatCard title="Reports" value={stats.totalReports} icon={FileText} color="teal" />
        <StatCard title="Overdue" value={stats.overdueTasksCount} icon={AlertCircle} color="red" />
        <StatCard title="Today's Report" value={stats.todayReportSubmitted ? '✓ Done' : '✗ Missing'} icon={FileText} color={stats.todayReportSubmitted ? 'green' : 'orange'} />
      </div>

      {/* Task trend */}
      {trendData.length > 0 && (
        <div className="card mb-4 lg:mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tasks Completed (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* My Projects — with inline progress update */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">My Projects</h3>
            <Link to="/employee/projects" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {myProjects.length === 0 && <p className="text-gray-400 text-sm">No projects assigned</p>}
            {myProjects.slice(0, 5).map(p => {
              const pct = p.completionPercentage ?? 0;
              return (
                <div key={p._id} className="py-2 border-b border-gray-50 last:border-0">
                  {/* Name + status row */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="font-medium text-gray-900 text-sm truncate flex-1">{p.name}</p>
                    <span className={`${statusColor(p.status)} flex-shrink-0`}>{p.status}</span>
                  </div>
                  {/* Due date */}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {formatDate(p.deadline)}</span>
                  </div>
                  {/* Progress bar + update button */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-orange-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-8 text-right flex-shrink-0">{pct}%</span>
                    <button
                      onClick={() => setProgressModal({ project: p, value: pct })}
                      className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                    >
                      <TrendingUp className="w-3 h-3" />
                      Update
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue / Upcoming Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              {overdueTasks.length > 0 ? (
                <span className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />Overdue ({overdueTasks.length})
                </span>
              ) : 'Upcoming Tasks'}
            </h3>
            <Link to="/employee/tasks" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(overdueTasks.length > 0 ? overdueTasks : myTasks.filter(t => t.status !== 'completed')).slice(0, 5).map(t => (
              <div key={t._id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{t.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.project?.name} · Due: {formatDate(t.dueDate)}</p>
                </div>
                <span className={`${priorityColor(t.priority)} flex-shrink-0`}>{t.priority}</span>
              </div>
            ))}
            {myTasks.filter(t => t.status !== 'completed').length === 0 && (
              <p className="text-gray-400 text-sm">No pending tasks 🎉</p>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Recent Reports</h3>
            <Link to="/employee/reports" className="flex items-center gap-1 btn-primary text-sm">
              <Plus className="w-3.5 h-3.5" /> New Report
            </Link>
          </div>

          {/* Mobile: card list */}
          <div className="lg:hidden space-y-2">
            {recentReports.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No reports yet</p>}
            {recentReports.map(r => (
              <div key={r._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.project?.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(r.date)} · {r.hoursWorked}h</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <span className={`badge-${r.status === 'completed' ? 'green' : r.status === 'blocked' ? 'red' : 'blue'}`}>{r.status}</span>
                  {r.adminReview?.reviewed ? <span className="badge-green">✓</span> : <span className="badge-yellow">…</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Project</th>
                  <th className="pb-2 font-medium">Hours</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Review</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400">No reports submitted yet</td></tr>
                )}
                {recentReports.map(r => (
                  <tr key={r._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-600">{formatDate(r.date)}</td>
                    <td className="py-2.5 text-gray-900 font-medium">{r.project?.name}</td>
                    <td className="py-2.5 text-gray-600">{r.hoursWorked}h</td>
                    <td className="py-2.5">
                      <span className={`badge-${r.status === 'completed' ? 'green' : r.status === 'blocked' ? 'red' : 'blue'}`}>{r.status}</span>
                    </td>
                    <td className="py-2.5">
                      {r.adminReview?.reviewed
                        ? <span className="badge-green">Reviewed</span>
                        : <span className="badge-yellow">Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Progress Update Modal */}
      <Modal
        isOpen={!!progressModal}
        onClose={() => setProgressModal(null)}
        title="Update Project Progress"
        size="sm"
      >
        {progressModal && (
          <div className="space-y-5">
            <div>
              <p className="font-semibold text-gray-900">{progressModal.project.name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{progressModal.project.projectId}</p>
            </div>

            {/* Big percentage display */}
            <div className="text-center py-3">
              <p className="text-5xl font-bold text-blue-600">{progressModal.value}%</p>
              <p className="text-sm text-gray-400 mt-1">Completion</p>
            </div>

            {/* Slider */}
            <div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressModal.value}
                onChange={e => setProgressModal(m => ({ ...m, value: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>

            {/* Quick select */}
            <div className="flex flex-wrap gap-2">
              {[0, 10, 25, 50, 75, 90, 100].map(v => (
                <button
                  key={v}
                  onClick={() => setProgressModal(m => ({ ...m, value: v }))}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    progressModal.value === v
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>

            {/* Preview bar */}
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  progressModal.value >= 100 ? 'bg-green-500'
                  : progressModal.value >= 70 ? 'bg-blue-500'
                  : progressModal.value >= 40 ? 'bg-yellow-500'
                  : 'bg-orange-400'
                }`}
                style={{ width: `${progressModal.value}%` }}
              />
            </div>

            {progressModal.value === 100 && (
              <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                ✓ Setting to 100% will automatically mark this project as <strong>completed</strong>.
              </p>
            )}
            {progressModal.value > 0 && progressModal.value < 100 && progressModal.project.status === 'planning' && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                ℹ Setting progress will automatically move status to <strong>active</strong>.
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setProgressModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleProgressSave}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


