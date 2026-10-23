import React from 'react';
import { Calendar, Flower2 } from 'lucide-react';
import { type CalendarEvent } from '../types';

interface EventCardProps {
  event?: CalendarEvent | null;
  onClick?: () => void;
}

/**
 * Card 2: Upcoming Event Card (UpcomingEventCard)
 * Exactly matching Viora design tokens:
 * - Container: Full width, background #CBEA97, border-radius 9999px (Pill shape), padding 14px
 * - Layout (Flex row, align center):
 *   - Left Date Badge: Circle 46px x 46px, background #000000, flex col, center
 *     - Day: #FFFFFF, 16px, 700, line-height 1.1
 *     - Month: rgba(255, 255, 255, 0.7), 12px, 500, uppercase
 *     - Empty state: Spa / Lotus icon in the black badge
 *   - Middle Content (Flex-1, margin-left 14px, overflow hidden):
 *     - Event Title: #000000, 20px, 500, truncate, line-height 1.1
 *     - Event Time: rgba(0, 0, 0, 0.6), 13px, 400, line-height 1.1, mt-2px
 *   - Right Action Button: Circle 40px x 40px, background rgba(0, 0, 0, 0.08), flex center,
 *     contains Calendar icon (size 18px, color rgba(0, 0, 0, 0.7))
 */
export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const hasEvent = Boolean(event && event.title);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="w-full rounded-[9999px] bg-[#CBEA97] text-black p-[14px] flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all select-none shadow-sm font-sans"
    >
      {/* Left Date Badge */}
      <div className="w-[46px] h-[46px] rounded-full bg-[#000000] text-white flex flex-col items-center justify-center shrink-0">
        {hasEvent ? (
          <>
            <span className="text-[16px] font-[700] leading-[1.1] text-[#FFFFFF]">
              {event!.day || '19'}
            </span>
            <span className="text-[12px] font-[500] uppercase leading-[1.1] text-white/70">
              {event!.month || 'OCT'}
            </span>
          </>
        ) : (
          <Flower2 className="w-[20px] h-[20px] text-[#FFFFFF]" />
        )}
      </div>

      {/* Middle Content */}
      <div className="flex-1 ml-[14px] overflow-hidden text-left min-w-0">
        <div className="text-[20px] font-[500] text-[#000000] truncate leading-[1.1]">
          {hasEvent ? event!.title : 'Clear Schedule'}
        </div>
        <div className="text-[13px] font-[400] text-black/60 truncate leading-[1.1] mt-[2px]">
          {hasEvent ? event!.time : 'Time is yours to command'}
        </div>
      </div>

      {/* Right Action Button */}
      <div className="w-[40px] h-[40px] rounded-full bg-black/[0.08] flex items-center justify-center shrink-0 ml-[10px]">
        <Calendar className="w-[18px] h-[18px] text-black/70" />
      </div>
    </div>
  );
};
