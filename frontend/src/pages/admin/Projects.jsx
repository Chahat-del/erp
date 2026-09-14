import { useEffect, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject, getEmployees } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, statusColor, priorityColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Users, Calendar, Search } from 'lucide-react';

const emptyForm = {
  name: '', description: '', client: '', department: '',
  startDate: '', deadline: '', priority: 'medium', status: 'planning',
  assignedEmployees: []
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const [pRes, eRes] = await Promise.all([getProjects(params), getEmployees({ isActive: 'true' })]);
      setProjects(pRes.data);
      setEmployees(eRes.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const openAdd = () => { setEditProject(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => {
    setEditProject(p);
    setForm({
      name: p.name, description: p.description || '', client: p.client || '',
      department: p.department || '',
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      deadline: p.deadline ? p.deadline.slice(0, 10) : '',
      priority: p.priority, status: p.status,
      assignedEmployees: p.assignedEmployees?.map(ae => ({ employee: ae.employee?._id || ae.employee, role: ae.role })) || []
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProject) {
        await updateProject(editProject._id, form);
        toast.success('Project updated');
      } else {
        await createProject(form);
        toast.success('Project created');
      }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const toggleEmployee = (empId) => {
    const exists = form.assignedEmployees.find(ae => ae.employee === empId);
    if (exists) {
      setForm({ ...form, assignedEmployees: form.assignedEmployees.filter(ae => ae.employee !== empId) });
    } else {
      setForm({ ...form, assignedEmployees: [...form.assignedEmployees, { employee: empId, role: 'member' }] });
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} projects`}
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Project</button>}
      />

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input sm:w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.length === 0 && (
            <div className="col-span-3 card text-center text-gray-400 py-12">No projects found</div>
          )}
          {projects.map(p => (
            <div key={p._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-blue-600">{p.projectId}</span>
                    <span className={priorityColor(p.priority)}>{p.priority}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                  {p.client && <p className="text-xs text-gray-400 mt-0.5">Client: {p.client}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {p.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>}

              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span><span>{p.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${p.completionPercentage}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Deadline: {formatDate(p.deadline)}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.assignedEmployees?.length || 0} members</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={statusColor(p.status)}>{p.status}</span>
                <div className="flex -space-x-1">
                  {p.assignedEmployees?.slice(0, 4).map(ae => (
                    <div key={ae._id} className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border border-white" title={ae.employee?.name}>
                      {ae.employee?.name?.[0] || '?'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProject ? 'Edit Project' : 'New Project'} size="xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Project Name *</label>
              <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Client</label>
              <input className="input" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="label">Start Date *</label>
              <input type="date" className="input" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Deadline *</label>
              <input type="date" className="input" required value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Assign Employees */}
          <div>
            <label className="label">Assign Employees</label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {employees.map(emp => {
                const assigned = form.assignedEmployees.find(ae => ae.employee === emp._id);
                return (
                  <label key={emp._id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={!!assigned} onChange={() => toggleEmployee(emp._id)} className="rounded" />
                      <span className="text-sm">{emp.name}</span>
                      <span className="text-xs text-gray-400">{emp.employeeId}</span>
                    </div>
                    {assigned && (
                      <select
                        className="text-xs border border-gray-200 rounded px-1 py-0.5"
                        value={assigned.role}
                        onChange={e => setForm({
                          ...form,
                          assignedEmployees: form.assignedEmployees.map(ae =>
                            ae.employee === emp._id ? { ...ae, role: e.target.value } : ae
                          )
                        })}
                      >
                        <option value="member">Member</option>
                        <option value="lead">Lead</option>
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="tester">Tester</option>
                      </select>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editProject ? 'Update' : 'Create Project'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
