import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  Archive,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';

export function CompletedTasksScreen() {
  const {
    completedTasks,
    updateTaskStatus,
    setActiveDetailTaskId,
    archiveTask,
    goBack,
    showMessage,
  } = useViora();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  // Extract unique folders from completed tasks
  const folders = useMemo(() => {
    const set = new Set<string>();
    completedTasks.forEach((t) => {
      const folder = t.folder || t.client;
      if (folder) set.add(folder);
    });
    return Array.from(set);
  }, [completedTasks]);

  // Filter tasks based on search & folder
  const filteredTasks = useMemo(() => {
    return completedTasks.filter((task) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const folder = task.folder || task.client || 'Personal';
      const matchesFolder = selectedFolder === 'all' || folder === selectedFolder;

      return matchesSearch && matchesFolder;
    });
  }, [completedTasks, searchQuery, selectedFolder]);

  const handleArchiveAll = () => {
    if (completedTasks.length === 0) return;
    completedTasks.forEach((t) => archiveTask(t.id));
    showMessage(`Moved ${completedTasks.length} completed tasks to Archives`);
  };

  return (
    <div className="min-h-screen bg-viora-bg text-white pb-28 md:pb-16 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between py-2 mb-6"
      >
        <button
          onClick={goBack}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#18181A] hover:bg-[#222224] text-white/80 hover:text-white transition-all border border-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Back</span>
        </button>

        {completedTasks.length > 0 && (
          <button
            onClick={handleArchiveAll}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181A] hover:bg-[#222224] text-xs font-semibold text-zinc-300 hover:text-white transition-all border border-white/5"
            title="Archive all completed tasks"
          >
            <Archive className="w-3.5 h-3.5 text-zinc-400" />
            <span>Archive All</span>
          </button>
        )}
      </motion.div>

      {/* Screen Title & Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-[28px] sm:text-[32px] font-bold tracking-tight">
              Completed Tasks
            </h1>
            <span className="px-3 py-1 rounded-full bg-viora-unplanned text-black font-extrabold text-[13px] shadow-sm">
              {completedTasks.length}
            </span>
          </div>
          <p className="text-zinc-400 text-[14px] font-medium mt-1">
            Review milestones and tasks you have finished
          </p>
        </div>
      </motion.div>

      {/* Search & Folder Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="space-y-3 mb-6"
      >
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search completed tasks by title, tag, or description..."
            className="w-full h-12 bg-[#18181A] border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-viora-neonLime transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Folder / Space chips */}
        {folders.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setSelectedFolder('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFolder === 'all'
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#18181A] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              All Folders ({completedTasks.length})
            </button>
            {folders.map((folder) => {
              const count = completedTasks.filter(
                (t) => (t.folder || t.client) === folder
              ).length;
              return (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedFolder === folder
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#18181A] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {folder} ({count})
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Task Feed */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckCheck}
          iconBadgeClass="bg-viora-unplanned/15 border-viora-unplanned/30 text-viora-unplanned"
          iconClass="w-7 h-7 text-viora-unplanned"
          title={
            searchQuery || selectedFolder !== 'all'
              ? 'No matching completed tasks'
              : 'No completed tasks yet'
          }
          description={
            searchQuery || selectedFolder !== 'all'
              ? 'Try changing your search query or folder filter to view finished milestones.'
              : 'When you mark tasks as Done on your home feed or board, they will be preserved here.'
          }
          primaryAction={{
            label:
              searchQuery || selectedFolder !== 'all'
                ? 'Clear Filters'
                : 'Return to Active Tasks',
            icon:
              searchQuery || selectedFolder !== 'all'
                ? RotateCcw
                : ArrowLeft,
            onClick: () => {
              if (searchQuery || selectedFolder !== 'all') {
                setSearchQuery('');
                setSelectedFolder('all');
              } else {
                goBack();
              }
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
                className="col-span-1"
              >
                <TaskCard
                  task={task}
                  onCardClick={() => setActiveDetailTaskId(task.id)}
                  onStatusSelect={(newStatus) => updateTaskStatus(task.id, newStatus)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
