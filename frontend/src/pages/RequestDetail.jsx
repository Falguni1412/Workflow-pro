import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, RotateCcw, MessageSquare,
  Paperclip, Clock, User, ChevronDown, Loader2, Send
} from 'lucide-react';
import { fetchRequestById, actionRequest, addComment, clearSelected } from '../store/slices/requestSlice';
import StatusBadge from '../components/common/StatusBadge';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

function WorkflowTimeline({ workflow, currentStep, approvals }) {
  if (!workflow?.steps) return null;
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Approval Progress</h3>
      <div className="space-y-0">
        {workflow.steps.map((step, idx) => {
          const approval = approvals?.find(a => a.stepNumber === step.stepNumber);
          const isComplete = approval?.status === 'Approved';
          const isRejected = approval?.status === 'Rejected' || approval?.status === 'Sent_Back';
          const isCurrent  = step.stepNumber === currentStep;
          const isPending  = !approval;

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10
                  ${isComplete ? 'bg-emerald-500 border-emerald-500' :
                    isRejected ? 'bg-rose-500 border-rose-500' :
                    isCurrent  ? 'bg-primary-500 border-primary-500 animate-pulse-soft' :
                                 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'}`}>
                  {isComplete ? <CheckCircle className="w-4 h-4 text-white" /> :
                   isRejected ? <XCircle    className="w-4 h-4 text-white" /> :
                   isCurrent  ? <Clock      className="w-4 h-4 text-white" /> :
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{step.stepNumber}</span>}
                </div>
                {idx < workflow.steps.length - 1 && (
                  <div className={`w-0.5 h-8 ${isComplete ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>
              <div className="pb-6 flex-1">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  Step {step.stepNumber}: {step.approverRole?.name || 'Approver'}
                </p>
                {approval ? (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {approval.status} by {approval.approver?.name || 'System'}
                    {approval.actionedAt ? ` · ${formatDistanceToNow(new Date(approval.actionedAt), { addSuffix: true })}` : ''}
                    {approval.comments && <span className="block italic mt-0.5">"{approval.comments}"</span>}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">{isCurrent ? 'Awaiting response...' : 'Not yet reached'}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RequestDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: request, loading, actionLoading } = useSelector(state => state.requests);
  const { user } = useSelector(state => state.auth);

  const [actionModal, setActionModal] = useState(null); // 'Approved' | 'Rejected' | 'Sent_Back'
  const [comment, setComment] = useState('');
  const [actionComment, setActionComment] = useState('');

  useEffect(() => {
    dispatch(fetchRequestById(id));
    return () => dispatch(clearSelected());
  }, [id, dispatch]);

  const handleAction = async () => {
    const result = await dispatch(actionRequest({ id, action: actionModal, comments: actionComment }));
    if (actionRequest.fulfilled.match(result)) {
      toast.success(`Request ${actionModal.toLowerCase()} successfully`);
      setActionModal(null);
      setActionComment('');
      dispatch(fetchRequestById(id));
    } else {
      toast.error('Action failed');
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    await dispatch(addComment({ requestId: id, commentText: comment }));
    setComment('');
    toast.success('Comment added');
  };

  const canAction = () => {
    if (!request || request.status !== 'Pending') return false;
    const userRole = user?.role;
    return ['Manager', 'HR', 'Finance', 'Admin', 'Super Admin'].includes(userRole);
  };

  if (loading || !request) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-icon mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">{request.title}</h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="page-subtitle">
            {request.type} Request · #{request.id} · Submitted by {request.employee?.name}
            {request.createdAt ? ` · ${format(new Date(request.createdAt), 'dd MMM yyyy')}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Details */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Request Details</h3>
            {request.description && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{request.description}</p>}
            <div className="grid grid-cols-2 gap-3">
              {request.details && Object.entries(request.details).map(([k, v]) => (
                <div key={k} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-xs text-slate-400 capitalize mb-0.5">{k.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{String(v)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Actions */}
          {canAction() && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Take Action</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActionModal('Approved')} className="btn-success">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => setActionModal('Rejected')} className="btn-danger">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button onClick={() => setActionModal('Sent_Back')} className="btn-outline">
                  <RotateCcw className="w-4 h-4" /> Send Back
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Comments ({request.comments?.length || 0})
            </h3>
            <div className="space-y-3 mb-4">
              {request.comments?.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">No comments yet. Be the first to comment.</p>
              )}
              {request.comments?.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-md bg-ink-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-white">{c.author?.name?.[0] || 'U'}</span>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.author?.name}</span>
                      <span className="text-xs text-slate-400">
                        {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{c.commentText}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Add a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
              />
              <button onClick={handleComment} disabled={!comment.trim()} className="btn-primary btn-icon">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Attachments */}
          {request.attachments?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Attachments ({request.attachments.length})
              </h3>
              <div className="space-y-2">
                {request.attachments.map(a => (
                  <a key={a.id} href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000'}${a.filePath}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{a.fileName}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Workflow Progress */}
        <div className="space-y-4">
          <WorkflowTimeline workflow={request.workflow} currentStep={request.currentStepNumber} approvals={request.approvals} />

          {/* Submitter Info */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Submitted By
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-ink-700 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">{request.employee?.name?.[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{request.employee?.name}</p>
                <p className="text-xs text-slate-400">{request.employee?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-md p-6">
              <h2 className="text-lg font-bold mb-2">
                {actionModal === 'Approved' ? '✅ Approve Request' : actionModal === 'Rejected' ? '❌ Reject Request' : '↩️ Send Back Request'}
              </h2>
              <p className="text-sm text-slate-500 mb-4">Add an optional comment before confirming this action.</p>
              <textarea
                className="input min-h-[80px] resize-none mb-4"
                placeholder="Add a comment (optional)..."
                value={actionComment}
                onChange={e => setActionComment(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setActionModal(null)} className="btn-secondary">Cancel</button>
                <button
                  onClick={handleAction}
                  disabled={actionLoading}
                  className={actionModal === 'Approved' ? 'btn-success' : actionModal === 'Rejected' ? 'btn-danger' : 'btn-outline'}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${actionModal === 'Sent_Back' ? 'Send Back' : actionModal}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
