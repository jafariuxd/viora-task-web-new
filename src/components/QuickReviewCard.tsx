import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskStatus } from '../types';

interface QuickReviewCardProps {
  onOpenQuickTasks: () => void;
  onOpenCompletedTasks: () => void;
}

export const QuickReviewCard: React.FC<QuickReviewCardProps> = ({
  onOpenQuickTasks,
  onOpenCompletedTasks,
}) => {
  const { activeTasks, completedCount } = useViora();

  // Active Quick Tasks that need triage/review
  const pendingQuickTasks = activeTasks.filter(
    (t) => t.tags?.includes('Quick Task') && t.status !== TaskStatus.DONE
  );
  const quickTasksCount = pendingQuickTasks.length;

  if (quickTasksCount === 0 && completedCount === 0) {
    return null;
  }

  // Priority 1: Unreviewed Quick Tasks
  if (quickTasksCount > 0) {
    return (
      <button
        type="button"
        onClick={onOpenQuickTasks}
        className="w-full h-[64px] rounded-[28px] bg-[#FEF08A] hover:brightness-102 active:scale-[0.99] text-[#2D1D00] px-5 flex items-center justify-between transition-all font-['SF_Pro_Display',-apple-system,sans-serif] shadow-sm"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Zap className="w-5 h-5 fill-[#2D1D00] stroke-[#2D1D00] shrink-0" />
          <span className="text-[16px] font-bold text-[#2D1D00] tracking-tight truncate">
            Review <strong className="font-extrabold">{quickTasksCount} quick task{quickTasksCount > 1 ? 's' : ''}</strong>
          </span>
        </div>

        {/* Dashed Circled Arrow Button */}
        <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#2D1D00]/40 flex items-center justify-center shrink-0 ml-2">
          <ArrowRight className="w-4 h-4 text-[#2D1D00]" />
        </div>
      </button>
    );
  }

  // Priority 2: Review Completed Tasks Stats
  return (
    <button
      type="button"
      onClick={onOpenCompletedTasks}
      className="w-full h-[64px] rounded-[28px] bg-[#FEF08A] hover:brightness-102 active:scale-[0.99] text-[#2D1D00] px-5 flex items-center justify-between transition-all font-['SF_Pro_Display',-apple-system,sans-serif] shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[16px] font-medium text-[#2D1D00] tracking-tight truncate">
          Review <strong className="font-extrabold">{completedCount} completed task{completedCount > 1 ? 's' : ''}</strong>
        </span>
      </div>

      {/* Dashed Circled Arrow Button */}
      <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#2D1D00]/50 flex items-center justify-center shrink-0 ml-2">
        <ArrowRight className="w-4.5 h-4.5 text-[#2D1D00]" />
      </div>
    </button>
  );
};
