import { useEffect, useState } from 'react';
import { getAnnouncements } from '../services/api';
import { Megaphone, X, AlertTriangle, Bell, ChevronDown, ChevronUp } from 'lucide-react';

const DISMISSED_KEY = 'dismissed_announcements';

function getDismissed() {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
}

function addDismissed(id) {
  const dismissed = getDismissed();
  if (!dismissed.includes(id)) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, id]));
  }
}

const priorityConfig = {
  normal:    { bg: 'bg-blue-50 border-blue-200',    icon: Bell,          iconColor: 'text-blue-500',   text: 'text-blue-900'  },
  important: { bg: 'bg-yellow-50 border-yellow-300', icon: AlertTriangle, iconColor: 'text-yellow-600', text: 'text-yellow-900' },
  urgent:    { bg: 'bg-red-50 border-red-300',       icon: AlertTriangle, iconColor: 'text-red-500',    text: 'text-red-900'   },
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(getDismissed);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    getAnnouncements()
      .then(res => setAnnouncements(res.data))
      .catch(() => {}); // silently fail — don't block UI
  }, []);

  const visible = announcements.filter(a => !dismissed.includes(a._id));

  if (visible.length === 0) return null;

  const handleDismiss = (id) => {
    addDismissed(id);
    setDismissed(prev => [...prev, id]);
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="px-4 pt-4 lg:px-8 lg:pt-6 space-y-2">
      {visible.map(item => {
        const cfg = priorityConfig[item.priority] || priorityConfig.normal;
        const Icon = cfg.icon;
        const isLong = item.content.length > 120;
        const isExpanded = expanded[item._id];

        return (
          <div
            key={item._id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} transition-all`}
          >
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-semibold ${cfg.text}`}>{item.title}</p>
                {item.priority !== 'normal' && (
                  <span className={`text-xs font-medium capitalize px-1.5 py-0.5 rounded-full ${
                    item.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.priority}
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 leading-relaxed ${cfg.text} opacity-80 ${isLong && !isExpanded ? 'line-clamp-2' : 'whitespace-pre-line'}`}>
                {item.content}
              </p>
              {isLong && (
                <button
                  onClick={() => toggleExpand(item._id)}
                  className={`flex items-center gap-0.5 text-xs mt-1 font-medium ${cfg.iconColor} hover:opacity-80 transition-opacity`}
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-3 h-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> Read more</>
                  )}
                </button>
              )}
              <p className="text-xs mt-1 opacity-50">
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <button
              onClick={() => handleDismiss(item._id)}
              className={`p-1 rounded-lg hover:bg-black/10 transition-colors flex-shrink-0 ${cfg.iconColor} opacity-60 hover:opacity-100`}
              title="Dismiss"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
