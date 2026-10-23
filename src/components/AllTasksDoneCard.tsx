import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

interface AllTasksDoneCardProps {
  onCreateTask?: () => void;
}

/**
 * Card 6: All Tasks Done Card (AllTasksDoneCard)
 * Displayed when all tasks are completed / list is empty:
 * - Container: Full width, background #26262A (Charcoal), border 1px solid #38383E, border-radius 28px, padding 32px, flex col, align center
 * - Top Icon Container: Circle 80px x 80px, background #1E1E20, border 1px solid #2E2E32, flex center. Contains AutoAwesome/Sparkles icon (36px, #B4FF00 Neon Lime)
 * - Title (mt-28px): "You're all set.", color #FFFFFF, font size 28px, font-weight 800, letter-spacing -0.5px
 * - Subtitle (mt-12px): "Great work! Your list is empty. Take a break, or start planning what's next.", color #98989D, 16px, line-height 24px, max-width 300px
 * - Primary CTA Button (mt-36px): Full width, height 56px, background #B4FF00 (Neon Lime), text #000000, font-weight 700, 16px, border-radius 20px, flex center, gap 8px
 */
export const AllTasksDoneCard: React.FC<AllTasksDoneCardProps> = ({ onCreateTask }) => {
  return (
    <div className="w-full bg-[#26262A] border border-[#38383E] rounded-[28px] p-[32px] flex flex-col items-center text-center font-sans shadow-lg">
      {/* Top Icon Container */}
      <div className="w-[80px] h-[80px] rounded-full bg-[#1E1E20] border border-[#2E2E32] flex items-center justify-center shrink-0">
        <Sparkles className="w-[36px] h-[36px] text-[#B4FF00]" />
      </div>

      {/* Title (margin-top 28px) */}
      <h3 className="mt-[28px] text-[#FFFFFF] text-[28px] font-[800] tracking-[-0.5px] leading-tight">
        You&apos;re all set.
      </h3>

      {/* Subtitle (margin-top 12px) */}
      <p className="mt-[12px] text-[#98989D] text-[16px] leading-[24px] max-w-[300px]">
        Great work! Your list is empty. Take a break, or start planning what&apos;s next.
      </p>

      {/* Primary CTA Button (margin-top 36px) */}
      <button
        type="button"
        onClick={onCreateTask}
        className="mt-[36px] w-full h-[56px] bg-[#B4FF00] hover:bg-[#a3e800] active:scale-[0.98] text-[#000000] font-[700] text-[16px] rounded-[20px] flex items-center justify-center gap-[8px] transition-all shadow-md cursor-pointer"
      >
        <Plus className="w-[20px] h-[20px] stroke-[2.5]" />
        <span>Create New Task</span>
      </button>
    </div>
  );
};
