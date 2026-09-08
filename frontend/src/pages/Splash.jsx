import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';

const SPLASH_KEY = 'workflowpro.splashSeen';

/**
 * First-visit splash screen. Shown once per browser (localStorage flag).
 * After ~3.3s, auto-routes to /login, or /app/dashboard if already authenticated.
 * Returning visitors (refresh) skip straight to login/dashboard.
 */
export default function Splash() {
  const navigate = useNavigate();

  const goNext = useCallback(() => {
    const token = localStorage.getItem('authToken');
    navigate(token ? '/app/dashboard' : '/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const alreadySeen = localStorage.getItem(SPLASH_KEY);

    if (alreadySeen) {
      // Returning visitor — skip splash
      goNext();
      return;
    }

    // First visit this browser — show splash, then mark seen
    const timer = setTimeout(() => {
      localStorage.setItem(SPLASH_KEY, '1');
      goNext();
    }, 3300);

    return () => clearTimeout(timer);
  }, [goNext]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center auth-panel overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
          <GitBranch className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      {/* Wordmark */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="relative mt-7 text-3xl font-semibold text-white tracking-tight"
      >
        WorkFlow Pro
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="relative mt-2 text-sm text-slate-300"
      >
        Enterprise Workflow Automation Platform
      </motion.p>

      {/* Loading dots — corporate blue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="relative mt-10 flex items-center gap-2"
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
            className="w-1.5 h-1.5 rounded-full bg-corporate-400"
          />
        ))}
      </motion.div>
    </div>
  );
}
