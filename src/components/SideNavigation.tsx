import React, { useState } from 'react';
import {
  Inbox,
  Calendar,
  CalendarDays,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Archive,
  Settings,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  User as UserIcon,
  SlidersHorizontal,
  X,
  LayoutList,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { UserAvatar } from './UserAvatar';
import { TaskStatus } from '../types';
import { useM3WindowSize } from '../utils/useM3WindowSize';
import {
  getTeamPastelColor,
  getTeamIcon,
  getListColor,
} from '../utils/teamVisuals';
import { PWAInstallButton } from './PWAInstallButton';

export const SideNavigation: React.FC = () => {
  const {
    currentRoute,
    navigate,
    setShowQuickAdd,
    userProfile,
    logout,
    activeTasks,
    lists,
    teams,
    addList,
    activeTodoistView,
    setActiveTodoistView,
    selectedProjectId,
    setSelectedProjectId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    quickSearchQuery,
    setQuickSearchQuery,
  } = useViora();

  const { isCompact, isMedium } = useM3WindowSize();
  const effectiveCollapsed = isMedium || isSidebarCollapsed;

  const [teamsExpanded, setTeamsExpanded] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [addingListTeamId, setAddingListTeamId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [isSubmittingList, setIsSubmittingList] = useState(false);

  if (isCompact) return null;

  // Counts Calculation
  const overdueCount = activeTasks.filter(
    (t) => t.status !== TaskStatus.DONE && !t.isUnplanned && t.daysLeft < 0
  ).length;

  const todayCount = activeTasks.filter(
    (t) => t.status !== TaskStatus.DONE && !t.isUnplanned && t.daysLeft === 0
  ).length;

  const upcomingCount = activeTasks.filter(
    (t) => t.status !== TaskStatus.DONE && !t.isUnplanned && t.daysLeft > 0 && t.daysLeft <= 7
  ).length;

  const inboxCount = activeTasks.filter(
    (t) => t.status !== TaskStatus.DONE && (!t.listId || t.folder === 'Personal' || t.folder === 'Inbox')
  ).length;

  const handleSelectTodoistView = (view: typeof activeTodoistView, projectId?: string) => {
    setActiveTodoistView(view);
    setSelectedProjectId(projectId || null);
    if (currentRoute !== 'home') {
      navigate('home');
    }
  };

  const toggleTeamCollapse = (teamId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTeams((prev) => {
      const current = Boolean(prev[teamId]);
      return {
        ...prev,
        [teamId]: !current,
      };
    });
  };

  const handleInlineAddList = async (teamId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || isSubmittingList) return;
    try {
      setIsSubmittingList(true);
      await addList(newListName.trim(), teamId);
      setNewListName('');
      setAddingListTeamId(null);
    } catch (err) {
      console.error('Failed to create list', err);
    } finally {
      setIsSubmittingList(false);
    }
  };

  // Unified active teams: Personal team first, followed by collaborative teams
  const sortedTeams = [...teams]
    .filter((t) => !t.isArchived)
    .sort((a, b) => {
      const aIsPersonal = a.id === 'team_personal' || a.name.toLowerCase() === 'personal';
      const bIsPersonal = b.id === 'team_personal' || b.name.toLowerCase() === 'personal';
      if (aIsPersonal && !bIsPersonal) return -1;
      if (!aIsPersonal && bIsPersonal) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <aside
      aria-label={effectiveCollapsed ? 'Navigation Rail' : 'Navigation Drawer'}
      className={`flex flex-col bg-[#0F0F12] border-r border-white/10 h-screen sticky top-0 shrink-0 select-none z-30 transition-all duration-200 font-['SF_Pro_Display',-apple-system,sans-serif] ${
        effectiveCollapsed ? 'w-[72px] px-2 py-3.5' : 'w-64 sm:w-[272px] px-3 py-3.5'
      }`}
    >
      {/* 1. Header: User Profile Dropdown & Collapse Toggle */}
      <div className="flex items-center justify-between mb-2.5 px-1 relative">
        {!effectiveCollapsed ? (
          <div className="flex items-center justify-between w-full">
            {/* User Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/[0.08] transition-colors text-left"
              >
                <div className="relative">
                  <UserAvatar
                    userId={userProfile.username}
                    avatarUrl={userProfile.profileImageUri}
                    size={30}
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-viora-neonLime ring-2 ring-[#0F0F12]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-white text-[13px] font-bold truncate max-w-[120px]">
                      {userProfile.name ? userProfile.name.split(' ')[0] : 'Viora'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">Personal Account</span>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-1.5 z-50 bg-[#1A1A1E] border border-white/15 rounded-2xl p-1.5 shadow-2xl min-w-[200px] animate-in fade-in zoom-in-95"
                >
                  <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white">{userProfile.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{userProfile.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('user_profile'); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 text-left transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-viora-neonLime" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('teams'); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 text-left transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Manage Teams</span>
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('settings'); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 text-left transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 text-left transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Collapse Sidebar Button */}
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 w-full">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-1.5 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors"
              title="Expand drawer"
            >
              <PanelLeft className="w-4 h-4 text-viora-neonLime" />
            </button>
            <UserAvatar userId={userProfile.username} size={30} />
          </div>
        )}
      </div>

      {/* 2. Quick Actions: + Add Task & Quick Search */}
      {!effectiveCollapsed ? (
        <div className="space-y-2 mb-2.5 px-0.5">
          {/* Add Task Button (Todoist-inspired sleek rounded-full pill) */}
          <button
            onClick={() => setShowQuickAdd(true)}
            className="w-full h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white border border-white/[0.08] hover:border-white/20 font-medium text-[13px] flex items-center justify-between pl-2.5 pr-3 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-viora-neonLime text-black flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span className="text-zinc-200 group-hover:text-white font-semibold">Add task</span>
            </div>
            <kbd className="text-[10px] text-zinc-400 group-hover:text-zinc-200 bg-white/[0.06] px-1.5 py-0.5 rounded-full font-mono font-semibold border border-white/5">
              Q
            </kbd>
          </button>

          {/* Search Bar (Balanced 32px height) */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={quickSearchQuery}
              onChange={(e) => setQuickSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-7 rounded-full bg-white/[0.05] border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-viora-neonLime/60 transition-colors"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-mono">
              /
            </kbd>
          </div>
        </div>
      ) : (
        /* Rail FAB (Round circle with subtle hover) */
        <div className="flex flex-col items-center gap-2 mb-2.5">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="w-9 h-9 rounded-full bg-viora-neonLime hover:brightness-105 active:scale-95 text-black flex items-center justify-center shadow-[0_2px_10px_rgba(180,255,0,0.25)] transition-all"
            title="Add task (Q)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* 3. Main Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
        {/* Core Views (Balanced 36px height) */}
        <div className="space-y-0.5">
          {/* All Tasks (Chronological Timeline) */}
          <button
            onClick={() => handleSelectTodoistView('all')}
            className={`w-full h-9 flex items-center ${effectiveCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} rounded-xl text-[13px] font-medium transition-all ${
              currentRoute === 'home' && activeTodoistView === 'all' && !selectedProjectId
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="All Tasks Timeline"
          >
            <div className={`flex items-center gap-2.5 ${effectiveCollapsed ? 'justify-center' : 'min-w-0'}`}>
              <LayoutList
                className={`w-4 h-4 shrink-0 ${
                  currentRoute === 'home' && activeTodoistView === 'all' && !selectedProjectId
                    ? 'text-viora-neonLime'
                    : 'text-zinc-400'
                }`}
              />
              {!effectiveCollapsed && <span className="truncate">All Tasks (Timeline)</span>}
            </div>
            {!effectiveCollapsed && activeTasks.filter((t) => t.status !== TaskStatus.DONE).length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
                  currentRoute === 'home' && activeTodoistView === 'all' && !selectedProjectId
                    ? 'bg-zinc-700/80 text-zinc-200'
                    : 'bg-white/10 text-zinc-300'
                }`}
              >
                {activeTasks.filter((t) => t.status !== TaskStatus.DONE).length}
              </span>
            )}
          </button>

          {/* Inbox */}
          <button
            onClick={() => handleSelectTodoistView('inbox')}
            className={`w-full h-9 flex items-center ${effectiveCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} rounded-xl text-[13px] font-medium transition-all ${
              currentRoute === 'home' && activeTodoistView === 'inbox' && !selectedProjectId
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Inbox"
          >
            <div className={`flex items-center gap-2.5 ${effectiveCollapsed ? 'justify-center' : 'min-w-0'}`}>
              <Inbox
                className={`w-4 h-4 shrink-0 ${
                  currentRoute === 'home' && activeTodoistView === 'inbox' && !selectedProjectId
                    ? 'text-viora-neonLime'
                    : 'text-zinc-400'
                }`}
              />
              {!effectiveCollapsed && <span className="truncate">Inbox</span>}
            </div>
            {!effectiveCollapsed && inboxCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
                  currentRoute === 'home' && activeTodoistView === 'inbox' && !selectedProjectId
                    ? 'bg-zinc-700/80 text-zinc-200'
                    : 'bg-white/10 text-zinc-300'
                }`}
              >
                {inboxCount}
              </span>
            )}
          </button>

          {/* Today View */}
          <button
            onClick={() => handleSelectTodoistView('today')}
            className={`w-full h-9 flex items-center ${effectiveCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} rounded-xl text-[13px] font-medium transition-all ${
              currentRoute === 'home' && activeTodoistView === 'today' && !selectedProjectId
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Today"
          >
            <div className={`flex items-center gap-2.5 ${effectiveCollapsed ? 'justify-center' : 'min-w-0'}`}>
              <Calendar
                className={`w-4 h-4 shrink-0 ${
                  currentRoute === 'home' && activeTodoistView === 'today' && !selectedProjectId
                    ? 'text-viora-neonLime'
                    : 'text-zinc-400'
                }`}
              />
              {!effectiveCollapsed && <span className="truncate">Today</span>}
            </div>
            {!effectiveCollapsed && (
              <div className="flex items-center gap-1.5 tabular-nums">
                {overdueCount > 0 && (
                  <span
                    title={`${overdueCount} overdue`}
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444] text-white shadow-sm ring-1 ring-black/40 shrink-0 leading-none min-w-[18px] text-center"
                  >
                    {overdueCount}
                  </span>
                )}
                {todayCount > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
                      currentRoute === 'home' && activeTodoistView === 'today' && !selectedProjectId
                        ? 'bg-zinc-700/80 text-zinc-200'
                        : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {todayCount}
                  </span>
                )}
              </div>
            )}
          </button>

          {/* Upcoming View */}
          <button
            onClick={() => handleSelectTodoistView('upcoming')}
            className={`w-full h-9 flex items-center ${effectiveCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} rounded-xl text-[13px] font-medium transition-all ${
              currentRoute === 'home' && activeTodoistView === 'upcoming' && !selectedProjectId
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Upcoming"
          >
            <div className={`flex items-center gap-2.5 ${effectiveCollapsed ? 'justify-center' : 'min-w-0'}`}>
              <CalendarDays
                className={`w-4 h-4 shrink-0 ${
                  currentRoute === 'home' && activeTodoistView === 'upcoming' && !selectedProjectId
                    ? 'text-viora-neonLime'
                    : 'text-zinc-400'
                }`}
              />
              {!effectiveCollapsed && <span className="truncate">Upcoming</span>}
            </div>
            {!effectiveCollapsed && upcomingCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
                  currentRoute === 'home' && activeTodoistView === 'upcoming' && !selectedProjectId
                    ? 'bg-zinc-700/80 text-zinc-200'
                    : 'bg-white/10 text-zinc-300'
                }`}
              >
                {upcomingCount}
              </span>
            )}
          </button>

          {/* Archives */}
          <button
            onClick={() => navigate('archives')}
            className={`w-full h-9 flex items-center ${effectiveCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'} rounded-xl text-[13px] font-medium transition-all ${
              currentRoute === 'archives'
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Archives"
          >
            <Archive
              className={`w-4 h-4 shrink-0 ${
                currentRoute === 'archives' ? 'text-viora-neonLime' : 'text-zinc-400'
              }`}
            />
            {!effectiveCollapsed && <span>Archives</span>}
          </button>
        </div>

        {/* Teams & Lists Section (Workspaces collapsed by default) */}
        {!effectiveCollapsed && (
          <div className="pt-2 border-t border-white/5 space-y-1">
            {/* Unified Teams Section Header */}
            <div className="flex items-center justify-between px-2.5 py-1 text-zinc-400 group">
              <button
                type="button"
                onClick={() => setTeamsExpanded((prev) => !prev)}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                    teamsExpanded ? 'rotate-90' : ''
                  }`}
                />
                <span>Teams</span>
              </button>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => navigate('teams')}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Manage Teams"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('teams')}
                  className="p-1 rounded-md text-zinc-400 hover:text-viora-neonLime hover:bg-white/10 transition-colors"
                  title="New Team"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {teamsExpanded && (
              <div className="space-y-0.5 mt-0.5">
                {sortedTeams.map((team) => {
                  const teamLists = lists.filter(
                    (l) =>
                      (l.teamId === team.id ||
                        (!l.teamId && (team.id === 'team_personal' || team.name.toLowerCase() === 'personal'))) &&
                      !l.isArchived
                  );
                  // Collapsed by default when app opens; expanded only when explicitly toggled or active list inside
                  const isTeamExpanded =
                    Boolean(expandedTeams[team.id]) ||
                    (Boolean(selectedProjectId) && teamLists.some((l) => l.id === selectedProjectId));
                  const teamPastelColor = getTeamPastelColor(team.id);
                  const TeamIcon = getTeamIcon(team.name, team.id);
                  const totalTeamActiveTasks = activeTasks.filter(
                    (t) =>
                      t.status !== TaskStatus.DONE &&
                      teamLists.some((l) => l.id === t.listId)
                  ).length;

                  return (
                    <div key={team.id} className="space-y-0.5">
                      {/* Team Header Row: Clean folder/workspace row */}
                      <div
                        onClick={(e) => toggleTeamCollapse(team.id, e)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer text-xs transition-colors group select-none"
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                              isTeamExpanded ? 'rotate-90 text-zinc-300' : 'text-zinc-500'
                            }`}
                          />
                          {/* Pixel-perfect crisp pastel icon */}
                          <TeamIcon
                            className="w-4 h-4 shrink-0 stroke-[2] transition-colors"
                            style={{ color: teamPastelColor }}
                          />
                          <span className="font-semibold text-zinc-300 group-hover:text-white truncate text-[12.5px] transition-colors">
                            {team.name}
                          </span>
                        </div>

                        {/* Right slot: aligned with right column; only shows task count when collapsed, + button on hover */}
                        <div className="relative flex items-center justify-end w-6 h-6 shrink-0">
                          {!isTeamExpanded && totalTeamActiveTasks > 0 && (
                            <span className="text-[11px] font-mono text-zinc-500 tabular-nums group-hover:opacity-0 transition-opacity">
                              {totalTeamActiveTasks}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTeams((prev) => ({ ...prev, [team.id]: true }));
                              setAddingListTeamId(team.id);
                              setNewListName('');
                            }}
                            className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-viora-neonLime hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                            title={`Create list in ${team.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Nested Lists under Team: Visual guide line to establish clean hierarchy */}
                      {isTeamExpanded && (
                        <div className="ml-3.5 pl-2.5 border-l border-white/[0.08] space-y-0.5 my-1">
                          {/* Inline Add List Form */}
                          {addingListTeamId === team.id && (
                            <form
                              onSubmit={(e) => handleInlineAddList(team.id, e)}
                              className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-800/90 rounded-lg text-xs my-1"
                            >
                              <span className="w-2 h-2 rounded-full bg-viora-neonLime shrink-0 animate-pulse" />
                              <input
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="List name..."
                                autoFocus
                                disabled={isSubmittingList}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    setAddingListTeamId(null);
                                    setNewListName('');
                                  }
                                }}
                                className="w-full bg-transparent text-white placeholder-zinc-500 text-xs focus:outline-none"
                              />
                              <button
                                type="submit"
                                disabled={!newListName.trim() || isSubmittingList}
                                className="text-[10px] font-bold text-black bg-viora-neonLime px-1.5 py-0.5 rounded hover:opacity-90 disabled:opacity-40 shrink-0"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingListTeamId(null);
                                  setNewListName('');
                                }}
                                className="text-zinc-400 hover:text-white p-0.5 rounded shrink-0"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </form>
                          )}

                          {teamLists.length === 0 && addingListTeamId !== team.id && (
                            <div className="px-2.5 py-1 text-[11px] text-zinc-500 italic">
                              No lists yet
                            </div>
                          )}

                          {teamLists.map((list) => {
                            const isSelected = selectedProjectId === list.id;
                            const count = activeTasks.filter(
                              (t) => t.listId === list.id && t.status !== TaskStatus.DONE
                            ).length;
                            const listAccentColor = getListColor(list.id, teamPastelColor);

                            return (
                              <button
                                key={list.id}
                                type="button"
                                onClick={() => handleSelectTodoistView('project', list.id)}
                                className={`w-full h-8 flex items-center justify-between px-2.5 rounded-lg text-[12.5px] transition-all ${
                                  isSelected
                                    ? 'bg-zinc-800 text-white font-medium shadow-xs'
                                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0 transition-transform duration-150"
                                    style={{
                                      backgroundColor: isSelected ? '#B4FF00' : listAccentColor,
                                      boxShadow: isSelected ? '0 0 6px rgba(180, 255, 0, 0.6)' : undefined,
                                    }}
                                  />
                                  <span className={`truncate ${isSelected ? 'text-white font-medium' : 'text-zinc-300 font-normal'}`}>
                                    {list.name}
                                  </span>
                                </div>
                                {count > 0 && (
                                  <span
                                    className={`text-[11px] font-mono tabular-nums ${
                                      isSelected
                                        ? 'text-zinc-200 font-semibold bg-zinc-700/60 px-1.5 py-0.5 rounded'
                                        : 'text-zinc-400'
                                    }`}
                                  >
                                    {count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {sortedTeams.length === 0 && (
                  <div className="px-3 py-3 text-center text-zinc-500 text-xs bg-white/[0.02] rounded-xl border border-dashed border-white/5 mx-1">
                    <p className="mb-1 text-zinc-400">No teams created yet.</p>
                    <button
                      type="button"
                      onClick={() => navigate('teams')}
                      className="text-viora-neonLime font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Create team
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Footer: PWA Install Button */}
      <div className="pt-2 mt-auto border-t border-white/10 shrink-0">
        {!effectiveCollapsed ? (
          <PWAInstallButton variant="sidebar" />
        ) : (
          <div className="flex justify-center">
            <PWAInstallButton variant="sidebar" className="!w-9 !h-9 !p-0 !justify-center !rounded-xl" />
          </div>
        )}
      </div>
    </aside>
  );
};
