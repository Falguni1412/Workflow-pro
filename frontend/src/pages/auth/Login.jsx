import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GitBranch, Loader2, CheckCircle2, ShieldCheck, BarChart3, Sparkles } from 'lucide-react';
import { loginUser, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: GitBranch,  text: 'Multi-step approval workflows' },
  { icon: ShieldCheck, text: 'Role-based access control' },
  { icon: BarChart3,  text: 'Real-time analytics & reporting' },
  { icon: Sparkles,   text: 'Automated routing & notifications' },
];

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPw, setShowPw] = useState(false);

  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name}!`);
    } else {
      toast.error(result.payload || 'Login failed');
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
            Streamline your<br />
            enterprise workflows.
          </h1>
          <p className="text-slate-300 mt-4 text-sm leading-relaxed max-w-md">
            One platform to submit, route, approve, and audit every business request —
            from leave and expenses to assets and travel.
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
        {/* Top bar — mobile logo + register link */}
        <div className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-md bg-navy-700 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">WorkFlow Pro</span>
          </div>
          <div className="hidden lg:block" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-corporate-600 dark:text-corporate-400 font-medium hover:underline">
              Create one
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
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Sign in</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Enter your credentials to access the platform.
              </p>
            </div>

            {/* Demo credentials */}
            <details className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <summary className="px-4 py-2.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400 select-none">
                Demo credentials
              </summary>
              <div className="px-4 pb-3 pt-1 text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                <div>employee@enterprise.com</div>
                <div>manager@enterprise.com</div>
                <div>hr@enterprise.com</div>
                <div>admin@enterprise.com</div>
                <div className="pt-1 text-slate-500">Password: Password123!</div>
              </div>
            </details>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label htmlFor="login-email" className="input-label">Work email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password" className="input-label">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-corporate-600 focus:ring-corporate-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-corporate-600 dark:text-corporate-400 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

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
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
              By signing in, you agree to the Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
