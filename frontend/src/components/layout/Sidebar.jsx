import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, Users, Building2, GitBranch,
  FileText, DollarSign, Calendar, Settings, LogOut,
  ChevronLeft, ChevronRight, Activity, Bell, BarChart3,
  Briefcase, Package, ShoppingCart, Plane
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/requests', icon: ClipboardList, label: 'My Requests' },
    ]
  },
  {
    label: 'Submit',
    roles: ['Employee', 'Manager', 'HR', 'Finance', 'Admin', 'Super Admin'],
    items: [
      { to: '/app/submit/leave', icon: Calendar, label: 'Leave Request' },
      { to: '/app/submit/expense', icon: DollarSign, label: 'Expense Report' },
      { to: '/app/submit/travel', icon: Plane, label: 'Travel Request' },
      { to: '/app/submit/purchase', icon: ShoppingCart, label: 'Purchase Approval' },
      { to: '/app/submit/asset', icon: Package, label: 'Asset Request' },
      { to: '/app/submit/document', icon: FileText, label: 'Document Approval' },
    ]
  },
  {
    label: 'Approvals',
    roles: ['Manager', 'HR', 'Finance', 'Admin', 'Super Admin'],
    items: [
      { to: '/app/approvals', icon: Activity, label: 'Approval Queue' },
    ]
  },
  {
    label: 'HR',
    roles: ['HR', 'Admin', 'Super Admin'],
    items: [
      { to: '/hr/employees', icon: Users, label: 'Employees' },
      { to: '/hr/departments', icon: Building2, label: 'Departments' },
    ]
  },
  {
    label: 'Finance',
    roles: ['Finance', 'Admin', 'Super Admin'],
    items: [
      { to: '/finance/reports', icon: BarChart3, label: 'Reports & Export' },
    ]
  },
  {
    label: 'Admin',
    roles: ['Admin', 'Super Admin'],
    items: [
      { to: '/admin/users', icon: Users, label: 'Manage Users' },
      { to: '/app/admin/workflows', icon: GitBranch, label: 'Workflow Builder' },
      { to: '/admin/audit', icon: Briefcase, label: 'Audit Logs' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ]
  }
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRole = user?.role || '';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const filteredGroups = navGroups.filter(g =>
    !g.roles || g.roles.includes(userRole)
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <span className="font-semibold text-sm text-slate-900 dark:text-white whitespace-nowrap">
                  WorkFlow Pro
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-5">
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="sidebar-group-label"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            <ul className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
                    }
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-2 space-y-0.5 flex-shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`sidebar-link w-full text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[66px] w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-50"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-slate-400" />
          : <ChevronLeft className="w-3 h-3 text-slate-400" />
        }
      </button>
    </motion.aside>
  );
}
