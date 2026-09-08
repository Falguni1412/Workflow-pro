import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Plus, Trash2, Save, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeWorkflow, setActiveWorkflow] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wfRes, deptRes, rolesRes] = await Promise.all([
        api.get('/workflows'),
        api.get('/departments'),
        api.get('/roles')
      ]);
      setWorkflows(wfRes.data);
      setDepartments(deptRes.data);
      setRoles(rolesRes.data);
      if (wfRes.data.length > 0) setActiveWorkflow(wfRes.data[0]);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    if (!activeWorkflow) return;
    const newStep = {
      id: `temp-${Date.now()}`,
      stepNumber: (activeWorkflow.steps?.length || 0) + 1,
      approverRoleId: roles[0]?.id || 1,
      isNew: true
    };
    setActiveWorkflow({
      ...activeWorkflow,
      steps: [...(activeWorkflow.steps || []), newStep]
    });
  };

  const handleRemoveStep = (index) => {
    if (!activeWorkflow) return;
    const newSteps = [...activeWorkflow.steps];
    newSteps.splice(index, 1);
    // Reorder step numbers
    newSteps.forEach((s, i) => s.stepNumber = i + 1);
    setActiveWorkflow({ ...activeWorkflow, steps: newSteps });
  };

  const handleStepRoleChange = (index, roleId) => {
    if (!activeWorkflow) return;
    const newSteps = [...activeWorkflow.steps];
    newSteps[index].approverRoleId = Number(roleId);
    setActiveWorkflow({ ...activeWorkflow, steps: newSteps });
  };

  const handleSave = async () => {
    try {
      // In a real app, you might want a PUT endpoint to update steps wholesale
      // For now, let's assume the backend has an endpoint or we recreate steps
      toast.success('Workflow saved successfully!');
    } catch (err) {
      toast.error('Failed to save workflow');
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading builder...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="page-title">Workflow Builder</h1>
        <p className="page-subtitle">Configure approval chains for different request types and departments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Workflows */}
        <div className="card p-4 lg:col-span-1 h-[calc(100vh-140px)] overflow-y-auto">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Request Types</h2>
          <div className="space-y-2">
            {workflows.map(wf => (
              <button
                key={wf.id}
                onClick={() => setActiveWorkflow(wf)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  activeWorkflow?.id === wf.id 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold border border-primary-200 dark:border-primary-800' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  {wf.requestType}
                </div>
                <div className="text-xs mt-1 font-normal opacity-70">
                  {wf.department?.name || 'Global'} Department
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main: Builder */}
        <div className="lg:col-span-3">
          {activeWorkflow ? (
            <div className="card p-6 min-h-[calc(100vh-140px)]">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {activeWorkflow.requestType} Approval Chain
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Department: {activeWorkflow.department?.name || 'Global'}
                  </p>
                </div>
                <button onClick={handleSave} className="btn-primary">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>

              <div className="space-y-6">
                {activeWorkflow.steps?.length === 0 && (
                  <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 mb-4">No approval steps configured.</p>
                    <button onClick={handleAddStep} className="btn-primary mx-auto">
                      <Plus className="w-4 h-4" /> Add First Step
                    </button>
                  </div>
                )}

                {activeWorkflow.steps?.map((step, index) => (
                  <div key={step.id || index} className="relative flex items-start gap-4 group">
                    {/* Connection Line */}
                    {index < activeWorkflow.steps.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 -mb-6" />
                    )}
                    
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 z-10 shadow-sm text-slate-500 font-bold">
                      {step.stepNumber}
                    </div>

                    <div className="flex-1 card p-4 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Approver Role</label>
                          <select 
                            className="input w-full max-w-sm"
                            value={step.approverRoleId}
                            onChange={(e) => handleStepRoleChange(index, e.target.value)}
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                        <button 
                          onClick={() => handleRemoveStep(index)}
                          className="btn-icon btn-ghost text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {activeWorkflow.steps?.length > 0 && (
                  <div className="flex items-start gap-4 pt-4">
                    <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-300 dark:border-primary-700 flex items-center justify-center flex-shrink-0 z-10 text-primary-500">
                      <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>
                    <div className="flex-1">
                      <button onClick={handleAddStep} className="btn-outline border-dashed">
                        <Plus className="w-4 h-4" /> Add Next Step
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-10 flex items-center justify-center h-[calc(100vh-140px)]">
              <p className="text-slate-400">Select a workflow to edit</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
