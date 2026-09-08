export function StatCard({ title, value, icon: Icon, iconBg, iconColor = 'text-corporate-600', trend, trendLabel }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-0.5 tabular-nums">{value ?? '—'}</p>
        {trendLabel && (
          <p className={`text-xs mt-0.5 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'}`}>
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="stat-card">
      <div className="skeleton w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-7 w-16 rounded" />
      </div>
    </div>
  );
}
