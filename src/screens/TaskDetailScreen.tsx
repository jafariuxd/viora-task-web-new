import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Clock,
  List as ListIcon,
  ChevronDown,
  MoreVertical,
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
import { TaskStatus } from '../types';
import { DatePickerBottomSheet } from '../components/DatePickerBottomSheet';
import { AssigneePickerBottomSheet } from '../components/AssigneePickerBottomSheet';
import { UserAvatar } from '../components/UserAvatar';

interface TaskDetailScreenProps {
  taskId: string;
  onClose: () => void;
}

/**
 * TaskDetailScreen strictly implementing the Viora Design System & Kotlin repo (TaskDetailScreen.kt):
 * - Immersive Dark theme (Black background #000000)
 * - Pure stark White cards (bg-white text-black)
 * - Spacing between all vertical and horizontal cards: EXACTLY 5.dp (space-y-[5px], gap-[5px])
 * - Status buttons (To-Do, In Progress, Done): fixed height 72.dp, rounded 24.dp
 *   - Selected: Neon Lime (#B4FF00), text Black
 *   - Unselected: White (bg-white), text Black
 * - "Due date" and "Assignees" cards: fixed height 101.dp, rounded 28.dp, stark White cards
 * - Tags and Description cards: stark White cards with distinct pastel category badges
 * - Horizontal padding: exactly 2.dp (px-[2px])
 */
