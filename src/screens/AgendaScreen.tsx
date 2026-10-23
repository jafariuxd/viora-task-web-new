import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar as CalendarIcon,
  Plus,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { UserAvatar } from '../components/UserAvatar';
import { EmptyState } from '../components/EmptyState';

export function AgendaScreen() {
  const {
    calendarEvents,
    addCalendarEvent,
    goBack,
  } = useViora();

  // View Mode: 'week' (Page 5), 'month' (Page 6), or 'timeline' (Page 26)
  const [calendarViewMode, setCalendarViewMode] = useState<'week' | 'month' | 'timeline'>('week');
  const [selectedDay, setSelectedDay] = useState(18);
  const [selectedMonth] = useState('November');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('10:00 am - 11:00 am');

  // Days of week (Saturday to Friday as shown in Page 5 & 6)
  const weekdays = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];

  // 1-week mode days (Page 5): 15 to 21 November
  const weekDaysList = [15, 16, 17, 18, 19, 20, 21];

  // Full Month mode days (Page 6): 1 to 30 November
  const allMonthDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCalendarEvent({
      day: String(selectedDay),
      month: 'Nov',
      title: newTitle.trim(),
      time: newTime,
      location: newDesc || 'Online meeting',
      isOnline: true,
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddEventModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-28 md:pb-12 pt-3 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto font-['SF_Pro_Display',-apple-system,sans-serif] relative">
      {/* 1. TOP APP BAR (Page 5 & 6) */}
      <div className="flex items-center justify-between py-2 mb-3">
        <button
          type="button"
          onClick={goBack}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Calendar Mode Switcher (Week / Month / Timeline) */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setCalendarViewMode('week')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              calendarViewMode === 'week'
                ? 'bg-viora-neonLime text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setCalendarViewMode('month')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              calendarViewMode === 'month'
                ? 'bg-viora-neonLime text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setCalendarViewMode('timeline')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              calendarViewMode === 'timeline'
                ? 'bg-viora-neonLime text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* 2. TITLE: Schedule & Month (Page 5 & 6) */}
      <div className="mb-4">
        <span className="text-zinc-400 text-[15px] font-medium block">Schedule</span>
        <div className="flex items-center justify-between mt-0.5">
          <h1 className="text-white text-[36px] font-extrabold tracking-tight">
            {selectedMonth}
          </h1>

          <button
            type="button"
            onClick={() =>
              setCalendarViewMode((prev) => (prev === 'week' ? 'month' : 'week'))
            }
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-viora-neonLime transition-all"
            title="Toggle Month Calendar"
          >
            <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* ========================================================
          3. CALENDAR STRIP / GRID
          ======================================================== */}
      {calendarViewMode !== 'timeline' && (
        <div className="mb-6 bg-[#121215] border border-white/10 rounded-[30px] p-4 shadow-xl">
          {/* Weekday headers: Sa Su Mo Tu We Th Fr */}
          <div className="grid grid-cols-7 text-center text-[13px] font-bold text-zinc-400 mb-3">
            {weekdays.map((w, idx) => (
              <div key={idx} className={idx === 6 ? 'text-red-400' : ''}>
                {w}
              </div>
            ))}
          </div>

          {calendarViewMode === 'week' ? (
            /* 1-Week Strip (Page 5) */
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDaysList.map((dayNum, idx) => {
                const isSelected = selectedDay === dayNum;
                const isFriday = idx === 6; // Friday is weekend red

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDay(dayNum)}
                    className={`w-11 h-11 mx-auto rounded-full flex flex-col items-center justify-center font-bold text-[16px] transition-all relative ${
                      isSelected
                        ? 'bg-viora-neonLime text-black shadow-lg scale-105'
                        : isFriday
                        ? 'bg-[#FF453A] text-white'
                        : 'bg-[#222226] text-white hover:bg-white/15'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-black -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Full Month 5-Week Grid (Page 6) */
            <div className="grid grid-cols-7 gap-y-2.5 gap-x-1 text-center">
              {allMonthDays.map((dayNum) => {
                const isSelected = selectedDay === dayNum;
                // Fridays in November 30 days grid: 7, 14, 21, 28
                const isFriday = [7, 14, 21, 28].includes(dayNum);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDay(dayNum)}
                    className={`w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center font-bold text-[15px] transition-all ${
                      isSelected
                        ? 'bg-viora-neonLime text-black shadow-lg scale-105'
                        : isFriday
                        ? 'bg-[#FF453A] text-white'
                        : 'bg-[#222226] text-white hover:bg-white/15'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-black -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          4. EVENTS SECTION (Page 5 & 6) OR TIMELINE (Page 26)
          ======================================================== */}
      {calendarViewMode === 'timeline' ? (
        /* Timeline View with Big Vertical Dates (Page 26) */
        <div className="space-y-6 pt-2">
          {/* Day 19 */}
          <div className="flex items-start gap-4">
            <span className="text-[44px] font-black text-white leading-none w-14 shrink-0 tracking-tighter">
              19
            </span>
            <div className="flex-1 bg-[#141417] border border-white/10 rounded-[24px] p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Online meeting</span>
                </div>
                <h4 className="text-[16px] font-bold text-white">11:00 am - 11:30 am</h4>
                <p className="text-zinc-400 text-xs mt-0.5">Weekly Leadership</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </div>
          </div>

          {/* Day 23 */}
          <div className="flex items-start gap-4">
            <span className="text-[44px] font-black text-white leading-none w-14 shrink-0 tracking-tighter">
              23
            </span>
            <div className="flex-1 bg-[#141417] border border-white/10 rounded-[24px] p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold mb-1">
                  <span>In-person meeting</span>
                </div>
                <h4 className="text-[16px] font-bold text-white">11:00 am - 11:30 am</h4>
                <p className="text-zinc-400 text-xs mt-0.5">Weekly Leadership</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </div>
          </div>

          {/* Day 28 */}
          <div className="flex items-start gap-4">
            <span className="text-[44px] font-black text-white leading-none w-14 shrink-0 tracking-tighter">
              28
            </span>
            <div className="flex-1 bg-[#141417] border border-white/10 rounded-[24px] p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Online meeting</span>
                </div>
                <h4 className="text-[16px] font-bold text-white">11:00 am - 11:30 am</h4>
                <p className="text-zinc-400 text-xs mt-0.5">Weekly Leadership</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </div>
          </div>

          {/* December 01 */}
          <div className="pt-2">
            <h3 className="text-zinc-400 text-[20px] font-bold mb-3">December</h3>
            <div className="flex items-start gap-4">
              <span className="text-[44px] font-black text-white leading-none w-14 shrink-0 tracking-tighter">
                01
              </span>
              <div className="flex-1 bg-[#141417] border border-white/10 rounded-[24px] p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Online meeting</span>
                  </div>
                  <h4 className="text-[16px] font-bold text-white">11:00 am - 11:30 am</h4>
                  <p className="text-zinc-400 text-xs mt-0.5">Weekly Leadership</p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Event Cards List (Page 5 & 6) */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-zinc-300 text-[20px] font-bold">Events</h3>
            <span className="text-zinc-500 text-xs">
              {calendarEvents.length} events
            </span>
          </div>

          {calendarEvents.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              iconBadgeClass="bg-purple-500/10 border-purple-500/25 text-purple-400"
              title="No schedule events yet"
              description="Keep track of team meetings, deadlines, and personal milestones on your agenda."
              primaryAction={{
                label: 'Add Schedule Event',
                icon: Plus,
                onClick: () => setShowAddEventModal(true),
              }}
            />
          ) : (
            calendarEvents.map((evt) => (
              <div key={evt.id} className="bg-white rounded-[20px] p-6 text-black shadow-lg">
                <h4 className="text-[20px] font-bold text-black tracking-tight">
                  {evt.title}
                </h4>
                <p className="text-zinc-600 text-[14px] mt-1 leading-snug">
                  {evt.location || 'Team discussion & sync session'}
                </p>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-black/5">
                  <div className="flex items-center gap-2 text-zinc-700 text-[13px] font-semibold">
                    <Clock className="w-4 h-4 text-black/60" />
                    <span>{evt.month} {evt.day} | {evt.time}</span>
                  </div>

                  <div className="flex items-center -space-x-2">
                    <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-sm">
                      <UserAvatar userId="self" size={28} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. FLOATING ACTION BUTTON (Page 5, 6, 26) */}
      <button
        type="button"
        onClick={() => setShowAddEventModal(true)}
        className="fixed right-6 bottom-24 z-40 w-14 h-14 rounded-2xl bg-viora-neonLime text-black flex items-center justify-center shadow-[0_6px_20px_rgba(180,255,0,0.4)] hover:scale-105 active:scale-95 transition-all"
        title="Add Event"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEventModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowAddEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-white text-[20px] font-bold">New Schedule Event</h3>
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="text-zinc-400 text-xs font-semibold block mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder="e.g. Design review with Sara"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-viora-neonLime"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-xs font-semibold block mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-viora-neonLime"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-xs font-semibold block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Agenda notes..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white text-sm focus:outline-none focus:border-viora-neonLime resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-14 rounded-full bg-viora-neonLime text-black font-extrabold text-[16px] hover:opacity-95 transition-all shadow-lg active:scale-95"
                >
                  Create Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
