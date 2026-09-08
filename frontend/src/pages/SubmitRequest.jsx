import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Upload, Calendar, DollarSign, Plane, FileText, Package, ShoppingCart } from 'lucide-react';
import { createRequest } from '../store/slices/requestSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const REQUEST_CONFIGS = {
  Leave: {
    icon: Calendar,
    color: 'from-amber-400 to-orange-500',
    label: 'Leave Request',
    description: 'Submit a leave application for approval',
    fields: [
      { name: 'leave_type', label: 'Leave Type', type: 'select', options: ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Unpaid Leave', 'Maternity Leave', 'Paternity Leave'] },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'total_days', label: 'Total Days', type: 'number', min: 1 },
    ]
  },
  Expense: {
    icon: DollarSign,
    color: 'from-emerald-400 to-teal-500',
    label: 'Expense Report',
    description: 'Submit expenses for reimbursement',
    fields: [
      { name: 'expense_category', label: 'Category', type: 'select', options: ['Travel', 'Meals', 'Accommodation', 'Office Supplies', 'Software', 'Training', 'Other'] },
      { name: 'amount', label: 'Amount (₹)', type: 'number', min: 0, step: '0.01' },
      { name: 'expense_date', label: 'Expense Date', type: 'date' },
      { name: 'vendor', label: 'Vendor / Merchant', type: 'text' },
    ]
  },
  Travel: {
    icon: Plane,
    color: 'from-blue-400 to-indigo-500',
    label: 'Travel Request',
    description: 'Request travel arrangements and approvals',
    fields: [
      { name: 'from_location', label: 'From Location', type: 'text' },
      { name: 'to_location', label: 'To Location', type: 'text' },
      { name: 'travel_date', label: 'Travel Date', type: 'date' },
      { name: 'return_date', label: 'Return Date', type: 'date' },
      { name: 'travel_purpose', label: 'Purpose of Travel', type: 'text' },
      { name: 'estimated_cost', label: 'Estimated Cost (₹)', type: 'number', min: 0 },
    ]
  },
  Purchase: {
    icon: ShoppingCart,
    color: 'from-violet-400 to-purple-500',
    label: 'Purchase Approval',
    description: 'Request purchase approval for goods or services',
    fields: [
      { name: 'item_name', label: 'Item / Service Name', type: 'text' },
      { name: 'quantity', label: 'Quantity', type: 'number', min: 1 },
      { name: 'unit_price', label: 'Unit Price (₹)', type: 'number', min: 0, step: '0.01' },
      { name: 'total_amount', label: 'Total Amount (₹)', type: 'number', min: 0 },
      { name: 'vendor_name', label: 'Vendor Name', type: 'text' },
      { name: 'required_by', label: 'Required By Date', type: 'date' },
    ]
  },
  Asset: {
    icon: Package,
    color: 'from-rose-400 to-pink-500',
    label: 'Asset Request',
    description: 'Request company assets or equipment',
    fields: [
      { name: 'asset_type', label: 'Asset Type', type: 'select', options: ['Laptop', 'Mobile Phone', 'Monitor', 'Headphones', 'Office Chair', 'Desk', 'Other Equipment'] },
      { name: 'quantity', label: 'Quantity', type: 'number', min: 1 },
      { name: 'reason', label: 'Reason for Request', type: 'text' },
      { name: 'required_date', label: 'Required By Date', type: 'date' },
    ]
  },
  Document: {
    icon: FileText,
    color: 'from-slate-400 to-slate-600',
    label: 'Document Approval',
    description: 'Submit documents for review and approval signature',
    fields: [
      { name: 'document_type', label: 'Document Type', type: 'select', options: ['Contract', 'Policy', 'Report', 'Agreement', 'Invoice', 'Letter', 'Other'] },
      { name: 'document_ref', label: 'Document Reference No.', type: 'text' },
      { name: 'version', label: 'Version', type: 'text' },
    ]
  }
};

export default function SubmitRequest({ requestType }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading } = useSelector(state => state.requests);

  const config = REQUEST_CONFIGS[requestType];
  const Icon = config?.icon || FileText;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState({});
  const [attachment, setAttachment] = useState(null);

  const handleDetailChange = (name, value) => {
    setDetails(d => ({ ...d, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!title.trim()) return toast.error('Title is required');

    const result = await dispatch(createRequest({
      type: requestType,
      title,
      description,
      details
    }));

    if (createRequest.fulfilled.match(result)) {
      const requestId = result.payload.id;

      // Upload attachment if any
      if (attachment) {
        const fd = new FormData();
        fd.append('attachment', attachment);
        try {
          await api.post(`/requests/${requestId}/attachments`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch {
          toast.error('Request created but file upload failed');
        }
      }

      toast.success('Request submitted successfully!');
      navigate('/app/requests');
    } else {
      toast.error(result.payload || 'Submission failed');
    }
  };

  if (!config) return <div className="text-slate-400">Unknown request type</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="page-title">{config.label}</h1>
          <p className="page-subtitle">{config.description}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Title */}
        <div className="form-group">
          <label className="input-label">Request Title *</label>
          <input
            type="text"
            required
            className="input"
            placeholder={`e.g., ${requestType} request for Q3 project`}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Dynamic Type-Specific Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.fields.map(field => (
            <div key={field.name} className={`form-group ${field.type === 'text' && field.name.includes('purpose') ? 'sm:col-span-2' : ''}`}>
              <label className="input-label">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  className="input"
                  value={details[field.name] || ''}
                  onChange={e => handleDetailChange(field.name, e.target.value)}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  min={field.min}
                  step={field.step}
                  className="input"
                  placeholder={field.label}
                  value={details[field.name] || ''}
                  onChange={e => handleDetailChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="input-label">Additional Notes</label>
          <textarea
            className="input min-h-[90px] resize-none"
            placeholder="Add any additional context or information..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Attachment */}
        <div className="form-group">
          <label className="input-label">Attachment (Optional)</label>
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-colors group">
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {attachment ? (
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">{attachment.name}</span>
              ) : (
                <span className="text-sm text-slate-400">Click to upload file (PDF, Image, Doc — Max 10MB)</span>
              )}
            </div>
            <input type="file" className="hidden" onChange={e => setAttachment(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx" />
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={actionLoading} className="btn-primary flex-1">
            {actionLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : `Submit ${config.label}`}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export { REQUEST_CONFIGS };