export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ taskId, onClose }) => {
  const {
    tasks,
    updateTask,
    updateTaskStatus,
    deleteTask,
    lists,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
  } = useViora();

  const task = tasks.find((t) => t.id === taskId);

  const [titleValue, setTitleValue] = useState(task?.title || '');
  const [descValue, setDescValue] = useState(task?.description || '');
  const [tagInput, setTagInput] = useState('');
  const [showTagInputField, setShowTagInputField] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtaskInput, setShowAddSubtaskInput] = useState(false);

  useEffect(() => {
    if (task) {
      setTitleValue(task.title || '');
      setDescValue(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const currentList = lists.find((l) => l.id === task.listId);
  const currentListName = currentList?.name || task.folder || 'My Tasks';

  const handleTitleBlur = () => {
    setIsTitleFocused(false);
    if (titleValue.trim() && titleValue.trim() !== task.title) {
      updateTask(task.id, { title: titleValue.trim() });
    }
  };

  const handleDescBlur = () => {
    if (descValue !== task.description) {
      updateTask(task.id, { description: descValue.trim() });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const currentTags = task.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        updateTask(task.id, { tags: [...currentTags, tagInput.trim()] });
      }
      setTagInput('');
      setShowTagInputField(false);
    }
  };

  const handleCreateSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtaskInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = task.tags || [];
    updateTask(task.id, { tags: currentTags.filter((t) => t !== tagToRemove) });
  };

  const handleSelectProject = (newListId: string, newName: string) => {
    updateTask(task.id, {
      listId: newListId,
      folder: newName,
      client: newName,
    });
    setShowProjectPicker(false);
  };

  const formattedDueDate = task.dueDateText || 'Set date';
  const isPersonal =
    currentList?.isPersonal ||
    task.folder === 'Personal' ||
    task.folder === 'My Tasks' ||
    task.client === 'Personal' ||
    task.client === 'Personal Space';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 font-['SF_Pro_Display',-apple-system,sans-serif]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full max-w-lg bg-[#000000] text-white rounded-t-[28px] sm:rounded-[28px] p-2.5 sm:p-4 shadow-2xl flex flex-col h-[94vh] sm:h-[88vh] max-h-[840px] overflow-hidden relative border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            1. TOP BAR (Height 88.dp / VioraTopAppBar)
            Matches TaskDetailScreen.kt:
            - Left: Close X button (48.dp circle, border 1.dp White/20%)
            - Center: Folder dropdown pill (border 1.dp White/20%)
            - Right: More options (...) button
            ======================================================== */}
        <div className="flex items-center justify-between h-[64px] px-2 mb-1 shrink-0">
          {/* Close button X */}
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Center Folder Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProjectPicker((prev) => !prev)}
              className="h-10 px-4 rounded-full border border-white/20 text-white font-medium text-[15px] flex items-center gap-2 hover:border-[#B4FF00] hover:text-[#B4FF00] transition-colors"
            >
              <ListIcon className="w-4 h-4 text-[#B4FF00]" />
              <span className="truncate max-w-[130px]">{currentListName}</span>
              <ChevronDown className="w-4 h-4 text-white/80" />
            </button>

            {showProjectPicker && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-[#1C1C1E] border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[210px] max-h-56 overflow-y-auto scrollbar-thin animate-in fade-in zoom-in-95 text-left">
                <div className="text-[10px] uppercase font-bold text-zinc-500 px-3 py-1">Move to List</div>
                {lists.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleSelectProject(l.id, l.name)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/10 text-left"
                  >
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right 3 Dots Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu((prev) => !prev)}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              title="More Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-[#1C1C1E] border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[150px] animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    deleteTask(task.id);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10"
                >
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            SCROLLABLE CONTENT AREA
            - Horizontal padding: EXACTLY 2.dp (px-[2px])
            - Spacing between all vertical cards: EXACTLY 5.dp (space-y-[5px])
            ======================================================== */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-[2px] space-y-[5px] pb-6">
          {/* ========================================================
              CARD 1: TASK TITLE CARD
              - Pure stark White card (bg-white text-black)
              - Rounded 24.dp (rounded-[24px])
              - Min height 150.dp
              - Neon Lime 4.dp bottom line when focused
              ======================================================== */}
          <div className="bg-white text-black rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[150px] relative">
            <textarea
              rows={3}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onFocus={() => setIsTitleFocused(true)}
              onBlur={handleTitleBlur}
              placeholder="Enter task title..."
              className="w-full bg-transparent text-[22px] sm:text-[24px] font-normal text-black placeholder:text-black/40 focus:outline-none resize-none leading-snug"
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
            {/* To-Do Button */}
            <button
              type="button"
              onClick={() => updateTaskStatus(task.id, TaskStatus.TODO)}
              className={`h-[72px] rounded-[24px] text-[16px] font-medium flex items-center justify-center transition-all select-none ${
                task.status === TaskStatus.TODO
                  ? 'bg-[#B4FF00] text-black shadow-md font-semibold'
                  : 'bg-white text-black hover:bg-zinc-100'
              }`}
            >
              To-Do
            </button>

            {/* In Progress Button */}
            <button
              type="button"
              onClick={() => updateTaskStatus(task.id, TaskStatus.IN_PROGRESS)}
              className={`h-[72px] rounded-[24px] text-[16px] font-medium flex items-center justify-center transition-all select-none ${
                task.status === TaskStatus.IN_PROGRESS
                  ? 'bg-[#B4FF00] text-black shadow-md font-semibold'
                  : 'bg-white text-black hover:bg-zinc-100'
              }`}
            >
              In Progress
            </button>

            {/* Done Button */}
            <button
              type="button"
              onClick={() => updateTaskStatus(task.id, TaskStatus.DONE)}
              className={`h-[72px] rounded-[24px] text-[16px] font-medium flex items-center justify-center transition-all select-none ${
                task.status === TaskStatus.DONE
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
              {/* Badge: Due date */}
              <div className="h-[23px] bg-[#FFEBEB] text-[#5C1C1C] px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1 w-fit">
                <Clock className="w-3.5 h-3.5 text-[#5C1C1C]" />
                <span>Due date</span>
              </div>

              <div>
                <p className="text-[19px] sm:text-[20px] font-medium text-black tracking-tight leading-tight">
                  {formattedDueDate}
                </p>
                <div className="mt-1 h-[20px] bg-[#EFF1F5] text-[#5E6064] px-2 rounded-full text-[10px] font-medium flex items-center gap-1 w-fit">
                  <Link2 className="w-3 h-3 text-[#5E6064]" />
                  <span>
                    {task.deadlineSource === 'TEAM'
                      ? 'Team Deadline'
                      : task.deadlineSource === 'LIST'
                      ? 'List Deadline'
                      : `${task.daysLeft ?? 2} days left`}
                  </span>
                </div>
              </div>
            </button>

            {/* Assignees Card (Right) */}
            <button
              type="button"
              onClick={() => setShowAssigneePicker(true)}
              className="h-[101px] rounded-[28px] bg-white text-black p-[18px] py-[12px] flex flex-col justify-between text-left transition-all hover:bg-zinc-50 select-none shadow-sm"
            >
              {/* Badge: Assignees */}
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
                ) : !task.assigneePhotos || task.assigneePhotos.length === 0 ? (
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
                    {task.assigneePhotos.slice(0, 3).map((a, i) => (
                      <div key={i} className="ring-2 ring-white rounded-full">
                        <UserAvatar userId={a} size={28} />
                      </div>
                    ))}
                    {task.assigneePhotos.length > 3 && (
                      <span className="w-7 h-7 rounded-full bg-[#EFF1F5] text-[#5E6064] text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        +{task.assigneePhotos.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* ========================================================
              CARD 4: TAGS CARD
              - Stark White card (bg-white text-black)
              - Rounded 24.dp (rounded-[24px])
              - Badge: Tags (containerColor #EBF2FF, textColor #224075)
              - Tag pills in #F2F4F7, Black text, + Neon Lime add button
              ======================================================== */}
          <div className="bg-white text-black rounded-[24px] px-[18px] pt-[14px] pb-[18px] text-left shadow-sm">
            <div className="h-[23px] bg-[#EBF2FF] text-[#224075] px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1 w-fit mb-3">
              <Tag className="w-3.5 h-3.5 text-[#224075]" />
              <span>Tags</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(task.tags || []).map((t) => (
                <div
                  key={t}
                  className="bg-[#F2F4F7] text-black px-3.5 py-1.5 rounded-[30px] text-[14px] font-medium flex items-center gap-1.5"
                >
                  <span># {t}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(t);
                    }}
                    className="text-black/40 hover:text-black ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {showTagInputField ? (
                <div className="flex items-center gap-1 bg-[#F2F4F7] rounded-[30px] px-3 py-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTag();
                      if (e.key === 'Escape') setShowTagInputField(false);
                    }}
                    placeholder="New tag..."
                    className="bg-transparent text-[13px] text-black focus:outline-none w-24"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-black font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagInputField(true)}
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
              - Stark White card (bg-white text-black)
              - Rounded 24.dp (rounded-[24px])
              - Badge: Subtasks (containerColor #E8F8F5, textColor #0E6251)
              - Actionable subtasks with toggle calling toggleSubtask(task.id, subtaskId)
              - Strike-through on done, audio/haptic confirmation
              - Inline add subtask and delete subtask
              ======================================================== */}
          <div className="bg-white text-black rounded-[24px] px-[18px] pt-[14px] pb-[18px] text-left shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="h-[23px] bg-[#E8F8F5] text-[#0E6251] px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 w-fit">
                <CheckSquare className="w-3.5 h-3.5 text-[#0E6251]" />
                <span>Subtasks</span>
              </div>
              {(task.subtasks || []).length > 0 && (
                <span className="text-[12px] font-medium text-[#5E6064]">
                  {(task.subtasks || []).filter((s) => s.completed).length} of {(task.subtasks || []).length} done
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {(task.subtasks || []).map((st) => (
                <div
                  key={st.id}
                  className="group flex items-center justify-between gap-2.5 py-1 px-2 rounded-xl hover:bg-[#F2F4F7] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, st.id)}
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
                    onClick={() => deleteSubtask(task.id, st.id)}
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
                      if (e.key === 'Enter') handleCreateSubtask();
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
                    onClick={handleCreateSubtask}
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
              - Stark White card (bg-white text-black)
              - Rounded 24.dp (rounded-[24px])
              - Min height 103.dp
              - Badge: Description (containerColor #FFF4D1, textColor #6B5300)
              ======================================================== */}
          <div className="bg-white text-black rounded-[24px] px-[18px] pt-[14px] pb-[18px] text-left min-h-[103px] shadow-sm flex flex-col justify-between">
            <div className="h-[23px] bg-[#FFF4D1] text-[#6B5300] px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1 w-fit mb-2">
              <AlignLeft className="w-3.5 h-3.5 text-[#6B5300]" />
              <span>Description</span>
            </div>

            <textarea
              rows={3}
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={handleDescBlur}
              placeholder="Write task description..."
              className="w-full bg-transparent text-[16px] font-normal text-black placeholder:text-black/40 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </motion.div>

      {/* Date Picker Sheet */}
      {showDatePicker && (
        <DatePickerBottomSheet
          currentDueDateText={task.dueDateText || ''}
          currentDaysLeft={task.daysLeft || 0}
          currentDeadlineMillis={task.selectedDeadlineMillis}
          onDismiss={() => setShowDatePicker(false)}
          onSelect={(dueDateText: string, daysLeft: number, deadlineMillis: number) => {
            updateTask(task.id, {
              daysLeft,
              dueDateText,
              selectedDeadlineMillis: deadlineMillis,
            });
            setShowDatePicker(false);
          }}
        />
      )}

      {/* Assignee Picker Sheet */}
      {showAssigneePicker && (
        <AssigneePickerBottomSheet
          currentAssignees={task.assigneePhotos || []}
          onDismiss={() => setShowAssigneePicker(false)}
          onSubmit={(assignees: string[]) => {
            updateTask(task.id, { assigneePhotos: assignees });
            setShowAssigneePicker(false);
          }}
        />
      )}
    </div>
  );
};
