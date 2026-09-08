import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GitBranch, Mail, Loader2, ArrowLeft, CheckCircle, ShieldCheck, Sparkles, BarChart3 } from 'lucide-react';
import { forgotPassword } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: GitBranch,  text: 'Multi-step approval workflows' },
  { icon: ShieldCheck, text: 'Role-based access control' },
  { icon: BarChart3,  text: 'Real-time analytics & reporting' },
  { icon: Sparkles,   text: 'Automated routing & notifications' },
];

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
      toast.success('Reset link generated!');
    } else {
      toast.error('Could not find this email address');
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-ink-950">
      {/* Left brand panel */}
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
            Reset your password.
          </h1>
          <p className="text-white/70 mt-4 text-sm leading-relaxed max-w-md">
            Enter the email associated with your account and we'll send you a secure link to reset your password.
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

      {/* Right form panel */}
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
              <h2 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">Forgot your password?</h2>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1.5">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="form-group">
                  <label htmlFor="forgot-email" className="input-label">Work email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      className="input pl-10"
                      placeholder="you@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : 'Send reset link'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-5">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Check your inbox</h2>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">
                  A password reset link has been sent to{' '}
                  <span className="font-semibold text-ink-700 dark:text-ink-300">{email}</span>.
                </p>
                <p className="text-xs text-ink-400 dark:text-ink-500 mt-4">
                  (In development, check the server logs for the link.)
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-ink-200 dark:border-ink-800 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
