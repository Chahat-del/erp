import { useEffect, useState } from 'react';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Megaphone, AlertTriangle, Bell, BellOff } from 'lucide-react';

const emptyForm = { title: '', content: '', priority: 'normal' };

const priorityConfig = {
  normal:    { label: 'Normal',    badge: 'badge-blue',   icon: Bell },
  important: { label: 'Important', badge: 'badge-yellow', icon: AlertTriangle },
  urgent:    { label: 'Urgent',    badge: 'badge-red',    icon: AlertTriangle },
};

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements();
      setAnnouncements(res.data);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, content: item.content, priority: item.priority });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await updateAnnouncement(editItem._id, form);
        toast.success('Announcement updated');
      } else {
        await createAnnouncement(form);
        toast.success('Announcement posted — employees will see it now');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await updateAnnouncement(item._id, { ...item, isActive: !item.isActive });
      toast.success(item.isActive ? 'Announcement hidden from employees' : 'Announcement made visible');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement permanently?')) return;
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const active = announcements.filter(a => a.isActive);
  const inactive = announcements.filter(a => !a.isActive);

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="Announcements"
        subtitle={`${active.length} active • ${announcements.length} total`}
        action={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {announcements.length === 0 && (
            <div className="card text-center py-16 text-gray-400">
              <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No announcements yet</p>
              <p className="text-sm mt-1">Post an update and all employees will see it.</p>
            </div>
          )}

          {active.length > 0 && (
            <div className="space-y-3 mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active — visible to employees</h2>
              {active.map(item => (
                <AnnouncementCard
                  key={item._id}
                  item={item}
                  onEdit={openEdit}
                  onToggle={handleToggleActive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {inactive.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Hidden — not visible to employees</h2>
              {inactive.map(item => (
                <AnnouncementCard
                  key={item._id}
                  item={item}
                  onEdit={openEdit}
                  onToggle={handleToggleActive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Announcement' : 'New Announcement'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              required
              placeholder="e.g. Office closed on Friday"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Message *</label>
            <textarea
              className="input"
              rows={5}
              required
              placeholder="Write your announcement here..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Posting...' : editItem ? 'Update' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AnnouncementCard({ item, onEdit, onToggle, onDelete }) {
  const cfg = priorityConfig[item.priority] || priorityConfig.normal;
  const PriorityIcon = cfg.icon;

  return (
    <div className={`card transition-shadow hover:shadow-md ${!item.isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${
          item.priority === 'urgent' ? 'bg-red-50 text-red-500' :
          item.priority === 'important' ? 'bg-yellow-50 text-yellow-600' :
          'bg-blue-50 text-blue-500'
        }`}>
          <PriorityIcon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <span className={cfg.badge}>{cfg.label}</span>
            {!item.isActive && <span className="badge-gray">Hidden</span>}
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-line">{item.content}</p>
          <p className="text-xs text-gray-400 mt-2">
            Posted by {item.postedBy?.name || 'Admin'} · {formatDateTime(item.createdAt)}
          </p>
        </div>

        <div className="flex gap-1 ml-2 flex-shrink-0">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggle(item)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-yellow-600 transition-colors"
            title={item.isActive ? 'Hide from employees' : 'Show to employees'}
          >
            {item.isActive ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
