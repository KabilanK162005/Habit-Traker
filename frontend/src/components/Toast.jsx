import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ReactDOM from 'react-dom';

const Toast = ({ toasts, removeToast }) => {
  return ReactDOM.createPortal(
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="pointer-events-auto glass-card rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-premium flex items-start gap-3"
    >
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{toast.title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <X size={14} className="text-slate-400" />
      </button>
    </motion.div>
  );
};

export default Toast;
