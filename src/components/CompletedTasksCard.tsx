import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

interface CompletedTasksCardProps {
  count: number;
  isQuickTask?: boolean;
  onClick?: () => void;
}

/**
 * Card 5: Review Quick / Completed Tasks Card (CompletedTasksCard)
 * Exactly matching Viora design specifications:
 * - Container: Full width, fixed height 84px, background #FBE38A, border-radius 9999px (Pill shape), padding 0 24px
 * - Layout (Flex between, align center, height 100%):
 *   - Left Text (Flex row, gap 4px, align center):
 *     - "Review": rgba(0, 0, 0, 0.5), 20px, 400
 *     - Task count: #000000, 20px, 700 (e.g. "3 quick tasks" or "5 completed tasks")
 *   - Right Action Button:
 *     - Circle 48px x 48px, flex center
 *     - Border: 1.5px dashed #000000
 *     - Icon: Bolt (quick tasks) or ArrowRight (completed tasks), size 24px, #000000
 */
export const CompletedTasksCard: React.FC<CompletedTasksCardProps> = ({
  count,
  isQuickTask = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="w-full h-[84px] rounded-[9999px] bg-[#FBE38A] px-[24px] flex items-center justify-between select-none cursor-pointer transition-all active:scale-[0.99] font-sans shadow-sm"
    >
      {/* Left Text */}
      <div className="flex items-center gap-[4px] leading-tight min-w-0">
        <span className="text-black/50 text-[20px] font-[400]">Review</span>
        <span className="text-[#000000] text-[20px] font-[700] truncate">
          {isQuickTask
            ? `${count} quick ${count === 1 ? 'task' : 'tasks'}`
            : `${count} completed ${count === 1 ? 'task' : 'tasks'}`}
        </span>
      </div>

      {/* Right Action Button: 48px circle with 1.5px dashed border */}
      <div
        className="w-[48px] h-[48px] rounded-full border-[1.5px] border-dashed border-[#000000] flex items-center justify-center shrink-0 ml-[12px]"
      >
        {isQuickTask ? (
          <Zap className="w-[24px] h-[24px] text-[#000000] fill-[#000000]" />
        ) : (
          <ArrowRight className="w-[24px] h-[24px] text-[#000000] stroke-[2.2]" />
        )}
      </div>
    </div>
  );
};
