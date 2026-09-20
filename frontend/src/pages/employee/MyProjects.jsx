import { useEffect, useState } from 'react';
import { getProjects, getTasks, updateProjectProgress } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { formatDate, statusColor, priorityColor } from '../../utils/helpers';
import { Calendar, Users, CheckSquare, FolderKanban, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskCounts, setTaskCounts] = useState({});
  const [progressModal, setProgressModal] = useState(null); // { project, value }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data);
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
    } catch { }
    finally { setLoading(false); }
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
            const pct = p.completionPercentage ?? (tc.total > 0 ? Math.round((tc.completed / tc.total) * 100) : 0);
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
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                )}

                {/* Progress bar + update button */}
                <div className="mb-3">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{pct}%</span>
                      <button
                        onClick={() => setProgressModal({ project: p, value: pct })}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium hover:underline"
                      >
                        <TrendingUp className="w-3 h-3" />
                        Update
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-orange-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {formatDate(p.deadline)}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    {tc.completed}/{tc.total} tasks
                  </span>
                </div>

                {p.assignedEmployees?.length > 0 && (
                  <div className="flex items-center gap-1 pt-2 border-t border-gray-50">
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
            <div className="text-center py-4">
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
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Quick select buttons */}
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

            {/* Progress bar preview */}
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  progressModal.value >= 100 ? 'bg-green-500' : progressModal.value >= 70 ? 'bg-blue-500' : progressModal.value >= 40 ? 'bg-yellow-500' : 'bg-orange-400'
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
                ℹ Setting progress above 0% will automatically move status to <strong>active</strong>.
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
