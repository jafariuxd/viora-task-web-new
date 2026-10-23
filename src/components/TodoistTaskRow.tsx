import React, { useState } from 'react';
import {
  Clock,
  Folder,
  ChevronDown,
  User,
  Check,
} from 'lucide-react';
import { type Task, TaskStatus } from '../types';
import { useViora } from '../context/VioraContext';

interface TodoistTaskRowProps {
  task: Task;
  onOpenDetail?: () => void;
}

export const TodoistTaskRow: React.FC<TodoistTaskRowProps> = ({
  task,
  onOpenDetail,
}) => {
  const { updateTaskStatus, setActiveDetailTaskId, lists } = useViora();
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const isDone = task.status === TaskStatus.DONE;
  const projectList = lists.find((l) => l.id === task.listId);
  const projectName = projectList?.name || task.folder || task.client || 'My Tasks';

  const validAssigneesCount =
    task.assigneePhotos && task.assigneePhotos.length > 0
      ? task.assigneePhotos.filter((a) => a && a !== 'unassigned' && a.trim() !== '').length
      : 0;

  const handleCardClick = () => {
    if (onOpenDetail) onOpenDetail();
    else setActiveDetailTaskId(task.id);
  };

  const handleStatusSelect = (e: React.MouseEvent, newStatus: TaskStatus) => {
    e.stopPropagation();
    setShowStatusPicker(false);
    updateTaskStatus(task.id, newStatus);
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-full bg-white text-black rounded-[28px] p-5 shadow-sm hover:shadow-md transition-all select-none cursor-pointer font-['SF_Pro_Display',-apple-system,sans-serif] relative group border border-black/5"
    >
      {/* Top Row: Deadline Info on left, List Folder on right */}
      <div className="flex items-center justify-between text-[13px] text-zinc-500 font-medium">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            {task.daysLeft === 0
              ? 'Due Today'
              : task.daysLeft === 1
              ? '1 day left'
              : task.daysLeft < 0
              ? `${task.daysLeft} days left`
              : `${task.daysLeft} days left`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-500">
          <Folder className="w-3.5 h-3.5 text-zinc-400" />
          <span>{projectName}</span>
        </div>
      </div>

      {/* Middle Row: Large Bold Task Title */}
      <h3 className={`text-[21px] sm:text-[22px] font-bold text-black tracking-tight leading-snug my-3 ${
        isDone ? 'line-through text-zinc-400' : ''
      }`}>
        {task.title}
      </h3>

      {/* Bottom Row: Status Pill on left, Assignee Pill on right */}
      <div className="flex items-center justify-between pt-1">
        {/* Status Pill Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusPicker((prev) => !prev);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              task.status === TaskStatus.DONE
                ? 'bg-[#EAF8EE] text-[#153322]'
                : task.status === TaskStatus.IN_PROGRESS
                ? 'bg-[#E6F4FE] text-[#001B3E]'
                : 'bg-[#FFEBEB] text-[#8A0000]'
            }`}
          >
            <span>{task.status}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showStatusPicker && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 bottom-full mb-1 z-50 bg-[#1C1C1E] text-white border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[140px] animate-in fade-in zoom-in-95"
            >
              {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => handleStatusSelect(e, s as TaskStatus)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors ${
                    task.status === s ? 'bg-white/15 text-[#B4FF00]' : 'text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <span>{s}</span>
                  {task.status === s && <Check className="w-3.5 h-3.5 text-[#B4FF00]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assignee Pill */}
        <div className="bg-[#F1F3F5] text-zinc-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-zinc-500" />
          <span>{validAssigneesCount > 0 ? validAssigneesCount : 'Unassigned'}</span>
        </div>
      </div>
    </div>
  );
};
