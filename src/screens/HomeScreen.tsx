import React, { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  LayoutList,
  Kanban,
  CheckCircle2,
  ChevronDown,
  Bell,
  PanelLeft,
  X,
  Check,
  Plus,
  Search,
  Zap,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskStatus } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TodoistTaskRow } from '../components/TodoistTaskRow';
import { NextTaskCard } from '../components/NextTaskCard';
import { WeatherCard } from '../components/WeatherCard';
import { EventCard } from '../components/EventCard';
import { ConnectCalendarCard } from '../components/ConnectCalendarCard';
import { CompletedTasksCard } from '../components/CompletedTasksCard';
import { AllTasksDoneCard } from '../components/AllTasksDoneCard';
import { AnimatedCardItem } from '../components/AnimatedCardItem';
import { InlineTaskCreator } from '../components/InlineTaskCreator';
import { EmptyState } from '../components/EmptyState';
import { UserAvatar } from '../components/UserAvatar';
import { SyncBadge } from '../components/SyncBadge';
import { useM3WindowSize } from '../utils/useM3WindowSize';
import { QuickReviewCard } from '../components/QuickReviewCard';

export const HomeScreen: React.FC = () => {
  const { isCompact, isMedium } = useM3WindowSize();
  const [selectedMobileBoardColumn, setSelectedMobileBoardColumn] = useState<TaskStatus>(TaskStatus.TODO);

  const {
    activeTasks,
    completedTasks,
    completedCount,
    updateTaskStatus,
    setActiveDetailTaskId,
    setActiveListId,
    navigate,
    unreadNotificationCount,
    activeTodoistView,
    setActiveTodoistView,
    selectedProjectId,
    setSelectedProjectId,
    lists,
    displayMode,
    setDisplayMode,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    quickSearchQuery,
    setQuickSearchQuery,
    cardTheme,
    setCardTheme,
    setShowQuickAdd,
    userProfile,
    weatherInfo,
    currentTime,
    upcomingEvent,
    googleCalendarSynced,
    toggleGoogleCalendarSync,
  } = useViora();

  // Sorting & Display Controls
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCompletedInList, setShowCompletedInList] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Hero Card visibility toggle
  const [showHeroCard, setShowHeroCard] = useState<boolean>(() => {
    return localStorage.getItem('viora_show_hero_card') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('viora_show_hero_card', showHeroCard ? 'true' : 'false');
  }, [showHeroCard]);

  // Drag & Drop Board state
  const [dragOverColumnId, setDragOverColumnId] = useState<TaskStatus | null>(null);

  // Greeting & User Name calculation
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = useMemo(() => {
    if (userProfile?.name?.trim()) {
      return userProfile.name.trim().split(' ')[0];
    }
    if (userProfile?.username?.trim()) {
      return userProfile.username.trim();
    }
    return 'Mehran';
  }, [userProfile]);

  const formattedDate = useMemo(() => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  }, []);

  // Active Project or List Info
  const currentProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return lists.find((l) => l.id === selectedProjectId) || null;
  }, [selectedProjectId, lists]);



  // Filter Tasks based on activeTodoistView, selectedProjectId, quickSearchQuery, and filters
  const filteredActiveTasks = useMemo(() => {
    let result = activeTasks.filter((t) => t.status !== TaskStatus.DONE);

    // Search filter
    if (quickSearchQuery.trim()) {
      const q = quickSearchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Specific Project Filter
    if (selectedProjectId) {
      return result.filter((t) => t.listId === selectedProjectId);
    }

    // Todoist Core Views Filter (if user selected one from sidebar)
    switch (activeTodoistView) {
      case 'inbox':
        return result.filter(
          (t) => !t.listId || t.folder === 'Personal' || t.folder === 'Inbox'
        );
      case 'today':
        return result.filter(
          (t) => !t.isUnplanned && (t.daysLeft <= 0 || t.dueDateText === 'Due today')
        );
      case 'upcoming':
        return result.filter((t) => !t.isUnplanned && t.daysLeft > 0);
      case 'completed':
        return [];
      default:
        return result;
    }
  }, [
    activeTasks,
    activeTodoistView,
    selectedProjectId,
    quickSearchQuery,
  ]);

  // Chronologically sort filtered active tasks strictly by deadline urgency
  const sortedPendingTasks = useMemo(() => {
    const copy = [...filteredActiveTasks];
    if (sortBy === 'date') {
      return copy.sort((a, b) => {
        if (a.isUnplanned && !b.isUnplanned) return 1;
        if (!a.isUnplanned && b.isUnplanned) return -1;
        if (a.daysLeft !== b.daysLeft) {
          return a.daysLeft - b.daysLeft;
        }
        const aTime = a.selectedDeadlineMillis || a.computedDeadlineMillis || a.createdAtMillis || 0;
        const bTime = b.selectedDeadlineMillis || b.computedDeadlineMillis || b.createdAtMillis || 0;
        return aTime - bTime;
      });
    } else if (sortBy === 'title') {
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'status') {
      const order = { [TaskStatus.TODO]: 0, [TaskStatus.IN_PROGRESS]: 1, [TaskStatus.DONE]: 2 };
      return copy.sort((a, b) => order[a.status] - order[b.status]);
    }
    return copy;
  }, [filteredActiveTasks, sortBy]);

  // Next Task (top hero) & Subsequent Tasks
  const nextTask = sortedPendingTasks[0] || null;
  const subsequentTasks = nextTask ? sortedPendingTasks.slice(1) : [];
  const feedTasks = showHeroCard ? subsequentTasks : sortedPendingTasks;

  // Categorize for Board View: Columns
  const boardColumns = useMemo(() => {
    const allFiltered = activeTasks.filter((t) => {
      if (selectedProjectId) return t.listId === selectedProjectId;
      return true;
    });

    return [
      {
        id: TaskStatus.TODO,
        title: 'To-Do',
        color: '#FFD8D8',
        textColor: '#8A0000',
        tasks: allFiltered.filter((t) => t.status === TaskStatus.TODO),
      },
      {
        id: TaskStatus.IN_PROGRESS,
        title: 'In Progress',
        color: '#D6E3FF',
        textColor: '#001B3E',
        tasks: allFiltered.filter((t) => t.status === TaskStatus.IN_PROGRESS),
      },
      {
        id: TaskStatus.DONE,
        title: 'Done',
        color: '#D4EFA5',
        textColor: '#234B00',
        tasks: allFiltered.filter((t) => t.status === TaskStatus.DONE),
      },
    ];
  }, [activeTasks, selectedProjectId]);

  // Uniform horizontal padding matching header and body columns across breakpoints
  const horizontalPadding = isCompact ? 'px-3' : isMedium ? 'px-6' : 'px-8';

  // Mobile Responsive View strictly matching Viora Task Mobile App design tokens & specifications
  if (isCompact) {
    const hasQuickTasks = activeTasks.some(
      (t) =>
        t.status !== TaskStatus.DONE &&
        (t.listId === 'quick_tasks' ||
          t.folder === 'Quick Tasks' ||
          t.tags?.includes('Quick Task'))
    );
    const quickTasksCount = activeTasks.filter(
      (t) =>
        t.status !== TaskStatus.DONE &&
        (t.listId === 'quick_tasks' ||
          t.folder === 'Quick Tasks' ||
          t.tags?.includes('Quick Task'))
    ).length;
    const yellowCardCount = hasQuickTasks ? quickTasksCount : completedCount;
    const hasAnyPendingTasks = sortedPendingTasks.length > 0;

    return (
      <div className="w-full max-w-[480px] mx-auto min-h-screen h-full flex flex-col min-h-0 bg-[#000000] text-white overflow-hidden font-sans">
        {/* Mobile Header matching HeaderSection in HomeScreen.kt */}
        <header className="shrink-0 w-full z-30 bg-[#000000] px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <div className="text-[17px] text-white leading-tight">
              Hi 👋 <span className="font-bold">{displayName}!</span>
            </div>
            <div className="text-[14px] text-white/50 leading-tight mt-0.5">
              Welcome back
            </div>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              onClick={() => navigate('search')}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('notifications')}
              className="relative w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#B4FF00] border-[1.5px] border-black" />
              )}
            </button>
            <button
              onClick={() => navigate('user_profile')}
              className="w-11 h-11 rounded-full border border-white/20 overflow-hidden shrink-0 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title="User Profile"
            >
              <UserAvatar userId={userProfile?.id || 'self'} size={44} />
            </button>
          </div>
        </header>

        {/* Scroll Feed Container: Strictly horizontal padding 2px (px-[2px]), gap strictly 4px (space-y-[4px]), bottom padding 16px/pb-28 */}
        <div className="flex-1 overflow-y-auto px-[2px] space-y-[4px] pb-28 pt-1">
          {/* Card 1: Weather & Time Card */}
          <AnimatedCardItem cardId="weather-time-card" delayIndex={0}>
            <WeatherCard
              weatherInfo={weatherInfo}
              timeString={currentTime}
              onClick={() => navigate('daily_brief')}
            />
          </AnimatedCardItem>

          {/* Card 2 & Card 3: Upcoming Event Card or Connect Calendar Card */}
          <AnimatedCardItem cardId="agenda-calendar-card" delayIndex={1}>
            {!googleCalendarSynced && !upcomingEvent ? (
              <ConnectCalendarCard
                onClick={() => {
                  toggleGoogleCalendarSync();
                  navigate('agenda');
                }}
              />
            ) : (
              <EventCard
                event={upcomingEvent}
                onClick={() => navigate('agenda')}
              />
            )}
          </AnimatedCardItem>

          {/* Card 4: Next Task Card OR Card 6: All Tasks Done Card (when list is empty) */}
          {hasAnyPendingTasks && nextTask ? (
            <AnimatedCardItem cardId={`task-hero-${nextTask.id}`} delayIndex={2}>
              <NextTaskCard
                task={nextTask}
                onCardClick={() => setActiveDetailTaskId(nextTask.id)}
                onStatusSelect={(newStatus) => updateTaskStatus(nextTask.id, newStatus)}
              />
            </AnimatedCardItem>
          ) : (
            <AnimatedCardItem cardId="all-tasks-done-card" delayIndex={2}>
              <AllTasksDoneCard onCreateTask={() => setShowQuickAdd(true)} />
            </AnimatedCardItem>
          )}

          {/* Card 5: Review Quick / Completed Tasks Card */}
          {yellowCardCount > 0 && (
            <AnimatedCardItem cardId="yellow-review-card" delayIndex={3}>
              <CompletedTasksCard
                count={yellowCardCount}
                isQuickTask={hasQuickTasks}
                onClick={() => {
                  if (hasQuickTasks) {
                    setActiveListId('quick_tasks');
                    navigate('list_detail');
                  } else {
                    navigate('completed_tasks');
                  }
                }}
              />
            </AnimatedCardItem>
          )}

          {/* Card 4 (Cont.): Subsequent Tasks Feed */}
          {subsequentTasks.map((task, idx) => (
            <AnimatedCardItem key={task.id} cardId={`task-${task.id}`} delayIndex={idx + 4}>
              <TaskCard
                task={task}
                onCardClick={() => setActiveDetailTaskId(task.id)}
                onStatusSelect={(newStatus) => updateTaskStatus(task.id, newStatus)}
              />
            </AnimatedCardItem>
          ))}

          {/* Discover Section (matching Viora dark cards with #26262A container) */}
          <AnimatedCardItem cardId="discover-section" delayIndex={subsequentTasks.length + 5}>
            <div className="pt-6 pb-4">
              <h2 className="text-[24px] font-bold text-white px-[18px] mb-4">
                Discover
              </h2>
              <div className="space-y-[8px]">
                {/* Daily Insight Card */}
                <div className="w-full bg-[#26262A] border border-[#38383E] rounded-[24px] p-5 shadow-sm">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#B4FF00]">
                    Daily Insight
                  </span>
                  <p className="text-[17px] font-medium text-white/95 leading-relaxed italic mt-2">
                    &ldquo;Focus on being productive instead of busy. Small consistent actions compound into greatness.&rdquo;
                  </p>
                  <span className="block text-[13px] text-white/50 mt-3 font-normal">
                    — Tim Ferriss
                  </span>
                </div>

                {/* Suggested Article Card */}
                <div
                  onClick={() => navigate('daily_brief')}
                  className="w-full bg-[#26262A] border border-[#38383E] rounded-[24px] p-[18px] flex items-center gap-4 cursor-pointer hover:border-white/20 transition-colors"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-white flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-[#2A2A2C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] font-medium text-white/50">
                      Productivity
                    </span>
                    <h4 className="text-[16px] font-medium text-white leading-snug truncate mt-0.5">
                      Deep Work vs Shallow Work: How to Protect Your Focus
                    </h4>
                    <span className="text-[12px] text-white/40 mt-1 block">
                      4 min read
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCardItem>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-[#000000] text-white overflow-hidden font-['SF_Pro_Display',-apple-system,sans-serif]">
      {/* ========================================================
          1. HEADER BAR (Aligning with Viora Mobile Android Header in Home.png)
          Fixed firmly at the top; completely stationary on scroll
          ======================================================== */}
      <header
        className={`shrink-0 w-full z-30 bg-[#000000] border-b border-white/[0.08] ${horizontalPadding} ${
          isCompact ? 'py-3' : 'py-3.5'
        } flex items-center justify-between gap-3`}
      >
        {/* Left Zone: Sidebar Expand (Desktop) & Mobile Avatar + Greeting */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {isCompact && (
            <button
              onClick={() => navigate('user_profile')}
              className="w-11 h-11 rounded-full border-2 border-white/20 overflow-hidden shrink-0 flex items-center justify-center active:scale-95 transition-all shadow-md"
              title="User Profile"
            >
              <UserAvatar userId={userProfile?.id || 'self'} size={40} />
            </button>
          )}

          {!isCompact && isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-1.5 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors"
              title="Expand sidebar (M)"
            >
              <PanelLeft className="w-5 h-5 text-viora-neonLime" />
            </button>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="text-[17px] sm:text-[22px] font-bold text-white tracking-tight leading-tight truncate">
              {isCompact ? `Welcome back` : `${greeting}, ${displayName}`}
            </h1>
            <span className="text-[12px] text-zinc-400 font-medium leading-tight truncate">
              {isCompact ? displayName : formattedDate}
            </span>
          </div>
        </div>

        {/* Right Zone: View Switcher (List | Board), Search, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick List vs Board View Switcher */}
          <div className="flex items-center bg-[#151518] p-1 rounded-2xl border border-white/[0.08]">
            <button
              onClick={() => setDisplayMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                displayMode === 'list'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Continuous Chronological Feed"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Feed</span>
            </button>
            <button
              onClick={() => setDisplayMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                displayMode === 'board'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          {/* Offline / Sync Status Indicator */}
          <SyncBadge />

          {/* Quick Search Button */}
          <button
            onClick={() => navigate('search')}
            className="w-9 h-9 rounded-full bg-[#151518] hover:bg-[#1E1E22] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
            title="Search tasks (Cmd+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => navigate('notifications')}
            className="relative w-9 h-9 rounded-full bg-[#151518] hover:bg-[#1E1E22] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-viora-neonLime ring-2 ring-black" />
            )}
          </button>

          {/* Sort / Theme Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-[#151518] hover:bg-[#1E1E22] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              title="Sort and display options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {showSortMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 z-50 bg-[#1A1A1E] border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[170px] animate-in fade-in zoom-in-95"
              >
                <div className="text-[10px] uppercase font-bold text-zinc-500 px-2.5 py-1">Sort By</div>
                <button
                  onClick={() => { setSortBy('date'); setShowSortMenu(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-left ${
                    sortBy === 'date' ? 'bg-white/10 text-viora-neonLime font-bold' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <span>Due Date (Default)</span>
                  {sortBy === 'date' && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
                </button>
                <button
                  onClick={() => { setSortBy('title'); setShowSortMenu(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-left ${
                    sortBy === 'title' ? 'bg-white/10 text-viora-neonLime font-bold' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <span>Alphabetical</span>
                  {sortBy === 'title' && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
                </button>
                <button
                  onClick={() => { setSortBy('status'); setShowSortMenu(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-left ${
                    sortBy === 'status' ? 'bg-white/10 text-viora-neonLime font-bold' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <span>Status</span>
                  {sortBy === 'status' && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
                </button>

                <div className="my-1 border-t border-white/[0.08]" />
                <div className="text-[10px] uppercase font-bold text-zinc-500 px-2.5 py-1">Card Theme</div>
                <button
                  onClick={() => { setCardTheme('white'); setShowSortMenu(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-left ${
                    cardTheme === 'white' ? 'bg-white/10 text-viora-neonLime font-bold' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-white border border-black/20" />
                    <span>White Cards (سفید)</span>
                  </div>
                  {cardTheme === 'white' && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
                </button>
                <button
                  onClick={() => { setCardTheme('gray'); setShowSortMenu(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-left ${
                    cardTheme === 'gray' ? 'bg-white/10 text-viora-neonLime font-bold' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#1A1A1E] border border-white/20" />
                    <span>Grey Cards (خاکستری)</span>
                  </div>
                  {cardTheme === 'gray' && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
                </button>



                <div className="my-1 border-t border-white/[0.08]" />
                <div className="text-[10px] uppercase font-bold text-zinc-500 px-2.5 py-1">Hero Card</div>
                <button
                  onClick={() => { setShowHeroCard((prev) => !prev); setShowSortMenu(false); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-left text-zinc-300 hover:bg-white/5"
                >
                  <span>{showHeroCard ? 'Hero Card: Visible' : 'Hero Card: In Feed'}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${showHeroCard ? 'bg-viora-neonLime/20 text-viora-neonLime' : 'bg-white/10 text-zinc-400'}`}>
                    {showHeroCard ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Avatar Button */}
          <button
            onClick={() => navigate('user_profile')}
            className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden hover:border-viora-neonLime transition-all shrink-0 ml-0.5"
            title="User Profile"
          >
            <UserAvatar userId={userProfile?.id || 'self'} size={36} />
          </button>
        </div>
      </header>

      {/* ========================================================
          2. MAIN CONTENT AREA
          ======================================================== */}
      {/* ========================================================
          2. MAIN CONTENT AREA (Independent scrollable columns)
          ======================================================== */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        {displayMode === 'list' ? (
          /* ========================================================
             TWO INDEPENDENT SCROLLING COLUMNS
             - Center Task Feed (2/3 width on desktop): independent scroll
             - Right Widgets Column (1/3 width on desktop): independent scroll
             ======================================================== */
          <div className="w-full h-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
            {/* Center Zone: Main Tasks Feed (scrolls independently on desktop) */}
            <div className={`flex-1 min-w-0 lg:h-full lg:overflow-y-auto ${horizontalPadding} py-5 sm:py-7 pb-28 lg:pb-16 scrollbar-thin`}>
              <div className="max-w-3xl mx-auto space-y-8 sm:space-y-10">
                {/* Active Filter or Search Banner (if applicable) */}
                {(selectedProjectId || quickSearchQuery.trim() || activeTodoistView !== 'all') && (
                  <div className="mb-6 px-2 flex items-center justify-between bg-[#121215] border border-white/[0.06] rounded-2xl p-3 text-xs text-zinc-300">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-viora-neonLime" />
                      <span className="font-medium">
                        {selectedProjectId
                          ? `Project: ${currentProject?.name || 'Selected List'}`
                          : quickSearchQuery.trim()
                          ? `Search: "${quickSearchQuery}"`
                          : `Filter: ${
                              activeTodoistView === 'inbox'
                                ? 'Inbox'
                                : activeTodoistView === 'today'
                                ? 'Today'
                                : activeTodoistView === 'upcoming'
                                ? 'Upcoming'
                                : activeTodoistView
                            }`}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTodoistView('all');
                        setSelectedProjectId(null);
                        setQuickSearchQuery('');
                      }}
                      className="text-viora-neonLime hover:underline font-semibold shrink-0 ml-2"
                    >
                      Reset filter
                    </button>
                  </div>
                )}

                {/* 1. Next Task Hero Card & Quick Review Card */}
                {nextTask && showHeroCard ? (
                  <section className="space-y-3">
                    <NextTaskCard
                      task={nextTask}
                      onCardClick={() => setActiveDetailTaskId(nextTask.id)}
                      onStatusSelect={(newStatus) => updateTaskStatus(nextTask.id, newStatus)}
                    />
                    <QuickReviewCard
                      onOpenQuickTasks={() => {
                        setActiveListId('quick_tasks');
                        navigate('list_detail');
                      }}
                      onOpenCompletedTasks={() => navigate('completed_tasks')}
                    />
                  </section>
                ) : (
                  <section className="space-y-3">
                    <QuickReviewCard
                      onOpenQuickTasks={() => {
                        setActiveListId('quick_tasks');
                        navigate('list_detail');
                      }}
                      onOpenCompletedTasks={() => navigate('completed_tasks')}
                    />
                    {sortedPendingTasks.length === 0 && (
                      <EmptyState
                        icon={CheckCircle2}
                        iconBadgeClass="bg-viora-neonLime/10 border-viora-neonLime/25 text-viora-neonLime"
                        title="All caught up!"
                        description="There are no pending tasks right now. Great job, or add a new goal below."
                        primaryAction={{
                          label: 'Add a New Task',
                          icon: Plus,
                          onClick: () => setShowQuickAdd(true),
                        }}
                      />
                    )}
                  </section>
                )}

                {/* 2. Tasks Feed (Upcoming Feed) */}
                {feedTasks.length > 0 && (
                  <section className="space-y-3.5 pt-2">
                    {/* Feed Header bar with task count */}
                    <div className="flex items-center justify-between px-1.5 py-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200 text-[16px] tracking-tight">
                          {showHeroCard ? 'Upcoming Feed' : 'All Tasks Feed'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-zinc-300">
                          {feedTasks.length}
                        </span>
                      </div>
                    </div>

                    {/* Feed Items: Todoist List without drag-and-drop */}
                    <div className="space-y-2.5">
                      {feedTasks.map((task) => (
                        <TodoistTaskRow
                          key={task.id}
                          task={task}
                          onOpenDetail={() => setActiveDetailTaskId(task.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Inline Quick Task Creator */}
                <section className="pt-2">
                  <InlineTaskCreator
                    defaultStatus={TaskStatus.TODO}
                    placeholder="+ Add a new task..."
                  />
                </section>

                {/* 4. Collapsible Completed Tasks Section at Bottom */}
                {completedCount > 0 && (
                  <section className="pt-8 border-t border-white/[0.08] space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowCompletedInList((prev) => !prev)}
                      className="w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-2xl bg-[#141417]/90 hover:bg-[#1A1A20] border border-white/[0.08] hover:border-white/20 transition-all group cursor-pointer shadow-sm select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="flex items-center gap-2.5 text-left">
                          <span className="text-[15px] font-semibold text-zinc-100 group-hover:text-viora-neonLime transition-colors">
                            Completed Tasks
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/[0.08] text-zinc-300 border border-white/[0.06]">
                            {completedCount}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-zinc-400 group-hover:text-zinc-200">
                          {showCompletedInList ? 'Hide' : 'Show'}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                            showCompletedInList ? 'rotate-180 text-white' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {showCompletedInList && (
                      <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                        {completedTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setActiveDetailTaskId(task.id)}
                            className="w-full bg-[#111114] hover:bg-[#16161B] border border-white/[0.05] hover:border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTaskStatus(task.id, TaskStatus.TODO);
                                }}
                                className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center justify-center transition-all shrink-0"
                                title="Reopen task"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[14.5px] font-normal text-zinc-400 line-through truncate group-hover:text-zinc-300 transition-colors">
                                  {task.title}
                                </span>
                                <div className="flex items-center gap-2 text-[11.5px] text-zinc-500 mt-0.5">
                                  <span>{task.folder || 'Personal'}</span>
                                  {task.dueDateText && (
                                    <>
                                      <span>•</span>
                                      <span>{task.dueDateText}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4EFA5]/15 text-[#92d040] border border-[#D4EFA5]/25 shrink-0">
                              Done
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>

            {/* Right Zone: Sidebar Column for Widgets (~1/3 width on desktop, independent scroll) */}
            <aside className={`w-full lg:w-[350px] xl:w-[390px] shrink-0 min-h-0 lg:h-full lg:overflow-y-auto ${horizontalPadding} py-5 sm:py-7 pb-28 lg:pb-16 border-t lg:border-t-0 lg:border-l border-white/[0.08] bg-[#070709]/70 space-y-5 scrollbar-thin`}>
              <div className="flex items-center justify-between px-1 pb-1 border-b border-white/[0.06]">
                <span className="text-[12px] font-bold uppercase tracking-wider text-zinc-400">
                  Widgets & Overview
                </span>
                <span className="text-[11px] text-zinc-500">Live</span>
              </div>

              {/* Weather & Clock Widget Card */}
              <WeatherCard
                weatherInfo={weatherInfo}
                timeString={currentTime}
                onClick={() => navigate('daily_brief')}
              />

              {/* Event / Agenda Card or Connect Calendar Card */}
              {upcomingEvent ? (
                <EventCard
                  event={upcomingEvent}
                  onClick={() => navigate('agenda')}
                />
              ) : (
                <ConnectCalendarCard
                  onClick={() => {
                    toggleGoogleCalendarSync();
                    navigate('agenda');
                  }}
                />
              )}

              {/* Completed Tasks Summary Card */}
              <CompletedTasksCard
                count={completedCount}
                onClick={() => setShowCompletedInList((prev) => !prev)}
              />
            </aside>
          </div>
        ) : (
          /* ========================================================
             KANBAN BOARD VIEW
             - 3-Column stage management (To-Do, In Progress, Done)
             - Drag and Drop between columns
             - Viora Stark White Cards (rounded 28px)
             ======================================================== */
          <div
            className={`w-full h-full min-h-0 overflow-hidden flex flex-col ${horizontalPadding} pt-3 sm:pt-4 pb-20 sm:pb-4 lg:pb-5 space-y-3 sm:space-y-3.5`}
          >
            {/* Active Filter or Search Banner (if applicable) */}
            {(selectedProjectId || quickSearchQuery.trim() || activeTodoistView !== 'all') && (
              <div className="shrink-0 flex items-center justify-between bg-[#121215] border border-white/[0.06] rounded-2xl p-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-viora-neonLime" />
                  <span>
                    {selectedProjectId
                      ? `Project: ${currentProject?.name || 'Selected'}`
                      : quickSearchQuery.trim()
                      ? `Search: "${quickSearchQuery}"`
                      : `View: ${activeTodoistView}`}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTodoistView('all');
                  }}
                  className="text-viora-neonLime hover:underline font-semibold"
                >
                  Reset filter
                </button>
              </div>
            )}
            {/* Segmented Switcher for Compact / Medium Screens (< 768px or Compact) */}
            <div className="shrink-0 flex items-center p-1 bg-[#16161A] rounded-2xl border border-white/10 gap-1 md:hidden">
              {boardColumns.map((col) => {
                const isSelected = selectedMobileBoardColumn === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      setSelectedMobileBoardColumn(col.id);
                      document.getElementById(`board-column-${col.id}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'start',
                      });
                    }}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="truncate">{col.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
                        isSelected
                          ? 'bg-black/10 text-black'
                          : 'bg-white/10 text-zinc-300'
                      }`}
                    >
                      {col.tasks.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Columns Container: Responsive Horizontal Scroll with Fixed Minimum Widths */}
            <div className="flex-1 min-h-0 w-full flex flex-row gap-4 sm:gap-5 xl:gap-6 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
              {boardColumns.map((col) => (
                <div
                  key={col.id}
                  id={`board-column-${col.id}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOverColumnId(col.id);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverColumnId(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverColumnId(null);
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) {
                      updateTaskStatus(taskId, col.id);
                    }
                  }}
                  className={`h-full min-h-0 flex flex-col bg-[#121215] border rounded-[28px] p-3.5 sm:p-4 transition-all snap-start shrink-0 ${
                    isCompact
                      ? 'w-[86vw] max-w-[360px]'
                      : 'w-[320px] sm:w-[350px] md:w-[360px] lg:min-w-[320px] xl:min-w-[340px] flex-1'
                  } ${
                    dragOverColumnId === col.id
                      ? 'border-viora-neonLime/60 ring-2 ring-viora-neonLime/20 bg-[#16161C] shadow-lg'
                      : 'border-white/[0.06]'
                  }`}
                >
                    {/* Column Header: Stationary at the top of the column */}
                    <div className="shrink-0 flex items-center justify-between px-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: col.color }}
                        />
                        <span className="text-[15px] font-bold text-white tracking-tight">
                          {col.title}
                        </span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-extrabold"
                        style={{ backgroundColor: col.color, color: col.textColor }}
                      >
                        {col.tasks.length}
                      </span>
                    </div>

                    {/* Inline Add Task for this Column: Stationary under header */}
                    <div className="shrink-0 mb-2.5">
                      <InlineTaskCreator
                        defaultStatus={col.id}
                        placeholder={`+ Add task to ${col.title}...`}
                      />
                    </div>

                    {/* Task Cards Stack: Independent internal scroll for each column */}
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-[5px] pr-1 custom-scrollbar">
                      {col.tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onCardClick={() => setActiveDetailTaskId(task.id)}
                          onStatusSelect={(newStatus) => updateTaskStatus(task.id, newStatus)}
                        />
                      ))}

                      {col.tasks.length === 0 && (
                        <div className="h-44 px-2 text-center flex flex-col items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl my-2">
                          <span className="text-zinc-500 text-xs font-medium mb-2.5">
                            No tasks in {col.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowQuickAdd(true)}
                            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-white/5 hover:border-viora-neonLime/30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-viora-neonLime" />
                            <span>Add to {col.title}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Task Button on Mobile/Tablet */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-viora-neonLime text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all md:hidden"
        title="Quick Add Task"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {showShortcutsModal && (
        <div
          onClick={() => setShowShortcutsModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#16161A] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-viora-neonLime" />
                <h3 className="text-white text-base font-bold tracking-tight">
                  Desktop Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03]">
                <span>Quick Add Task anywhere</span>
                <kbd className="px-2 py-0.5 rounded bg-black/40 border border-white/15 font-mono text-[11px] font-bold text-viora-neonLime">
                  Q
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03]">
                <span>Toggle Left Sidebar</span>
                <kbd className="px-2 py-0.5 rounded bg-black/40 border border-white/15 font-mono text-[11px] font-bold text-white">
                  M
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03]">
                <span>Global Search & Jump</span>
                <kbd className="px-2 py-0.5 rounded bg-black/40 border border-white/15 font-mono text-[11px] font-bold text-white">
                  Cmd/Ctrl + K
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03]">
                <span>Close Task Detail / Modals</span>
                <kbd className="px-2 py-0.5 rounded bg-black/40 border border-white/15 font-mono text-[11px] font-bold text-white">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
