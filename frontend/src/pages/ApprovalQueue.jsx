import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Search, Filter, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { fetchRequests, actionRequest } from '../store/slices/requestSlice';
import StatusBadge from '../components/common/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function ApprovalQueue() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(state => state.requests);

  const [search, setSearch] = useState('');

  // Fetch pending requests that need my approval
  useEffect(() => {
    dispatch(fetchRequests({ filter: 'pending_approval' }));
  }, [dispatch]);

  const filtered = list.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.employee?.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleQuickAction = async (id, action) => {
    const result = await dispatch(actionRequest({ id, action, comments: 'Quick actioned from queue' }));
    if (actionRequest.fulfilled.match(result)) {
      toast.success(`Request ${action.toLowerCase()} successfully`);
      dispatch(fetchRequests({ filter: 'pending_approval' })); // refresh
    } else {
      toast.error('Action failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 page-header mb-0">
        <div className="flex-1">
          <h1 className="page-title">Approval Queue</h1>
          <p className="page-subtitle">Requests awaiting your review and action</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search by title or employee..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container border-0">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Request Title</th>
                <th>Type</th>
                <th>Employee</th>
                <th>Submitted</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="w-8 h-8 opacity-40 text-emerald-500" />
                      <p className="font-medium text-slate-700 dark:text-slate-300">You're all caught up!</p>
                      <p className="text-xs">No pending requests in your queue</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id}>
                    <td className="text-slate-400 text-xs">#{r.id}</td>
                    <td>
                      <Link to={`/app/requests/${r.id}`} className="font-medium text-primary-600 dark:text-primary-400 hover:underline max-w-[200px] truncate block">
                        {r.title}
                      </Link>
                    </td>
                    <td><span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{r.type}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-ink-700 flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-white">{r.employee?.name?.[0]}</span>
                        </div>
                        <span className="text-sm">{r.employee?.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-400 text-xs whitespace-nowrap">
                      {r.createdAt ? formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }) : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleQuickAction(r.id, 'Approved')} className="btn-icon btn-ghost text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleQuickAction(r.id, 'Rejected')} className="btn-icon btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleQuickAction(r.id, 'Sent_Back')} className="btn-icon btn-ghost text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Send Back">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
