import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Clock,
  List as ListIcon,
  ChevronDown,
  Users,
  Lock,
  Tag,
  AlignLeft,
  Link2,
  Plus,
  UserPlus,
  CheckSquare,
  Check,
  Trash2,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskStatus, type TaskPriority } from '../types';
import { AssigneePickerBottomSheet } from './AssigneePickerBottomSheet';
import { DatePickerBottomSheet } from './DatePickerBottomSheet';
import { UserAvatar } from './UserAvatar';

interface DraftSubtask {
  id: string;
  title: string;
  completed: boolean;
}

/**
 * Comprehensive Task Flow (Full Screen Modal / Drawer)
 * Strictly matches Viora Design System & Kotlin Mobile App (TaskDetailScreen.kt):
 * - Immersive Dark theme (Pitch Black background #000000)
 * - Stark White cards (bg-white text-black)
 * - Spacing between all vertical and horizontal cards: EXACTLY 5.dp (space-y-[5px], gap-[5px])
 * - 3 Status buttons (To-Do, In Progress, Done): Fixed height 72.dp (h-[72px]), rounded 24.dp
 * - "Due date" and "Assignees" cards: Fixed height 101.dp (h-[101px]), rounded 28.dp
 * - Tags, Subtasks, and Description cards: Stark White cards (rounded 24.dp)
 * - Horizontal padding: EXACTLY 2.dp (px-[2px])
 */
