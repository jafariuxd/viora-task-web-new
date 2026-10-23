import React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface EmptyStateProps {
  icon: LucideIcon;
  iconBadgeClass?: string;
  iconClass?: string;
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  iconBadgeClass = 'bg-viora-neonLime/10 border-viora-neonLime/25 text-viora-neonLime',
  iconClass = 'w-6 h-6',
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
  compact = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-[28px] border border-white/5 bg-[#141417]/80 backdrop-blur-sm text-center flex flex-col items-center justify-center max-w-md mx-auto ${
        compact ? 'p-6 my-4' : 'p-8 sm:p-10 my-6'
      } ${className}`}
    >
      {/* Icon Badge */}
      <div
        className={`rounded-2xl border flex items-center justify-center mb-3.5 shadow-sm ${
          compact ? 'w-11 h-11' : 'w-14 h-14'
        } ${iconBadgeClass}`}
      >
        <Icon className={iconClass} />
      </div>

      {/* Title & Description */}
      <h3 className="text-white text-[17px] sm:text-[18px] font-bold tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="text-zinc-400 text-[13px] sm:text-[13.5px] leading-relaxed max-w-sm mb-5">
        {description}
      </p>

      {/* Call To Action Buttons */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="h-11 px-5 rounded-full bg-viora-neonLime text-black font-extrabold text-[13px] sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(180,255,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {primaryAction.icon && (
                <primaryAction.icon className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="h-11 px-4 rounded-full bg-white/5 hover:bg-white/10 active:scale-[0.98] text-zinc-300 hover:text-white border border-white/10 text-[12.5px] sm:text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
