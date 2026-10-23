import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Plus,
  Share2,
  Edit2,
  Archive,
  Trash2,
  CheckCircle2,
  RotateCcw,
  LayoutList,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskCard } from '../components/TaskCard';
import { TodoistTaskRow } from '../components/TodoistTaskRow';
import { UserAvatar } from '../components/UserAvatar';
import { EmptyState } from '../components/EmptyState';
import { TaskStatus } from '../types';

export function ListDetailScreen() {
  const {
    activeListId,
    lists,
    teams,
    tasks,
    deleteList,
    archiveList,
    setActiveDetailTaskId,
    updateTaskStatus,
    setShowQuickAdd,
    goBack,
  } = useViora();

  const isQuickTasksView = activeListId === 'quick_tasks';
  const list = isQuickTasksView
    ? { id: 'quick_tasks', name: 'Quick Tasks', teamId: '', isArchived: false, isPersonal: true }
    : lists.find((l) => l.id === activeListId) || lists[0];
  const team = teams.find((t) => t.id === list?.teamId);

  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listLayout, setListLayout] = useState<'todoist' | 'cards'>(() => {
    return (localStorage.getItem('viora_feed_item_style') as 'todoist' | 'cards') || 'todoist';
  });

  const listTasks = useMemo(() => {
    let res = tasks.filter((t) => !t.isArchived);

    if (isQuickTasksView) {
      res = res.filter((t) => t.tags?.includes('Quick Task'));
    } else if (list) {
      res = res.filter((t) => t.listId === list.id);
    }

    if (statusFilter !== 'ALL') {
      res = res.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return res;
  }, [tasks, list, isQuickTasksView, statusFilter, searchQuery]);

  if (!list) return null;

  return (
    <div className="min-h-screen bg-black text-white pb-28 md:pb-12 pt-3 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto font-['SF_Pro_Display',-apple-system,sans-serif] relative">
      {/* 1. TOP APP BAR (Page 27, 28, 30) */}
      <div className="flex items-center justify-between py-2 mb-3">
        <button
          type="button"
          onClick={goBack}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Team / List Share Avatars Stack */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1.5 pr-2 rounded-full">
          <div className="flex items-center -space-x-2">
            {(team?.members && team.members.length > 0
              ? team.members.slice(0, 3)
              : list.members && list.members.length > 0
              ? list.members.slice(0, 3)
              : []
            ).map((m) => (
              <div key={m.id || m.username} className="w-7 h-7 rounded-full border border-black overflow-hidden">
                <UserAvatar userId={m.username || m.id} size={28} />
              </div>
            ))}
          </div>
          <div className="w-6 h-6 rounded-full bg-viora-neonLime text-black flex items-center justify-center font-bold">
            <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 2. TITLE & 3-DOTS MENU (Page 27 & 28) */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-[38px] font-extrabold tracking-tight">
              {list.name}
            </h1>
            <p className="text-zinc-400 text-[14px] font-medium mt-0.5">
              {team?.name || 'Viora Design'}
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu (Page 27) */}
            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 z-50 bg-[#222226] border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[160px] animate-in fade-in zoom-in-95 space-y-0.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowQuickAdd(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/90 hover:bg-white/10 flex items-center gap-2.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit list
                </button>
                <button
                  type="button"
                  onClick={() => {
                    archiveList(list.id);
                    setShowMenu(false);
                    goBack();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/90 hover:bg-white/10 flex items-center gap-2.5"
                >
                  <Archive className="w-3.5 h-3.5" /> Archive list
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete list
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed mt-2 line-clamp-2">
          {(list as unknown as { description?: string })?.description ||
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore'}
        </p>
      </div>

      {/* 3. SEARCH & FILTER ROW (Page 28 & 30) */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181C] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-white text-[15px] placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            // Cycle filter
            if (statusFilter === 'ALL') setStatusFilter(TaskStatus.TODO);
            else if (statusFilter === TaskStatus.TODO) setStatusFilter(TaskStatus.IN_PROGRESS);
            else if (statusFilter === TaskStatus.IN_PROGRESS) setStatusFilter(TaskStatus.DONE);
            else setStatusFilter('ALL');
          }}
          className="w-12 h-12 rounded-2xl bg-[#18181C] border border-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
          title="Filter tasks"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 4. STATUS PILL TABS (Page 28, 29, 30) */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto custom-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all shrink-0 ${
            statusFilter === 'ALL'
              ? 'bg-[#D6E3FF] text-[#001B3E] shadow-sm'
              : 'bg-[#18181C] text-zinc-400 hover:text-white'
          }`}
        >
          All Tasks
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(TaskStatus.TODO)}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all shrink-0 ${
            statusFilter === TaskStatus.TODO
              ? 'bg-[#FFD8D8] text-[#8A0000] shadow-sm'
              : 'bg-[#18181C] text-zinc-400 hover:text-white'
          }`}
        >
          To-Do
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(TaskStatus.IN_PROGRESS)}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all shrink-0 ${
            statusFilter === TaskStatus.IN_PROGRESS
              ? 'bg-[#D6E3FF] text-[#001B3E] shadow-sm'
              : 'bg-[#18181C] text-zinc-400 hover:text-white'
          }`}
        >
          In Progress
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(TaskStatus.DONE)}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all shrink-0 ${
            statusFilter === TaskStatus.DONE
              ? 'bg-[#D4EFA5] text-[#234B00] shadow-sm'
              : 'bg-[#18181C] text-zinc-400 hover:text-white'
          }`}
        >
          Done
        </button>
      </div>

      {/* 5. TASKS STACK WITH LAYOUT SWITCHER (Todoist List vs Cards) */}
      <div className="space-y-2">
        {listTasks.length > 0 && (
          <div className="flex items-center justify-between px-1 py-1 text-xs">
            <span className="font-bold text-zinc-400">
              {listTasks.length} {listTasks.length === 1 ? 'task' : 'tasks'}
            </span>

            <div className="flex items-center bg-[#151518] p-0.5 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setListLayout('todoist')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  listLayout === 'todoist'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Todoist list style"
              >
                <CheckCircle2 className="w-3 h-3 text-inherit" />
                <span>Todoist</span>
              </button>
              <button
                type="button"
                onClick={() => setListLayout('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  listLayout === 'cards'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Cards style"
              >
                <LayoutList className="w-3 h-3 text-inherit" />
                <span>Cards</span>
              </button>
            </div>
          </div>
        )}

        {listLayout === 'todoist' ? (
          <div className="space-y-1.5">
            {listTasks.map((task) => (
              <TodoistTaskRow
                key={task.id}
                task={task}
                onOpenDetail={() => setActiveDetailTaskId(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3.5">
            {listTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onCardClick={() => setActiveDetailTaskId(task.id)}
                onStatusSelect={(newStatus) => updateTaskStatus(task.id, newStatus)}
              />
            ))}
          </div>
        )}

        {listTasks.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title={
              statusFilter !== 'ALL' || searchQuery
                ? 'No matching tasks'
                : `No tasks in ${list.name} yet`
            }
            description={
              statusFilter !== 'ALL' || searchQuery
                ? 'Try resetting your status filter or search query to see all tasks in this list.'
                : `Keep ${list.name} moving forward by creating your first task.`
            }
            primaryAction={{
              label:
                statusFilter !== 'ALL' || searchQuery
                  ? 'Reset Filters'
                  : `Add Task to ${list.name}`,
              icon:
                statusFilter !== 'ALL' || searchQuery
                  ? RotateCcw
                  : Plus,
              onClick: () => {
                if (statusFilter !== 'ALL' || searchQuery) {
                  setStatusFilter('ALL');
                  setSearchQuery('');
                } else {
                  setShowQuickAdd(true);
                }
              },
            }}
            secondaryAction={
              statusFilter !== 'ALL' || searchQuery
                ? {
                    label: `Add New Task`,
                    icon: Plus,
                    onClick: () => setShowQuickAdd(true),
                  }
                : undefined
            }
          />
        )}
      </div>

      {/* 6. FLOATING ACTION BUTTON (Page 27 to 32) */}
      <button
        type="button"
        onClick={() => setShowQuickAdd(true)}
        className="fixed right-6 bottom-24 z-40 w-14 h-14 rounded-2xl bg-viora-neonLime text-black flex items-center justify-center shadow-[0_6px_20px_rgba(180,255,0,0.4)] hover:scale-105 active:scale-95 transition-all"
        title="Add Task"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Delete List Confirmation Modal (Page 19) */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm text-center space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                <h3 className="text-white text-[26px] font-extrabold tracking-tight">
                  Are you sure delete this list?
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-xs mx-auto">
                  By deleting this list, it will be permanently unavailable. If you think you may need it later, try archiving it.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    deleteList(list.id);
                    setShowDeleteModal(false);
                    goBack();
                  }}
                  className="w-full h-14 rounded-full bg-[#FF453A] text-white font-bold text-[16px] hover:bg-red-600 transition-colors shadow-lg active:scale-95"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-2 text-zinc-400 hover:text-white font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
