export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4 lg:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 text-xs lg:text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
