import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployee, getTasks, getReports, getPerformance } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, getInitials, avatarColor, statusColor, priorityColor } from '../../utils/helpers';
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEmployee(id),
      getTasks({ assignedTo: id }),
      getReports({ employeeId: id }),
      getPerformance(id),
    ]).then(([e, t, r, p]) => {
      setEmployee(e.data);
      setTasks(t.data);
      setReports(r.data);
      setPerf(p.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!employee) return <div className="p-8 text-gray-400">Employee not found</div>;

  return (
    <div className="p-4 lg:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Profile Header — stacked on mobile, side-by-side on desktop */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ${avatarColor(employee.name)}`}>
            {getInitials(employee.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{employee.name}</h1>
              <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{employee.employeeId}</span>
              {employee.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}
            </div>
            <p className="text-gray-500 text-sm">{employee.designation}{employee.department && ` · ${employee.department}`}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{employee.email}</span>
              {employee.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{employee.phone}</span>}
              {employee.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{employee.address}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {formatDate(employee.joiningDate)}</span>
            </div>
            {employee.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {employee.skills.map(s => <span key={s} className="badge-blue">{s}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      {perf && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Completion Rate', value: `${perf.performance.completionRate}%`, color: 'text-blue-600' },
            { label: 'On Time', value: perf.performance.completedOnTime, color: 'text-green-600' },
            { label: 'Total Reports', value: perf.performance.totalReports, color: 'text-purple-600' },
            { label: 'Hours Logged', value: `${perf.performance.totalHoursWorked}h`, color: 'text-orange-600' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Hours Per Week Chart */}
      {perf?.hoursPerWeek?.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Hours Worked Per Week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={perf.hoursPerWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id.week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="totalHours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tasks & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Assigned Tasks ({tasks.length})</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {tasks.length === 0 && <p className="text-gray-400 text-sm">No tasks</p>}
            {tasks.map(t => (
              <div key={t._id} className="py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.project?.name}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                    <span className={priorityColor(t.priority)}>{t.priority}</span>
                    <span className={statusColor(t.status)}>{t.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Reports ({reports.length})</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {reports.length === 0 && <p className="text-gray-400 text-sm">No reports submitted</p>}
            {reports.map(r => (
              <div key={r._id} className="py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.project?.name}</p>
                  <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(r.date)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{r.workDescription}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{r.hoursWorked}h</span>
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
