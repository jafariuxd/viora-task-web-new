import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Calendar,
  Folder,
  ChevronDown,
  Check,
  Flag,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskStatus, type TaskPriority } from '../types';
import { UserAvatar } from './UserAvatar';

const PRIORITY_CONFIG = {
  1: { label: 'Priority 1', color: 'text-red-500', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  2: { label: 'Priority 2', color: 'text-amber-500', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  3: { label: 'Priority 3', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  4: { label: 'Priority 4', color: 'text-zinc-400', bg: 'bg-white/5', border: 'border-white/10' },
};

interface InlineTaskCreatorProps {
  defaultStatus?: TaskStatus;
  defaultDaysLeft?: number;
  defaultListId?: string;
  placeholder?: string;
  className?: string;
  onAdded?: () => void;
}

export const InlineTaskCreator: React.FC<InlineTaskCreatorProps> = ({
  defaultStatus = TaskStatus.TODO,
  defaultDaysLeft = 0,
  defaultListId,
  placeholder = 'Add task (e.g. Design review #Sprint @mohammad)',
  className = '',
  onAdded,
}) => {
  const { addTask, teams, lists, users, userProfile } = useViora();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(4);
  const [daysLeft, setDaysLeft] = useState<number>(defaultDaysLeft);
  const [selectedListId, setSelectedListId] = useState<string>(
    defaultListId || lists[0]?.id || ''
  );
  const [selectedAssignee, setSelectedAssignee] = useState<string>(() => {
    return userProfile?.username || 'mehran';
  });

  // Popover menus
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setStatus(defaultStatus);
    setDaysLeft(defaultDaysLeft);
    if (defaultListId) setSelectedListId(defaultListId);
    if (userProfile?.username) setSelectedAssignee(userProfile.username);
    setIsOpen(true);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsOpen(false);
    setShowDatePicker(false);
    setShowProjectPicker(false);
    setShowStatusPicker(false);
    setShowAssigneePicker(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const selectedList = lists.find((l) => l.id === selectedListId);
    const parentTeam = selectedList
      ? teams.find((t) => t.id === selectedList.teamId)
      : teams[0];

    // Format target date text
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysLeft);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dueDateText = `${targetDate.getFullYear()} ${months[targetDate.getMonth()]} ${String(targetDate.getDate()).padStart(2, '0')}`;

    addTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      daysLeft,
      dueDateText,
      selectedDeadlineMillis: targetDate.getTime(),
      client: parentTeam?.name || 'Personal',
      folder: selectedList?.name || parentTeam?.name || 'Personal',
      teamId: parentTeam?.id || '',
      listId: selectedListId,
      assigneePhotos: [selectedAssignee],
      tags: [],
      isUnplanned: false,
      subtasks: [],
    });

    setTitle('');
    setDescription('');
    if (onAdded) onAdded();
    // Keep open for rapid entry!
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const selectedList = lists.find((l) => l.id === selectedListId);
  const selectedUser = users.find((u) => u.username === selectedAssignee);

  const getDateLabel = () => {
    if (daysLeft === 0) return 'Today';
    if (daysLeft === 1) return 'Tomorrow';
    if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
    if (daysLeft <= 7) return `In ${daysLeft} days`;
    return `In ${daysLeft} days`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className={`w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-all text-[14px] font-medium ${className}`}
      >
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-viora-neonLime group-hover:bg-viora-neonLime group-hover:text-black transition-all">
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </span>
        <span>Add task</span>
      </button>
    );
  }

  return (
    <div
      className={`bg-[#17171A] border border-white/10 rounded-2xl p-3.5 shadow-xl transition-all ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Title Input */}
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-white placeholder-zinc-500 text-[15px] font-semibold focus:outline-none mb-1.5 tracking-tight"
      />

      {/* Description Input */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          } else if (e.key === 'Escape') {
            handleCancel();
          }
        }}
        placeholder="Description (optional)"
        rows={2}
        className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 text-[13px] focus:outline-none resize-none leading-relaxed mb-3"
      />

      {/* Attribute Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-3.5 relative">
        {/* Date Selector Chip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDatePicker((prev) => !prev);
              setShowProjectPicker(false);
              setShowStatusPicker(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              daysLeft === 0
                ? 'bg-viora-neonLime/15 text-viora-neonLime border-viora-neonLime/30'
                : daysLeft < 0
                ? 'bg-red-500/15 text-red-400 border-red-500/30'
                : 'bg-white/5 text-zinc-300 border-white/10 hover:border-white/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{getDateLabel()}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showDatePicker && (
            <div className="absolute left-0 bottom-full mb-1 z-50 bg-[#1C1C1F] border border-white/10 rounded-xl p-1.5 shadow-2xl min-w-[160px] animate-in fade-in zoom-in-95">
              <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">Due Date</div>
              <button
                type="button"
                onClick={() => { setDaysLeft(0); setShowDatePicker(false); }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 text-left"
              >
                <span>Today</span>
                {daysLeft === 0 && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
              </button>
              <button
                type="button"
                onClick={() => { setDaysLeft(1); setShowDatePicker(false); }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 text-left"
              >
                <span>Tomorrow</span>
                {daysLeft === 1 && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
              </button>
              <button
                type="button"
                onClick={() => { setDaysLeft(3); setShowDatePicker(false); }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 text-left"
              >
                <span>In 3 days</span>
                {daysLeft === 3 && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
              </button>
              <button
                type="button"
                onClick={() => { setDaysLeft(7); setShowDatePicker(false); }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 text-left"
              >
                <span>Next Week (7d)</span>
                {daysLeft === 7 && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
              </button>
            </div>
          )}
        </div>

        {/* Priority Flag Chip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowPriorityPicker((prev) => !prev);
              setShowDatePicker(false);
              setShowProjectPicker(false);
              setShowStatusPicker(false);
              setShowAssigneePicker(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              PRIORITY_CONFIG[priority].bg
            } ${PRIORITY_CONFIG[priority].color} ${PRIORITY_CONFIG[priority].border}`}
          >
            <Flag className="w-3.5 h-3.5 fill-current" />
            <span>P{priority}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showPriorityPicker && (
            <div className="absolute left-0 bottom-full mb-1 z-50 bg-[#1C1C1F] border border-white/10 rounded-xl p-1.5 shadow-2xl min-w-[150px] animate-in fade-in zoom-in-95">
              <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">Priority</div>
              {([1, 2, 3, 4] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPriority(p);
                    setShowPriorityPicker(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-white/10 text-left"
                >
                  <span className={`flex items-center gap-2 ${PRIORITY_CONFIG[p].color}`}>
                    <Flag className="w-3.5 h-3.5 fill-current" />
                    <span>{PRIORITY_CONFIG[p].label}</span>
                  </span>
                  {priority === p && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project/List Chip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProjectPicker((prev) => !prev);
              setShowDatePicker(false);
              setShowStatusPicker(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-all"
          >
            <Folder className="w-3.5 h-3.5 text-viora-neonLime" />
            <span className="truncate max-w-[120px]">{selectedList?.name || 'Inbox'}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showProjectPicker && (
            <div className="absolute left-0 bottom-full mb-1 z-50 bg-[#1C1C1F] border border-white/10 rounded-xl p-1.5 shadow-2xl min-w-[180px] max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
              <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">Project / List</div>
              {lists.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => { setSelectedListId(l.id); setShowProjectPicker(false); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 text-left"
                >
                  <span className="truncate">{l.name}</span>
                  {selectedListId === l.id && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Chip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowStatusPicker((prev) => !prev);
              setShowDatePicker(false);
              setShowProjectPicker(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-all"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === TaskStatus.DONE
                  ? 'bg-emerald-400'
                  : status === TaskStatus.IN_PROGRESS
                  ? 'bg-blue-400'
                  : 'bg-amber-400'
              }`}
            />
            <span>{status}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showStatusPicker && (
            <div className="absolute left-0 bottom-full mb-1 z-50 bg-[#1C1C1F] border border-white/10 rounded-xl p-1.5 shadow-2xl min-w-[140px] animate-in fade-in zoom-in-95">
              <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">Status</div>
              <button
                type="button"
                onClick={() => { setStatus(TaskStatus.TODO); setShowStatusPicker(false); }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 text-left"
              >
                <span>To-Do</span>
                {status === TaskStatus.TODO && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
              </button>
              <button
                type="button"
                onClick={() => { setStatus(TaskStatus.IN_PROGRESS); setShowStatusPicker(false); }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 text-left"
              >
                <span>In Progress</span>
                {status === TaskStatus.IN_PROGRESS && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
              </button>
              <button
                type="button"
                onClick={() => { setStatus(TaskStatus.DONE); setShowStatusPicker(false); }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 text-left"
              >
                <span>Done</span>
                {status === TaskStatus.DONE && <Check className="w-3.5 h-3.5 text-viora-neonLime" />}
              </button>
            </div>
          )}
        </div>

        {/* Assignee Chip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowAssigneePicker((prev) => !prev);
              setShowDatePicker(false);
              setShowProjectPicker(false);
              setShowStatusPicker(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-all"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
              <UserAvatar userId={selectedAssignee} size={16} />
            </div>
            <span className="capitalize">{selectedUser?.name ? selectedUser.name.split(' ')[0] : (selectedAssignee === 'mehran' ? 'Mehran' : selectedAssignee)}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showAssigneePicker && (
            <div className="absolute left-0 bottom-full mb-1 z-50 bg-[#1C1C1F] border border-white/10 rounded-xl p-1.5 shadow-2xl min-w-[170px] animate-in fade-in zoom-in-95">
              <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">Assignee</div>
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { setSelectedAssignee(u.username); setShowAssigneePicker(false); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4.5 h-4.5 rounded-full overflow-hidden shrink-0">
                      <UserAvatar userId={u.username} size={18} />
                    </div>
                    <span className="truncate">{u.name}</span>
                  </div>
                  {selectedAssignee === u.username && <Check className="w-3.5 h-3.5 text-viora-neonLime shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={handleCancel}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!title.trim()}
          className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-viora-neonLime text-black hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 shadow-md"
        >
          <span>Add task</span>
          <span className="text-[10px] opacity-75 font-mono">↵</span>
        </button>
      </div>
    </div>
  );
};
