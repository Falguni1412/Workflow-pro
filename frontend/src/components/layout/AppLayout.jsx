import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 256;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Navbar sidebarWidth={sidebarWidth} />

      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
