import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, Search, ChevronDown, User, Settings, GitBranch } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';
import { markAllRead } from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

export default function Navbar({ sidebarWidth }) {
  const { isDark, toggle } = useDarkMode();
  const { user } = useSelector(state => state.auth);
  const { items: notifications } = useSelector(state => state.notifications);
  const dispatch = useDispatch();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center h-14 px-4 gap-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
      style={{ left: sidebarWidth }}
    >
      {/* Logo — visible on medium+ screens */}
      <Link to="/app/dashboard" className="hidden md:flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-700 mr-1">
        <div className="w-7 h-7 rounded-md bg-navy-700 flex items-center justify-center flex-shrink-0">
          <GitBranch className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-800 dark:text-white whitespace-nowrap">WorkFlow Pro</span>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-corporate-400 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-colors"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Dark Mode Toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        className="btn-icon btn-ghost"
        aria-label="Toggle dark mode"
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Moon className="w-4.5 h-4.5 text-slate-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Bell */}
      <div className="relative" ref={notifRef}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
          className="btn-icon btn-ghost relative"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-2 w-80 card shadow-enterprise overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllRead(user?.id))}
                    className="text-xs text-corporate-600 dark:text-corporate-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">No notifications yet</div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.is_read ? 'bg-corporate-50/50 dark:bg-corporate-900/10' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-corporate-500 mt-1.5 flex-shrink-0" />}
                        <div className={!n.is_read ? '' : 'ml-4'}>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          {n.created_at && (
                            <p className="text-xs text-slate-400 mt-1">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Dropdown */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-7 h-7 rounded-md bg-navy-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">{initials}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 leading-tight">{user?.role}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1.5 w-48 card shadow-enterprise overflow-hidden py-1"
            >
              <Link to="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <User className="w-4 h-4" />
                My Profile
              </Link>
              <Link to="/admin/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
