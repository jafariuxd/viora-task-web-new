import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { getCalendarDaysDiff, formatDueDateText } from '../utils/deadlineUtils';

interface DatePickerBottomSheetProps {
  currentDueDateText: string;
  currentDaysLeft: number;
  currentDeadlineMillis?: number;
  onDismiss: () => void;
  onSelect: (dueDateText: string, daysLeft: number, deadlineMillis: number) => void;
}

export function DatePickerBottomSheet({
  currentDaysLeft,
  currentDeadlineMillis,
  onDismiss,
  onSelect,
}: DatePickerBottomSheetProps) {
  // Mode: 'quick' (Page 9) or 'calendar' (Page 8)
  const [viewMode, setViewMode] = useState<'quick' | 'calendar'>('quick');

  // Calendar State (Page 8)
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    if (currentDeadlineMillis) return new Date(currentDeadlineMillis);
    const d = new Date();
    d.setDate(d.getDate() + (typeof currentDaysLeft === 'number' ? currentDaysLeft : 3));
    return d;
  });

  const [displayYear, setDisplayYear] = useState(calendarDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(calendarDate.getMonth()); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate days in current month
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayIndex = new Date(displayYear, displayMonth, 1).getDay();

  const handleSelectDays = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    const calculatedDaysLeft = getCalendarDaysDiff(target);
    const formattedText = formatDueDateText(target);
    const deadlineMillis = target.getTime();
    onSelect(formattedText, calculatedDaysLeft, deadlineMillis);
    onDismiss();
  };

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((prev) => prev - 1);
    } else {
      setDisplayMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((prev) => prev + 1);
    } else {
      setDisplayMonth((prev) => prev + 1);
    }
  };

  const handleCalendarDayClick = (dayNum: number) => {
    const newDate = new Date(displayYear, displayMonth, dayNum, 23, 59, 59);
    setCalendarDate(newDate);
  };

  const handleConfirmCalendar = () => {
    const calculatedDaysLeft = getCalendarDaysDiff(calendarDate);
    const formattedText = formatDueDateText(calendarDate);
    const deadlineMillis = calendarDate.getTime();
    onSelect(formattedText, calculatedDaysLeft, deadlineMillis);
    onDismiss();
  };

  const today = new Date();
  const isSelectedDay = (dayNum: number) => {
    return (
      calendarDate.getDate() === dayNum &&
      calendarDate.getMonth() === displayMonth &&
      calendarDate.getFullYear() === displayYear
    );
  };

  const isToday = (dayNum: number) => {
    return (
      today.getDate() === dayNum &&
      today.getMonth() === displayMonth &&
      today.getFullYear() === displayYear
    );
  };

  const formattedHeaderDate = calendarDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 font-['SF_Pro_Display',-apple-system,sans-serif]"
      onClick={onDismiss}
    >
      <AnimatePresence mode="wait">
        {viewMode === 'quick' ? (
          /* ========================================================
             QUICK PRESET SHEET (Page 9)
             ======================================================== */
          <motion.div
            key="quick"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="w-full max-w-md bg-[#222226] border-t md:border border-white/10 rounded-t-[36px] md:rounded-[36px] p-6 max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 shrink-0" />

            {/* Presets List (Page 9) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleSelectDays(1)}
                className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-white/40 text-[15px] font-bold w-7">1d</span>
                <span className="text-white text-[17px] font-medium">Tomorrow</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDays(2)}
                className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-white/40 text-[15px] font-bold w-7">2d</span>
                <span className="text-white text-[17px] font-medium">Next 2 days</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDays(7)}
                className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-white/40 text-[15px] font-bold w-7">1w</span>
                <span className="text-white text-[17px] font-medium">Next week</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDays(14)}
                className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-white/40 text-[15px] font-bold w-7">2w</span>
                <span className="text-white text-[17px] font-medium">Next 2 week</span>
              </button>

              {/* Choose date... (opens calendar dialog Page 8) */}
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className="w-full flex items-center gap-4 py-4 px-3 rounded-2xl hover:bg-white/5 transition-colors text-left border-t border-white/10 mt-2"
              >
                <CalendarIcon className="w-5 h-5 text-white/60" />
                <span className="text-white text-[17px] font-medium">Choose date...</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ========================================================
             MATERIAL 3 CALENDAR MODAL (Page 8)
             ======================================================== */
          <motion.div
            key="calendar"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-[#2C2C2E] border border-white/10 rounded-[32px] p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Page 8) */}
            <div>
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider block">
                Select date
              </span>
              <div className="flex items-center justify-between mt-1">
                <h3 className="text-white text-[28px] font-bold tracking-tight">
                  {formattedHeaderDate}
                </h3>
                <Edit2 className="w-4 h-4 text-white/50" />
              </div>
            </div>

            {/* Month & Year navigation (Page 8) */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-white text-[15px] font-semibold flex items-center gap-1">
                {monthNames[displayMonth]} {displayYear} ▾
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days of Week (Page 8) */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-white/40 py-1">
              {daysOfWeek.map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-sm font-semibold">
              {/* Empty placeholder cells */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const selected = isSelectedDay(dayNum);
                const currentDay = isToday(dayNum);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleCalendarDayClick(dayNum)}
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center transition-all ${
                      selected
                        ? 'bg-[#F9E498] text-black font-extrabold shadow-md scale-105'
                        : currentDay
                        ? 'border border-[#F9E498] text-[#F9E498] font-bold'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Footer Buttons (Page 8) */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('quick')}
                className="px-4 py-2 text-white/70 hover:text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCalendar}
                className="px-5 py-2 rounded-full bg-[#F9E498] text-black font-bold text-sm hover:opacity-95 transition-all shadow-md"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
