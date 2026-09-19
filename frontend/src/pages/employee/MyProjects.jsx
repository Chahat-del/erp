import { useEffect, useState } from 'react';
import { getProjects, getTasks } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, statusColor, priorityColor } from '../../utils/helpers';
import { Calendar, Users, CheckSquare, FolderKanban } from 'lucide-react';

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskCounts, setTaskCounts] = useState({});

  useEffect(() => {
    getProjects()
      .then(async res => {
        setProjects(res.data);
        // Get task counts per project
        const counts = {};
        await Promise.all(res.data.map(async p => {
          try {
            const t = await getTasks({ project: p._id });
            counts[p._id] = {
              total: t.data.length,
              completed: t.data.filter(x => x.status === 'completed').length
            };
          } catch { counts[p._id] = { total: 0, completed: 0 }; }
        }));
        setTaskCounts(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="p-4 lg:p-8">
      <PageHeader title="My Projects" subtitle={`${projects.length} assigned projects`} />

      {projects.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No projects assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => {
            const tc = taskCounts[p._id] || { total: 0, completed: 0 };
            const pct = tc.total > 0 ? Math.round((tc.completed / tc.total) * 100) : p.completionPercentage;
            const myRole = p.assignedEmployees?.find(() => true)?.role || 'member';

            return (
              <div key={p._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{p.projectId}</span>
                      <span className={priorityColor(p.priority)}>{p.priority}</span>
                      <span className="badge-purple capitalize">{myRole}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                    {p.client && <p className="text-xs text-gray-400 mt-0.5">Client: {p.client}</p>}
                  </div>
                  <span className={`${statusColor(p.status)} flex-shrink-0 mt-1`}>{p.status}</span>
                </div>

                {p.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                )}

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 40 ? 'bg-blue-500' : 'bg-orange-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Deadline: {formatDate(p.deadline)}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    {tc.completed}/{tc.total} tasks
                  </span>
                </div>

                {p.assignedEmployees?.length > 0 && (
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                    <Users className="w-3 h-3 text-gray-400" />
                    <div className="flex -space-x-1">
                      {p.assignedEmployees.slice(0, 5).map(ae => (
                        <div
                          key={ae._id}
                          title={ae.employee?.name}
                          className="w-5 h-5 rounded-full bg-blue-500 border border-white flex items-center justify-center text-white text-xs"
                        >
                          {ae.employee?.name?.[0] || '?'}
                        </div>
                      ))}
                    </div>
                    <span className="text-gray-400 text-xs ml-1">{p.assignedEmployees.length} members</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

