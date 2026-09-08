const STATUS_MAP = {
  Pending:   { cls: 'badge-pending',   dot: 'bg-amber-400',   label: 'Pending' },
  Approved:  { cls: 'badge-approved',  dot: 'bg-emerald-500', label: 'Approved' },
  Rejected:  { cls: 'badge-rejected',  dot: 'bg-rose-500',    label: 'Rejected' },
  Sent_Back: { cls: 'badge-sent-back', dot: 'bg-blue-400',    label: 'Sent Back' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { cls: 'badge bg-slate-100 text-slate-600', dot: 'bg-slate-400', label: status };
  return (
    <span className={cfg.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
