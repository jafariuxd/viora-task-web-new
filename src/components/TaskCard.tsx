import React, { useState } from 'react';
import {
  Clock,
  CalendarX,
  List as ListIcon,
  Link as LinkIcon,
  ChevronDown,
  User as UserIcon,
  Check,
} from 'lucide-react';
import { type Task, TaskStatus } from '../types';
import { useViora } from '../context/VioraContext';
import { UserAvatar } from './UserAvatar';

interface TaskCardProps {
  task: Task;
  onCardClick?: () => void;
  onStatusSelect?: (newStatus: TaskStatus) => void;
  isHero?: boolean;
}

/**
 * Card 4: Next Task Card (NextTaskCard) & Subsequent Task Cards (TaskListItemCard)
 * Exactly matching Viora design specifications:
 * - Container: Full width, background #FFFFFF, border-radius 28px, padding 18px 18px 16px 18px
 * - Top Row (Flex between, align center):
 *   - Left Meta: gap 8px.
 *     - Time Remaining: gap 4px, Clock/CalendarX icon 16px + text ("3 days left" or "overdue")
 *       - If overdue: #FF0000 Red
 *       - If normal: #5E6064 (VioraGrayText), 14px
 *     - List deadline badge (if applicable): capsule #F1F3F5, px-2 py-1, rounded-[12px], Link icon 12px + text 10px #5E6064
 *   - Right Meta: gap 4px. List icon 16px + Folder name, #5E6064, 14px
 * - Middle Task Title (mt-16px):
 *   - Color #000000, font size 32px (headlineMedium), font-weight 400/500, line-height 1.15, max 3 lines, ellipsis overflow
 * - Bottom Row (mt-16px, Flex between, align center):
 *   - Left Status Dropdown Pill:
 *     - Height 32px, rounded-full, padding 0 14px
 *     - To-Do: bg #FFD8D8 | text #8A0000
 *     - In Progress: bg #D6E3FF | text #001B3E
 *     - Done: bg #D4EFA5 | text #234B00
 *     - Gap 4px, status label 13px 500 + ChevronDown 16px
 *   - Right Assignees:
 *     - Assigned: size 32px, border 1.5px solid #FFFFFF, negative margin-left -10px, +N badge if > 3
 *     - Unassigned: border 1px solid #5E6064, rounded-[16px], px-2 py-1, gap 4px, User icon 16px + text "Unassigned" 12px #5E6064
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onCardClick,
  onStatusSelect,
}) => {
  const { updateTaskStatus, lists, setActiveDetailTaskId, cardTheme } = useViora();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const isDone = task.status === TaskStatus.DONE;
  const isOverdue = (task.daysLeft ?? 0) < 0 && !isDone;

  const projectList = lists.find((l) => l.id === task.listId);
  const folderName = projectList?.name || task.folder || task.client || 'Personal Space';

  const timeText = isOverdue
    ? 'overdue'
    : task.daysLeft === 0
    ? 'Due today'
    : task.daysLeft === 1
    ? '1 day left'
    : `${task.daysLeft ?? 3} days left`;

  const timeColor = isOverdue ? 'text-[#FF0000]' : 'text-[#5E6064]';

  const statusConfig = (() => {
    switch (task.status) {
      case TaskStatus.DONE:
        return {
          label: 'Done',
          bg: 'bg-[#D4EFA5]',
          text: 'text-[#234B00]',
        };
      case TaskStatus.IN_PROGRESS:
        return {
          label: 'In Progress',
          bg: 'bg-[#D6E3FF]',
          text: 'text-[#001B3E]',
        };
      case TaskStatus.TODO:
      default:
        return {
          label: 'To-Do',
          bg: 'bg-[#FFD8D8]',
          text: 'text-[#8A0000]',
        };
    }
  })();

  const handleCardClick = () => {
    if (onCardClick) onCardClick();
    else setActiveDetailTaskId(task.id);
  };

  const handleSelectStatus = (e: React.MouseEvent, newStatus: TaskStatus) => {
    e.stopPropagation();
    setShowStatusMenu(false);
    if (onStatusSelect) onStatusSelect(newStatus);
    else updateTaskStatus(task.id, newStatus);
  };

  const assignees = task.assigneePhotos?.filter((a) => a && a !== 'unassigned') || [];

  // Theme styling (defaults to stark white per Viora design tokens)
  const isGrayTheme = cardTheme === 'gray';
  const containerBg = isGrayTheme ? 'bg-[#1E1E22] text-white border border-[#303036]' : 'bg-[#FFFFFF] text-[#000000]';
  const titleColor = isGrayTheme ? (isDone ? 'text-zinc-500 line-through' : 'text-white') : (isDone ? 'text-zinc-400 line-through' : 'text-[#000000]');

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      className={`w-full ${containerBg} rounded-[28px] px-[18px] pt-[18px] pb-[16px] shadow-sm select-none cursor-pointer transition-all active:scale-[0.99] font-sans text-left`}
    >
      {/* Top Row (Flex between, align center) */}
      <div className="flex items-center justify-between text-[14px]">
        {/* Left Meta: Time Remaining + optional list deadline */}
        <div className="flex items-center gap-[8px]">
          <div className={`flex items-center gap-[4px] ${timeColor} text-[14px]`}>
            {isOverdue ? (
              <CalendarX className="w-[16px] h-[16px] text-[#FF0000] shrink-0" />
            ) : (
              <Clock className="w-[16px] h-[16px] text-[#5E6064] shrink-0" />
            )}
            <span className="leading-tight">{timeText}</span>
          </div>

          {task.deadlineSource && task.deadlineSource !== 'USER' && (
            <div className="bg-[#F1F3F5] text-[#5E6064] text-[10px] font-[500] px-[8px] py-[4px] rounded-[12px] flex items-center gap-[4px]">
              <LinkIcon className="w-[12px] h-[12px]" />
              <span>{task.deadlineSource === 'TEAM' ? 'Team' : 'List'}</span>
            </div>
          )}
        </div>

        {/* Right Meta: Folder name */}
        <div className="flex items-center gap-[4px] text-[#5E6064] text-[14px] truncate max-w-[160px]">
          <ListIcon className="w-[16px] h-[16px] shrink-0" />
          <span className="truncate">{folderName}</span>
        </div>
      </div>

      {/* Middle Task Title (margin-top 16px) */}
      <div className="mt-[16px]">
        <h3
          className={`text-[32px] font-[450] ${titleColor} leading-[1.15] line-clamp-3 overflow-hidden text-ellipsis`}
        >
          {task.title || 'Untitled Task'}
        </h3>
      </div>

      {/* Bottom Row (Flex between, align center, margin-top 16px) */}
      <div className="mt-[16px] flex items-center justify-between">
        {/* Left Status Dropdown Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusMenu((prev) => !prev);
            }}
            className={`h-[32px] px-[14px] rounded-[9999px] ${statusConfig.bg} ${statusConfig.text} text-[13px] font-[500] flex items-center gap-[4px] transition-all active:scale-95`}
          >
            <span>{statusConfig.label}</span>
            <ChevronDown className="w-[16px] h-[16px]" />
          </button>

          {showStatusMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 bottom-full mb-1 z-50 bg-white text-black rounded-[20px] p-1.5 shadow-2xl min-w-[150px] border border-black/10 animate-in fade-in zoom-in-95"
            >
              {[
                { status: TaskStatus.TODO, label: 'To-Do', bg: 'bg-[#FFD8D8]', text: 'text-[#8A0000]' },
                { status: TaskStatus.IN_PROGRESS, label: 'In Progress', bg: 'bg-[#D6E3FF]', text: 'text-[#001B3E]' },
                { status: TaskStatus.DONE, label: 'Done', bg: 'bg-[#D4EFA5]', text: 'text-[#234B00]' },
              ].map((item) => (
                <button
                  key={item.status}
                  type="button"
                  onClick={(e) => handleSelectStatus(e, item.status)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors my-0.5 ${
                    task.status === item.status ? `${item.bg} ${item.text}` : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {task.status === item.status && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Assignees */}
        {assignees.length > 0 ? (
          <div className="flex items-center -space-x-[10px]">
            {assignees.slice(0, 3).map((photo, idx) => (
              <div
                key={idx}
                className="w-[32px] h-[32px] rounded-full border-[1.5px] border-[#FFFFFF] overflow-hidden flex items-center justify-center shrink-0"
              >
                <UserAvatar userId={photo} size={32} />
              </div>
            ))}
            {assignees.length > 3 && (
              <div className="w-[32px] h-[32px] rounded-full bg-[#F1F3F5] border-[1.5px] border-[#FFFFFF] flex items-center justify-center text-[11px] font-[700] text-[#5E6064] shrink-0">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div className="border border-[#5E6064] rounded-[16px] px-[8px] py-[4px] flex items-center gap-[4px] text-[#5E6064]">
            <UserIcon className="w-[16px] h-[16px]" />
            <span className="text-[12px] font-normal leading-none">Unassigned</span>
          </div>
        )}
      </div>
    </div>
  );
};
