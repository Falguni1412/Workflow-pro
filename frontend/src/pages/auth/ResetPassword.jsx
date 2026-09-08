import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GitBranch, Loader2, CheckCircle, ShieldCheck, Sparkles, BarChart3 } from 'lucide-react';
import { resetPassword } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: GitBranch,  text: 'Multi-step approval workflows' },
  { icon: ShieldCheck, text: 'Role-based access control' },
  { icon: BarChart3,  text: 'Real-time analytics & reporting' },
  { icon: Sparkles,   text: 'Automated routing & notifications' },
];

export default function ResetPassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 8) return toast.error('Password must be at least 8 characters');

    const result = await dispatch(resetPassword({ token, newPassword: form.newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      setSuccess(true);
      toast.success('Password reset successfully!');
    } else {
      toast.error('Invalid or expired reset token');
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-ink-950">
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-2/5 xl:w-[42%] auth-panel flex-col justify-between p-12 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white/10 border border-white/15 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-base">WorkFlow Pro</p>
            <p className="text-white/60 text-xs">Enterprise Suite</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-3xl xl:text-4xl font-semibold text-white leading-tight">
            Choose a new password.
          </h1>
          <p className="text-white/70 mt-4 text-sm leading-relaxed max-w-md">
            Pick something strong — at least 8 characters. After resetting, you'll be signed out everywhere.
          </p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/80">
                <span className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-xs text-white/50">© {new Date().getFullYear()} WorkFlow Pro · v1.0</div>
      </motion.aside>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-ink-200 dark:border-ink-800">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-md bg-ink-900 dark:bg-white flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white dark:text-ink-900" />
            </div>
            <span className="font-semibold text-ink-900 dark:text-ink-100 text-sm">WorkFlow Pro</span>
          </div>
          <div className="hidden lg:block" />
          <Link to="/login" className="text-sm text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition-colors">
            ← Back to sign in
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">Set a new password</h2>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1.5">
                Your new password must be at least 8 characters.
              </p>
            </div>

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="form-group">
                  <label htmlFor="reset-new" className="input-label">New password</label>
                  <div className="relative">
                    <input
                      id="reset-new"
                      type={showPw ? 'text' : 'password'}
                      required
                      className="input pr-10"
                      placeholder="Min. 8 characters"
                      value={form.newPassword}
                      onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-600"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reset-confirm" className="input-label">Confirm password</label>
                  <input
                    id="reset-confirm"
                    type="password"
                    required
                    className="input"
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
                    : 'Reset password'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-5">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Password updated</h2>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-2 mb-6">
                  Your password has been reset. Sign in with your new credentials.
                </p>
                <Link to="/login" className="btn-primary">Go to sign in</Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
