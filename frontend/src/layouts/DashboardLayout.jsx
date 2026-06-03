import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRefresh } from '../context/RefreshContext';
import { 
  CheckSquare, 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Bell,
  RotateCcw,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('habit_flow_theme') || 'dark');
  const { addToast } = useToast();
  const { signalRefresh } = useRefresh();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const knownNotifIds = React.useRef(new Set());
  const isFirstFetch = React.useRef(true);

  // Sync theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('habit_flow_theme', theme);
  }, [theme]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications?unreadOnly=true');
        const newNotifs = res.data;
        newNotifs.forEach(n => {
          if (!knownNotifIds.current.has(n.id)) {
            knownNotifIds.current.add(n.id);
            if (!isFirstFetch.current) {
              addToast(n.title, n.message);
            }
          }
        });
        setNotifications(newNotifs);
        isFirstFetch.current = false;
      } catch (err) {
        // Log notification errors silently
      }
    };
    if (user) {
      knownNotifIds.current = new Set();
      isFirstFetch.current = true;
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetProgress = async () => {
    setResetLoading(true);
    try {
      await api.post('/user/reset-progress');
      setShowResetModal(false);
      addToast('Progress Reset', 'Progress reset successfully. Start your journey again from today.');
      signalRefresh();
      navigate('/today');
    } catch (err) {
      addToast('Reset Failed', err.response?.data?.message || 'Failed to reset progress.');
    } finally {
      setResetLoading(false);
    }
  };

  const navItems = [
    { label: 'Today', path: '/today', icon: CheckSquare },
    { label: 'Schedule', path: '/schedule', icon: Calendar },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-lightbg dark:bg-darkbg text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200 dark:border-slate-800 p-6 z-20">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/today')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-xl shadow-premium neon-glow-primary">
            H
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-sans">
              HabitFlow
            </h1>
            <span className="text-xs text-slate-400 font-medium">SaaS Platform</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary text-primary font-semibold shadow-soft' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-red-500 font-medium transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Top Header / Nav for Mobile & Tablet */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-slate-200 dark:border-slate-800 z-30">
        <div className="flex items-center gap-2" onClick={() => navigate('/today')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-premium">
            H
          </div>
          <span className="font-extrabold text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            HabitFlow
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={logout} className="p-2 hover:bg-red-500/15 rounded-xl text-red-500 transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        
        {/* Universal Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-slate-800 glass-panel">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans capitalize">
              {location.pathname.replace('/', '')} Screen
            </h2>
            <p className="text-xs text-slate-400">Welcome back, {user?.name || 'User'}</p>
          </div>

          <div className="flex items-center gap-5">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-soft"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>

            {/* Notification Indicator */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifDrawer(prev => !prev)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-soft relative"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-red-500 border border-white dark:border-slate-800 pulse-glow animate-ping" />
                )}
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-red-500 border border-white dark:border-slate-800" />
                )}
              </button>

              {/* Notification Modal — portaled to body to escape parent stacking contexts */}
              {showNotifDrawer && ReactDOM.createPortal(
                <>
                  <div
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[9999]"
                    onClick={() => setShowNotifDrawer(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-24 md:top-32 left-1/2 -translate-x-1/2 w-full max-w-sm rounded-2xl glass-card border border-slate-200 dark:border-slate-800 p-4 shadow-premium text-sm z-[9999]"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-100">Unread Alerts</span>
                      {notifications.length > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary font-bold hover:underline">
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-3">
                      {notifications.length === 0 ? (
                        <div className="text-center text-xs text-slate-400 py-6">
                          No unread notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="font-semibold block text-xs text-primary">{notif.title}</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>,
                document.body
              )}
            </div>

            {/* Reset Progress Button */}
            <button
              onClick={() => setShowResetModal(true)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-soft"
              title="Reset Progress"
            >
              <RotateCcw size={18} className="text-slate-500 dark:text-slate-400" />
            </button>

            {/* Profile Avatar Bar */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <img 
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                alt="Avatar"
                className="w-10 h-10 rounded-xl object-cover border-2 border-primary/40 shadow-soft"
              />
              <div className="text-left">
                <span className="font-bold text-sm block">{user?.name || 'Arun Kumar'}</span>
                <span className="text-xs text-slate-400 font-medium">Premium tier</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body Viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Inspired by Reference Design) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 py-3 px-6 glass-panel border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-30 shadow-premium">
          {navItems.slice(0, 3).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-primary scale-110' : 'text-slate-400'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('/settings')}
            className={`flex flex-col items-center gap-1 transition-all ${
              location.pathname === '/settings' ? 'text-primary scale-110' : 'text-slate-400'
            }`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </nav>

      </div>
      {/* Reset Progress Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-premium"
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Reset Progress</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Are you sure you want to reset your progress?
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                  Your habits will remain unchanged.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-6 text-left text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1.5">The following data will be cleared:</p>
                  <p>• Completion History</p>
                  <p>• Current Streaks</p>
                  <p>• Longest Streaks</p>
                  <p>• Weekly Progress</p>
                  <p>• Monthly Analytics</p>
                  <p>• Heatmap Data</p>
                  <p>• Consistency Trend Data</p>
                  <p>• Dashboard Statistics</p>
                  <p className="font-semibold text-red-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  disabled={resetLoading}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  disabled={resetLoading}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Progress'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DashboardLayout;
