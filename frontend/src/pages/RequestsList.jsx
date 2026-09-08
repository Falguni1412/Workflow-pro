import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { fetchRequests } from '../store/slices/requestSlice';
import StatusBadge from '../components/common/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

const REQUEST_TYPES = ['All', 'Leave', 'Expense', 'Travel', 'Purchase', 'Document', 'Asset'];
const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Sent_Back'];

export default function RequestsList() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(state => state.requests);
  const { user } = useSelector(state => state.auth);

  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchRequests({ filter: 'submitted' }));
  }, [dispatch]);

  const filtered = list.filter(r => {
    const matchType   = typeFilter === 'All'   || r.type === typeFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 page-header mb-0">
        <div className="flex-1">
          <h1 className="page-title">My Requests</h1>
          <p className="page-subtitle">Track and manage all your submitted workflow requests</p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/submit/leave" className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> New Request
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-36" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="input sm:w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container border-0">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Step</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-8 h-8 opacity-40" />
                      <p className="font-medium">No requests found</p>
                      <p className="text-xs">Try adjusting filters or submit a new request</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id}>
                    <td className="text-slate-400 text-xs">#{r.id}</td>
                    <td className="font-medium max-w-[200px] truncate">{r.title}</td>
                    <td>
                      <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{r.type}</span>
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-slate-500">Step {r.currentStepNumber}</td>
                    <td className="text-slate-400 text-xs whitespace-nowrap">
                      {r.createdAt ? formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }) : '—'}
                    </td>
                    <td>
                      <Link to={`/app/requests/${r.id}`} className="btn-ghost btn-sm text-primary-600 dark:text-primary-400">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
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
