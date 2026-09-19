export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    teal: 'bg-teal-50 text-teal-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs lg:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-xl lg:text-3xl font-bold text-gray-900 mt-0.5 lg:mt-1 leading-tight">{value ?? '-'}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
            <Icon className="w-4 h-4 lg:w-6 lg:h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
