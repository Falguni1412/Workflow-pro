import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { fetchDashboardStats } from '../store/slices/requestSlice';
import { StatCard, SkeletonStatCard } from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

// Corporate palette for charts
const CHART_COLORS = {
  pending:  '#f59e0b',
  approved: '#059669',
  rejected: '#dc2626',
  areaFill: '#2563eb',
};

const areaChartData = [
  { month: 'Mar', requests: 24 },
  { month: 'Apr', requests: 38 },
  { month: 'May', requests: 31 },
  { month: 'Jun', requests: 45 },
  { month: 'Jul', requests: 52 },
  { month: 'Aug', requests: 41 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(state => state.requests);
  const { user } = useSelector(state => state.auth);

  useEffect(() => { dispatch(fetchDashboardStats()); }, [dispatch]);

  const pieData = [
    { name: 'Pending',  value: stats?.pending  || 0, color: CHART_COLORS.pending  },
    { name: 'Approved', value: stats?.approved || 0, color: CHART_COLORS.approved },
    { name: 'Rejected', value: stats?.rejected || 0, color: CHART_COLORS.rejected },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="page-header">
        <h1 className="page-title">
          {greeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="page-subtitle">
          Here's your workflow overview for{' '}
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Pending"
              value={stats?.pending ?? '—'}
              icon={Clock}
              iconBg="bg-amber-50 dark:bg-amber-900/20"
              trendLabel="Awaiting action"
              trend="neutral"
              iconColor="text-amber-600 dark:text-amber-400"
            />
            <StatCard
              title="Approved"
              value={stats?.approved ?? '—'}
              icon={CheckCircle}
              iconBg="bg-emerald-50 dark:bg-emerald-900/20"
              trendLabel="Fully completed"
              trend="up"
              iconColor="text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              title="Rejected"
              value={stats?.rejected ?? '—'}
              icon={XCircle}
              iconBg="bg-rose-50 dark:bg-rose-900/20"
              trendLabel="Review required"
              trend="down"
              iconColor="text-rose-600 dark:text-rose-400"
            />
            <StatCard
              title="Total Requests"
              value={((stats?.pending ?? 0) + (stats?.approved ?? 0) + (stats?.rejected ?? 0)) || '—'}
              icon={ClipboardList}
              iconBg="bg-corporate-50 dark:bg-corporate-900/20"
              trendLabel="All time"
              trend="neutral"
              iconColor="text-corporate-600 dark:text-corporate-400"
            />
          </>
        )}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Request Volume — Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaChartData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={CHART_COLORS.areaFill} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS.areaFill} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.45 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.45 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke={CHART_COLORS.areaFill}
                strokeWidth={2}
                fill="url(#colorReqs)"
                dot={{ fill: CHART_COLORS.areaFill, r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Status Breakdown</h2>
          {(stats?.pending || stats?.approved || stats?.rejected) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span className="text-xs text-slate-500 dark:text-slate-400">{v}</span>}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">No data yet</div>
          )}
        </div>
      </motion.div>

      {/* Recent Requests + Activity Feed */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Recent Requests</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="skeleton h-3.5 w-36 rounded" />
                  <div className="skeleton h-3.5 w-16 rounded ml-auto" />
                </div>
              ))
            ) : stats?.recentRequests?.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">No requests submitted yet</div>
            ) : (
              stats?.recentRequests?.map(r => (
                <div key={r.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.employee?.name} · {r.type}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Recent Activity</h2>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex gap-3">
                  <div className="skeleton w-2 h-2 rounded-full mt-1.5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-48 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                  </div>
                </div>
              ))
            ) : stats?.recentActivities?.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">No activity yet</div>
            ) : (
              stats?.recentActivities?.map(a => (
                <div key={a.id} className="px-5 py-3.5 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-corporate-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{a.user?.name}</span>
                      {' — '}
                      {a.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
