import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface ConnectCalendarCardProps {
  onClick?: () => void;
}

/**
 * Card 3: Connect Calendar Card (ConnectCalendarCard)
 * Used when Google Calendar is not yet linked:
 * - Container: Full width, background #CBEA97, border-radius 9999px (Pill shape), padding 14px
 * - Layout (Flex between, align center):
 *   - Left (Flex row, align center, gap 14px):
 *     - Circle 46px x 46px, background #000000, contains white Calendar icon (24px)
 *     - Column: Title "Connect Calendar" (color #000000, 20px, 600), subtitle "Sync your agenda seamlessly" (rgba(0,0,0,0.6), 13px)
 *   - Right: Circle 40px x 40px, background rgba(0, 0, 0, 0.08), contains ArrowForward icon (18px, rgba(0, 0, 0, 0.7))
 */
export const ConnectCalendarCard: React.FC<ConnectCalendarCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="w-full rounded-[9999px] bg-[#CBEA97] text-black p-[14px] flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all select-none shadow-sm font-sans"
    >
      {/* Left zone */}
      <div className="flex items-center gap-[14px] min-w-0">
        <div className="w-[46px] h-[46px] rounded-full bg-[#000000] flex items-center justify-center shrink-0">
          <Calendar className="w-[24px] h-[24px] text-white" />
        </div>
        <div className="flex flex-col text-left min-w-0">
          <span className="text-[20px] font-[600] text-[#000000] leading-tight truncate">
            Connect Calendar
          </span>
          <span className="text-[13px] font-[400] text-black/60 leading-tight mt-[2px] truncate">
            Sync your agenda seamlessly
          </span>
        </div>
      </div>

      {/* Right Action Button */}
      <div className="w-[40px] h-[40px] rounded-full bg-black/[0.08] flex items-center justify-center shrink-0 ml-[10px]">
        <ArrowRight className="w-[18px] h-[18px] text-black/70" />
      </div>
    </div>
  );
};
