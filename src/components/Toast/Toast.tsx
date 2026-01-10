import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { hideToast } from '@/store/slices/uiSlice';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'bg-green-500/10 border-green-500/50 text-green-500',
  error: 'bg-red-500/10 border-red-500/50 text-red-500',
  info: 'bg-blue-500/10 border-blue-500/50 text-blue-500',
};

export function Toaster() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toast);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, dispatch]);

  const Icon = icons[toast.type];

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg bg-background',
              colors[toast.type]
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium text-foreground">{toast.message}</span>
            <button
              onClick={() => dispatch(hideToast())}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
