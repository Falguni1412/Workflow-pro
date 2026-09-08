import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GitBranch, Loader2, ChevronDown, CheckCircle2, ShieldCheck, BarChart3, Sparkles } from 'lucide-react';
import { registerUser, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: GitBranch,  text: 'Multi-step approval workflows' },
  { icon: ShieldCheck, text: 'Role-based access control' },
  { icon: BarChart3,  text: 'Real-time analytics & reporting' },
  { icon: Sparkles,   text: 'Automated routing & notifications' },
];

// Roles kept in sync with backend Role model and Sidebar nav permissions
const ROLE_OPTIONS = [
  { value: 'Employee', label: 'Employee', hint: 'Submit and track requests' },
  { value: 'Manager',  label: 'Manager',  hint: 'Approve direct-report requests' },
  { value: 'HR',       label: 'HR',       hint: 'Manage leave, employees, departments' },
  { value: 'Finance',  label: 'Finance',  hint: 'Approve expenses, run reports' },
  { value: 'Admin',    label: 'Admin',    hint: 'Manage users, workflows, and settings' },
];

export default function Register() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Employee' });

  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created successfully!');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* ── Left brand panel ───────────────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-2/5 xl:w-[42%] auth-panel flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-base">WorkFlow Pro</p>
            <p className="text-slate-400 text-xs">Enterprise Suite</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <h1 className="text-3xl xl:text-4xl font-semibold text-white leading-tight">
            Your workflow,<br />
            built for scale.
          </h1>
          <p className="text-slate-300 mt-4 text-sm leading-relaxed max-w-md">
            Join hundreds of enterprises streamlining their operations with WorkFlow Pro.
            Set up your account in under two minutes.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-corporate-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative text-xs text-slate-400">
          © {new Date().getFullYear()} WorkFlow Pro · v1.0
        </div>
      </motion.aside>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-md bg-navy-700 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">WorkFlow Pro</span>
          </div>
          <div className="hidden lg:block" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-corporate-600 dark:text-corporate-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Create account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Get started with your free account today.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="reg-name" className="input-label">Full name</label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="reg-email" className="input-label">Work email</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="reg-password" className="input-label">Password</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    className="input pr-10"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="form-group">
                <label htmlFor="reg-role" className="input-label">Role</label>
                <div className="relative">
                  <select
                    id="reg-role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="input appearance-none pr-10 cursor-pointer"
                  >
                    {ROLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — {opt.hint}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  An administrator can update your role later.
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-400"
                >
                  {error}
                </motion.div>
              )}

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                  : 'Create account'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
              By creating an account, you agree to the Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
