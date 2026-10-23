import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ArrowRight, UserPlus } from 'lucide-react';
import type { PushToastPayload } from '../types';
import { useViora } from '../context/VioraContext';

interface PushToastBannerProps {
  toasts: PushToastPayload[];
  onDismiss: (id: string) => void;
}

export const PushToastBanner: React.FC<PushToastBannerProps> = ({ toasts, onDismiss }) => {
  const { navigate } = useViora();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-4 text-white shadow-2xl flex items-start gap-3.5 relative overflow-hidden group"
          >
            {/* Top accent glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B4FF00] via-lime-400 to-[#B4FF00]" />

            {/* Icon */}
            <div className="w-10 h-10 rounded-2xl bg-[#B4FF00]/15 text-[#B4FF00] border border-[#B4FF00]/30 flex items-center justify-center shrink-0 mt-0.5">
              {toast.type === 'INVITE' ? (
                <UserPlus className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Bell className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B4FF00] bg-[#B4FF00]/10 px-2 py-0.5 rounded-full border border-[#B4FF00]/20">
                  {toast.type === 'INVITE' ? 'Team Invite' : 'Notification'}
                </span>
                <span className="text-[10px] text-zinc-400">Just now</span>
              </div>

              <h4 className="text-sm font-bold text-white mt-1 leading-tight truncate">
                {toast.title}
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5 leading-snug line-clamp-2">
                {toast.body}
              </p>

              {/* Action link */}
              {toast.type === 'INVITE' && (
                <button
                  type="button"
                  onClick={() => {
                    onDismiss(toast.id);
                    navigate('notifications');
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-extrabold text-black bg-[#B4FF00] hover:bg-[#a0eb00] px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-md"
                >
                  View Invites <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
