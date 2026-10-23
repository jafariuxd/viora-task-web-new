import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useViora } from '../context/VioraContext';

export function TopBanner() {
  const { toastMessage, dismissToast } = useViora();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, dismissToast]);

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed top-4 left-0 right-0 z-[100] px-4 flex justify-center pointer-events-none"
        >
          <div className="bg-[#262626] border border-white/15 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-full backdrop-blur-md pointer-events-auto">
            {toastMessage.isError ? (
              <AlertCircle className="w-5 h-5 text-[#FF4B4B] shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-viora-neonLime shrink-0" />
            )}
            <span className="text-[15px] font-medium text-white flex-1 truncate">
              {toastMessage.message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
