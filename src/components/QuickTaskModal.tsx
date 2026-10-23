import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Zap } from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskStatus, DeadlineSource } from '../types';

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Quick Task Flow (Bottom Sheet / Quick Modal)
 * Specifications:
 * - Input: Only task title (multi-line textarea with auto-grow, preserving line breaks)
 * - List Assignment: Automatically assigns to user's default personal list (isPersonal: true or "My Tasks")
 * - Due Date: Automatically computes deadline based on user's account default (user.defaultDeadlineDays)
 * - Tag: Automatically adds tag "Quick Task"
 * - Initial Status: "todo"
 * - Behavior: Optimistically inserts into feed immediately. Updates Home screen "Review Quick Tasks" badge.
 */
export const QuickTaskModal: React.FC<QuickTaskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addTask, userProfile, lists } = useViora();
  const [taskTitle, setTaskTitle] = useState('');
  const [recentAddedTasks, setRecentAddedTasks] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea handler
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskTitle(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 260)}px`;
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }, 80);
    } else {
      setTaskTitle('');
      setRecentAddedTasks([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. List Assignment: default personal list (isPersonal: true or My Tasks)
  const defaultList =
    lists.find((l) => l.isPersonal) ||
    lists.find((l) => l.name === 'My Tasks' || l.name === 'Personal') ||
    lists[0];

  // 2. Due Date: Automatically computes deadline based on user's account default
  const defaultDeadlineDays = userProfile?.stats?.defaultDeadlineDays || 3;

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskTitle.trim()) return;

    const trimmedTitle = taskTitle.trim();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + defaultDeadlineDays);

    addTask({
      title: trimmedTitle, // Preserves line breaks when multi-line
      client: 'Personal Space',
      folder: defaultList?.name || 'My Tasks',
      listId: defaultList?.id || '',
      tags: ['Quick Task'], // Automatically adds "Quick Task" tag
      status: TaskStatus.TODO, // Initial status "todo"
      daysLeft: defaultDeadlineDays,
      deadlineSource: DeadlineSource.USER, // Inherited from user default
      assigneePhotos: [userProfile?.username || 'mehran'],
      isUnplanned: false,
      description: '',
      dueDateText: `Due in ${defaultDeadlineDays} days`,
      selectedDeadlineMillis: targetDate.getTime(),
      computedDeadlineMillis: targetDate.getTime(),
      subtasks: [],
    });

    // Add to batch entry list for rapid entry feedback
    setRecentAddedTasks((prev) => [trimmedTitle.split('\n')[0], ...prev]);
    setTaskTitle('');

    // Reset textarea auto-grow height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 font-['SF_Pro_Display',-apple-system,sans-serif]"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white text-black rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl flex flex-col min-h-[360px] max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-[#B4FF00] stroke-black text-black" />
              <span className="text-[14px] font-medium text-black/50">Quick Task Flow</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Large Multi-line Auto-grow Textarea ("What's in your mind?") */}
          <div className="flex-1 py-3 my-2 flex flex-col overflow-y-auto custom-scrollbar">
            <textarea
              ref={textareaRef}
              rows={2}
              value={taskTitle}
              onChange={handleTextChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
              placeholder="What's in your mind?"
              className="w-full bg-transparent text-[24px] sm:text-[28px] font-normal text-black placeholder:text-black/35 focus:outline-none resize-none leading-tight whitespace-pre-wrap"
              style={{ overflow: 'hidden' }}
            />
            <span className="text-[12px] text-black/40 mt-1 block">
              Shift + Enter for new line • Enter to submit
            </span>
          </div>

          {/* Action Button: Neon Lime full-width */}
          <button
            type="button"
            onClick={() => handleAddTask()}
            disabled={!taskTitle.trim()}
            className="w-full h-[56px] rounded-2xl bg-[#B4FF00] hover:brightness-105 active:scale-[0.98] text-black font-bold text-[17px] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <span>Add Quick Task</span>
          </button>

          {/* Live Continuous Entry Checklist (Batch Created Items) */}
          {recentAddedTasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-black/10 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
              <span className="text-[11px] uppercase tracking-wider font-bold text-black/40 block">
                Recently Added ({recentAddedTasks.length})
              </span>
              {recentAddedTasks.map((title, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-black/80 font-medium py-1">
                  <div className="w-4 h-4 rounded-full bg-[#B4FF00] text-black flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="truncate">{title}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