export function QuickAddModal() {
  const {
    showQuickAdd,
    setShowQuickAdd,
    addTask,
    teams,
    lists,
    userProfile,
    selectedProjectId,
  } = useViora();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority] = useState<TaskPriority>(4);
  const [daysLeft, setDaysLeft] = useState<number>(userProfile?.stats?.defaultDeadlineDays || 3);
  const [dueDateText, setDueDateText] = useState('In 3 days');
  const [selectedListId, setSelectedListId] = useState(selectedProjectId || lists[0]?.id || '');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([userProfile?.username || 'mehran']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draftSubtasks, setDraftSubtasks] = useState<DraftSubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtaskInput, setShowAddSubtaskInput] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTagInput, setShowAddTagInput] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  const [showListPicker, setShowListPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize list from selectedProjectId or default list
  useEffect(() => {
    if (showQuickAdd) {
      if (selectedProjectId) {
        setSelectedListId(selectedProjectId);
      } else if (lists.length > 0) {
        setSelectedListId(lists[0].id);
      }
      if (userProfile?.username) {
        setSelectedAssignees([userProfile.username]);
      }
      const defDays = userProfile?.stats?.defaultDeadlineDays || 3;
      setDaysLeft(defDays);
      setDueDateText(`In ${defDays} days`);
      setTimeout(() => {
        titleTextareaRef.current?.focus();
      }, 100);
    }
  }, [showQuickAdd, selectedProjectId, lists, userProfile]);

  const currentList = lists.find((l) => l.id === selectedListId) || lists[0];
  const currentTeam = teams.find((t) => t.id === currentList?.teamId) || teams[0];
  const currentListName = currentList?.name || currentTeam?.name || 'My Tasks';
  const isPersonal = currentList?.isPersonal || !currentList?.teamId || currentListName === 'My Tasks';

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddNewTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
      setNewTagInput('');
      setShowAddTagInput(false);
    }
  };

  const handleAddDraftSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setDraftSubtasks((prev) => [
        ...prev,
        {
          id: 'draft_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title: newSubtaskTitle.trim(),
          completed: false,
        },
      ]);
      setNewSubtaskTitle('');
      setShowAddSubtaskInput(false);
    }
  };

  const handleToggleDraftSubtask = (id: string) => {
    setDraftSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteDraftSubtask = (id: string) => {
    setDraftSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (daysLeft || 0));

    addTask({
      title: title.trim(),
      client: currentTeam?.name || 'Personal',
      teamId: currentTeam?.id || '',
      listId: currentList?.id || '',
      daysLeft,
      status,
      priority,
      assigneePhotos: selectedAssignees.length ? selectedAssignees : [userProfile?.username || 'mehran'],
      isUnplanned: false,
      description: description.trim(),
      tags: selectedTags,
      dueDateText,
      selectedDeadlineMillis: targetDate.getTime(),
      computedDeadlineMillis: targetDate.getTime(),
      folder: currentListName,
      subtasks: draftSubtasks.map((st) => ({
        id: 'sub_' + Math.random().toString(36).substring(2, 9),
        title: st.title,
        completed: st.completed,
      })),
    });

    // Reset draft fields
    setTitle('');
    setDescription('');
    setSelectedTags([]);
    setDraftSubtasks([]);
    setStatus(TaskStatus.TODO);
    setShowQuickAdd(false);
  };

  // Keyboard shortcuts: Esc to close, Cmd/Ctrl+Enter to save
  useEffect(() => {
    if (!showQuickAdd) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showListPicker && !showDatePicker && !showAssigneePicker) {
        setShowQuickAdd(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuickAdd, showListPicker, showDatePicker, showAssigneePicker, title, description, status, daysLeft, selectedListId, selectedAssignees, selectedTags, draftSubtasks, setShowQuickAdd]);

  if (!showQuickAdd) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 font-['SF_Pro_Display',-apple-system,sans-serif]"
        onClick={() => setShowQuickAdd(false)}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-lg bg-[#000000] text-white rounded-t-[28px] sm:rounded-[28px] p-2.5 sm:p-4 shadow-2xl flex flex-col h-[94vh] sm:h-[88vh] max-h-[860px] overflow-hidden relative border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ========================================================
              1. TOP BAR (Height 64px / VioraTopAppBar)
              ======================================================== */}
          <div className="flex items-center justify-between h-[64px] px-2 mb-1 shrink-0">
            {/* Close button X */}
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Center Folder/List Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowListPicker((prev) => !prev)}
                className="h-10 px-4 rounded-full border border-white/20 text-white font-medium text-[15px] flex items-center gap-2 hover:border-[#B4FF00] hover:text-[#B4FF00] transition-colors"
              >
                <ListIcon className="w-4 h-4 text-[#B4FF00]" />
                <span className="truncate max-w-[130px]">{currentListName}</span>
                <ChevronDown className="w-4 h-4 text-white/80" />
              </button>

              {showListPicker && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-[#1C1C1E] border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[210px] max-h-56 overflow-y-auto scrollbar-thin animate-in fade-in zoom-in-95 text-left">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 px-3 py-1">Choose Destination List</div>
                  {lists.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setSelectedListId(l.id);
                        setShowListPicker(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/10 text-left"
                    >
                      <span className="truncate">{l.name}</span>
                      {selectedListId === l.id && <Check className="w-3.5 h-3.5 text-[#B4FF00]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Top Right Save Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!title.trim()}
              className="h-10 px-4 rounded-full bg-[#B4FF00] text-black font-semibold text-[14px] flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Save</span>
            </button>
          </div>

          {/* ========================================================
              SCROLLABLE CONTENT AREA
              - Horizontal padding: EXACTLY 2.dp (px-[2px])
              - Spacing between cards: EXACTLY 5.dp (space-y-[5px])
              ======================================================== */}
          <div className="flex-1 overflow-y-auto scrollbar-none px-[2px] space-y-[5px] pb-6">
            {/* ========================================================
                CARD 1: TASK TITLE CARD
                - Pure stark White card (bg-white text-black)
                - Rounded 24.dp (rounded-[24px])
                - Min height 140.dp
                - Neon Lime 4.dp bottom line when focused
                ======================================================== */}
            <div className="bg-white text-black rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] relative">
              <textarea
                ref={titleTextareaRef}
                rows={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
                placeholder="What needs to be done?..."
                className="w-full bg-transparent text-[22px] sm:text-[24px] font-normal text-black placeholder:text-black/40 focus:outline-none resize-none leading-snug whitespace-pre-wrap"
              />

              {/* Neon Lime Accent indicator at bottom of Title Card */}
              <div
                className={`w-full h-1 bg-[#B4FF00] rounded-full transition-opacity duration-200 ${
                  isTitleFocused ? 'opacity-100' : 'opacity-25'
                }`}
              />
            </div>

            {/* ========================================================
                ROW 2: STATUS BUTTONS
                - 3 Equal Buttons: To-Do, In Progress, Done
                - Fixed Height: EXACTLY 72.dp (h-[72px])
                - Rounded: 24.dp (rounded-[24px])
                - Selected: Neon Lime (#B4FF00), Black text
                - Unselected: White (bg-white), Black text
                - Spacing: EXACTLY 5.dp (gap-[5px])
                ======================================================== */}
            <div className="grid grid-cols-3 gap-[5px]">
              <button
                type="button"
                onClick={() => setStatus(TaskStatus.TODO)}
                className={`h-[72px] rounded-[24px] text-[16px] font-medium flex items-center justify-center transition-all select-none ${
                  status === TaskStatus.TODO
                    ? 'bg-[#B4FF00] text-black shadow-md font-semibold'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                To-Do
              </button>

              <button
                type="button"
                onClick={() => setStatus(TaskStatus.IN_PROGRESS)}
                className={`h-[72px] rounded-[24px] text-[16px] font-medium flex items-center justify-center transition-all select-none ${
                  status === TaskStatus.IN_PROGRESS
                    ? 'bg-[#B4FF00] text-black shadow-md font-semibold'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                In Progress
              </button>

              <button
                type="button"
                onClick={() => setStatus(TaskStatus.DONE)}
                className={`h-[72px] rounded-[24px] text-[16px] font-medium flex items-center justify-center transition-all select-none ${
                  status === TaskStatus.DONE
                    ? 'bg-[#B4FF00] text-black shadow-md font-semibold'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                Done
              </button>
            </div>

            {/* ========================================================
                ROW 3: 2-COLUMN GRID (Due Date & Assignees Cards)
                - Fixed Height: EXACTLY 101.dp (h-[101px])
                - Rounded: 28.dp (rounded-[28px])
                - Stark White cards (bg-white text-black)
                - Horizontal Spacing: EXACTLY 5.dp (gap-[5px])
                ======================================================== */}
            <div className="grid grid-cols-2 gap-[5px]">
              {/* Due Date Card (Left) */}
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="h-[101px] rounded-[28px] bg-white text-black p-[18px] py-[12px] flex flex-col justify-between text-left transition-all hover:bg-zinc-50 select-none shadow-sm"
              >
                <div className="h-[23px] bg-[#FFEBEB] text-[#5C1C1C] px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1 w-fit">
                  <Clock className="w-3.5 h-3.5 text-[#5C1C1C]" />
                  <span>Due date</span>
                </div>

                <div>
                  <p className="text-[19px] sm:text-[20px] font-medium text-black tracking-tight leading-tight">
                    {dueDateText}
                  </p>
                  <div className="mt-1 h-[20px] bg-[#EFF1F5] text-[#5E6064] px-2 rounded-full text-[10px] font-medium flex items-center gap-1 w-fit">
                    <Link2 className="w-3 h-3 text-[#5E6064]" />
                    <span>{daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}</span>
                  </div>
                </div>
              </button>

              {/* Assignees Card (Right) */}
              <button
                type="button"
                onClick={() => setShowAssigneePicker(true)}
                className="h-[101px] rounded-[28px] bg-white text-black p-[18px] py-[12px] flex flex-col justify-between text-left transition-all hover:bg-zinc-50 select-none shadow-sm"
              >
                <div className="h-[23px] bg-[#EBF8D0] text-[#2E4D00] px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1 w-fit">
                  <Users className="w-3.5 h-3.5 text-[#2E4D00]" />
                  <span>Assignees</span>
                </div>

                <div>
                  {isPersonal ? (
                    <>
                      <p className="text-[19px] sm:text-[20px] font-medium text-black tracking-tight leading-tight">
                        Personal
                      </p>
                      <div className="mt-1 text-[#5C7E10] text-[11px] font-medium flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-[#5C7E10]" />
                        <span>Private to you</span>
                      </div>
                    </>
                  ) : !selectedAssignees || selectedAssignees.length === 0 ? (
                    <>
                      <p className="text-[19px] sm:text-[20px] font-medium text-black tracking-tight leading-tight">
                        Not Assigned
                      </p>
                      <div className="mt-1 text-[#8CC63F] text-[11px] font-medium flex items-center gap-1">
                        <UserPlus className="w-3.5 h-3.5 text-[#8CC63F]" />
                        <span>Add user</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center -space-x-2 mt-1">
                      {selectedAssignees.slice(0, 3).map((a, i) => (
                        <div key={i} className="ring-2 ring-white rounded-full">
                          <UserAvatar userId={a} size={28} />
                        </div>
                      ))}
                      {selectedAssignees.length > 3 && (
                        <span className="w-7 h-7 rounded-full bg-[#EFF1F5] text-[#5E6064] text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                          +{selectedAssignees.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* ========================================================
                CARD 4: TAGS CARD
                ======================================================== */}
            <div className="bg-white text-black rounded-[24px] px-[18px] pt-[14px] pb-[18px] text-left shadow-sm">
              <div className="h-[23px] bg-[#EBF2FF] text-[#224075] px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1 w-fit mb-3">
                <Tag className="w-3.5 h-3.5 text-[#224075]" />
                <span>Tags</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedTags.map((t) => (
                  <div
                    key={t}
                    className="bg-[#F2F4F7] text-black px-3.5 py-1.5 rounded-[30px] text-[14px] font-medium flex items-center gap-1.5"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleTag(t)}
                      className="text-black/40 hover:text-black ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {showAddTagInput ? (
                  <div className="flex items-center gap-1 bg-[#F2F4F7] rounded-[30px] px-3 py-1">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddNewTag();
                        if (e.key === 'Escape') setShowAddTagInput(false);
                      }}
                      placeholder="Tag..."
                      className="bg-transparent text-[13px] text-black focus:outline-none w-20"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddNewTag}
                      className="text-black font-bold text-xs"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddTagInput(true)}
                    className="w-[34px] h-[34px] rounded-full bg-[#B4FF00] text-black flex items-center justify-center hover:brightness-105 active:scale-95 transition-all"
                    title="Add Tag"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>

            {/* ========================================================
                CARD 5: SUBTASKS CARD
                ======================================================== */}
            <div className="bg-white text-black rounded-[24px] px-[18px] pt-[14px] pb-[18px] text-left shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="h-[23px] bg-[#E8F8F5] text-[#0E6251] px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 w-fit">
                  <CheckSquare className="w-3.5 h-3.5 text-[#0E6251]" />
                  <span>Subtasks</span>
                </div>
                {draftSubtasks.length > 0 && (
                  <span className="text-[12px] font-medium text-[#5E6064]">
                    {draftSubtasks.filter((s) => s.completed).length} of {draftSubtasks.length} done
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {draftSubtasks.map((st) => (
                  <div
                    key={st.id}
                    className="group flex items-center justify-between gap-2.5 py-1 px-2 rounded-xl hover:bg-[#F2F4F7] transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleDraftSubtask(st.id)}
                      className="flex items-center gap-3 text-left min-w-0 flex-1 py-1"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                          st.completed
                            ? 'bg-[#B4FF00] border-[#B4FF00] text-black shadow-sm'
                            : 'border-black/30 hover:border-black bg-white'
                        }`}
                      >
                        {st.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-[15px] font-normal leading-tight break-words flex-1 ${
                          st.completed ? 'line-through text-black/40' : 'text-black'
                        }`}
                      >
                        {st.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDraftSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-black/30 hover:text-red-600 transition-opacity"
                      title="Delete subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Subtask Input / Button */}
                {showAddSubtaskInput ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddDraftSubtask();
                        if (e.key === 'Escape') {
                          setShowAddSubtaskInput(false);
                          setNewSubtaskTitle('');
                        }
                      }}
                      placeholder="Subtask title..."
                      className="flex-1 bg-[#F2F4F7] rounded-xl px-3 py-1.5 text-[14px] text-black focus:outline-none placeholder:text-black/40"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddDraftSubtask}
                      disabled={!newSubtaskTitle.trim()}
                      className="px-3 py-1.5 rounded-xl bg-[#B4FF00] text-black font-semibold text-xs disabled:opacity-40"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSubtaskInput(false);
                        setNewSubtaskTitle('');
                      }}
                      className="p-1.5 text-black/40 hover:text-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddSubtaskInput(true)}
                    className="flex items-center gap-2 text-black/70 hover:text-black text-[13px] font-medium pt-1 px-1 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#B4FF00] text-black flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Add subtask</span>
                  </button>
                )}
              </div>
            </div>

            {/* ========================================================
                CARD 6: DESCRIPTION CARD
                ======================================================== */}
            <div className="bg-white text-black rounded-[24px] px-[18px] pt-[14px] pb-[18px] text-left min-h-[103px] shadow-sm flex flex-col justify-between">
              <div className="h-[23px] bg-[#FFF4D1] text-[#6B5300] px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1 w-fit mb-2">
                <AlignLeft className="w-3.5 h-3.5 text-[#6B5300]" />
                <span>Description</span>
              </div>

              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write task description (optional)..."
                className="w-full bg-transparent text-[16px] font-normal text-black placeholder:text-black/40 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Bottom Create Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!title.trim()}
                className="w-full h-[56px] rounded-[24px] bg-[#B4FF00] text-black font-bold text-[16px] flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Date Picker Sheet */}
      {showDatePicker && (
        <DatePickerBottomSheet
          currentDueDateText={dueDateText}
          currentDaysLeft={daysLeft}
          onDismiss={() => setShowDatePicker(false)}
          onSelect={(date, days) => {
            setDueDateText(date);
            setDaysLeft(days);
            setShowDatePicker(false);
          }}
        />
      )}

      {/* Assignee Picker Sheet */}
      {showAssigneePicker && (
        <AssigneePickerBottomSheet
          currentAssignees={selectedAssignees}
          onDismiss={() => setShowAssigneePicker(false)}
          onSubmit={(assignees) => {
            setSelectedAssignees(assignees);
            setShowAssigneePicker(false);
          }}
        />
      )}
    </>
  );
}
