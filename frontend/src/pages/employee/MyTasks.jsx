import { useEffect, useState } from 'react';
import { getTasks, updateTaskStatus } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { formatDate, statusColor, priorityColor, priorityDot } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';

const STATUS_FLOW = ['todo', 'in-progress', 'review', 'completed'];

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [updateModal, setUpdateModal] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', actualHours: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      const res = await getTasks(params);
      setTasks(res.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterPriority]);

  const openUpdate = (task) => {
    setUpdateModal(task);
    setUpdateForm({ status: task.status, actualHours: task.actualHours || '' });
  };

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await updateTaskStatus(updateModal._id, updateForm);
      toast.success('Task updated');
      setUpdateModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const now = new Date();
  const grouped = {
    overdue: tasks.filter(t => new Date(t.dueDate) < now && !['completed', 'cancelled'].includes(t.status)),
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    review: tasks.filter(t => t.status === 'review'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  const groupConfig = [
    { key: 'overdue', label: 'Overdue', color: 'text-red-600', bg: 'bg-red-50 border-red-100', icon: AlertCircle },
    { key: 'todo', label: 'To Do', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100', icon: Clock },
    { key: 'in-progress', label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', icon: Clock },
    { key: 'review', label: 'In Review', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', icon: Clock },
    { key: 'completed', label: 'Completed', color: 'text-green-600', bg: 'bg-green-50 border-green-100', icon: CheckCircle },
  ];

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="My Tasks" subtitle={`${tasks.length} tasks assigned`} />

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <select className="input w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input w-40" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          {(filterStatus || filterPriority) && (
            <button onClick={() => { setFilterStatus(''); setFilterPriority(''); }} className="btn-secondary text-sm">Clear</button>
          )}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-6">
          {groupConfig.map(({ key, label, color, bg, icon: Icon }) => {
            const group = grouped[key];
            if (group.length === 0) return null;
            return (
              <div key={key}>
                <div className={`flex items-center gap-2 mb-3 ${color}`}>
                  <Icon className="w-4 h-4" />
                  <h3 className="font-semibold">{label} ({group.length})</h3>
                </div>
                <div className="space-y-2">
                  {group.map(task => (
                    <div key={task._id} className={`border rounded-xl p-4 ${bg} hover:shadow-sm transition-shadow`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot(task.priority)}`} />
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-500 mb-2 line-clamp-1">{task.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span>📁 {task.project?.name}</span>
                            <span>📅 Due: {formatDate(task.dueDate)}</span>
                            <span>🕐 Est: {task.estimatedHours || 0}h</span>
                            {task.actualHours > 0 && <span>✅ Actual: {task.actualHours}h</span>}
                            <span className="font-mono text-gray-400">{task.taskId}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={priorityColor(task.priority)}>{task.priority}</span>
                          <button
                            onClick={() => openUpdate(task)}
                            className="btn-secondary text-xs py-1 px-2.5"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="card text-center py-16 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tasks found.</p>
            </div>
          )}
        </div>
      )}

      {/* Update Status Modal */}
      <Modal isOpen={!!updateModal} onClose={() => setUpdateModal(null)} title="Update Task Status" size="sm">
        {updateModal && (
          <div className="space-y-4">
            <p className="font-medium text-gray-900">{updateModal.title}</p>
            <div>
              <label className="label">Status</label>
              <select className="input" value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}>
                {STATUS_FLOW.map(s => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="label">Actual Hours Worked</label>
              <input
                type="number"
                className="input"
                min="0"
                value={updateForm.actualHours}
                onChange={e => setUpdateForm({ ...updateForm, actualHours: e.target.value })}
                placeholder="e.g. 4"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setUpdateModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleStatusUpdate} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Update Task'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
