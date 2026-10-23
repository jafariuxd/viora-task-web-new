import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskCard } from '../components/TaskCard';
import { TaskStatus } from '../types';

/**
 * Matches SearchScreen.kt in jafariuxd/viora-task:
 * - Top Bar: Back button + Search input in bg-[#2A2A2A] rounded-[26px] h-[52px]
 * - Filters Bar: LazyRow of pills (h-[44px]) with "All", "To-Do", "In Progress", "Done"
 *   - Selected: bg-[#B4FF00] text-black
 *   - Unselected: bg-[#2A2A2A] text-white
 * - Results: px-[2px] space-y-[4px] with white TaskCards
 */
export const SearchScreen: React.FC = () => {
  const {
    tasks,
    setActiveDetailTaskId,
    updateTaskStatus,
    goBack,
  } = useViora();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filters = ['All', 'To-Do', 'In Progress', 'Done'];

  const filteredTasks = useMemo(() => {
    if (searchQuery.trim().length < 3) {
      return [];
    }

    const q = searchQuery.toLowerCase();
    return tasks.filter((task) => {
      if (task.isArchived) return false;

      const matchesSearch =
        task.title.toLowerCase().includes(q) ||
        (task.folder && task.folder.toLowerCase().includes(q)) ||
        (task.client && task.client.toLowerCase().includes(q)) ||
        task.tags.some((t) => t.toLowerCase().includes(q));

      const matchesFilter = (() => {
        switch (selectedFilter) {
          case 'To-Do':
            return task.status === TaskStatus.TODO;
          case 'In Progress':
            return task.status === TaskStatus.IN_PROGRESS;
          case 'Done':
            return task.status === TaskStatus.DONE;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen bg-[#000000] text-white pb-28 pt-2 font-['SF_Pro_Display',-apple-system,sans-serif]">
      {/* 1. Search Bar Header */}
      <div className="flex items-center gap-2.5 px-3 py-2">
        <button
          onClick={goBack}
          className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all shrink-0"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* 52dp Pill Container */}
        <div className="flex-1 h-[52px] rounded-[26px] bg-[#2A2A2A] px-4 flex items-center gap-2.5">
          <SearchIcon className="w-5 h-5 text-[#AAAAAA] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-[18px] placeholder-[#AAAAAA] focus:outline-none caret-[#B4FF00]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-7 h-7 flex items-center justify-center text-[#AAAAAA] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`h-[44px] px-5 rounded-full text-[15px] font-medium transition-all shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-[#B4FF00] text-black font-semibold'
                  : 'bg-[#2A2A2A] text-white hover:bg-[#333333]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* 3. Results Feed */}
      <div className="px-[2px] space-y-[4px] pt-2">
        {searchQuery.trim().length < 3 ? (
          <div className="text-center py-16 text-[#AAAAAA]">
            <p className="text-[16px]">Type at least 3 characters to search</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-[#AAAAAA]">
            <p className="text-[17px] font-medium text-white">No tasks found</p>
            <p className="text-[14px] mt-1 text-[#8E8E93]">Try a different search or filter</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onCardClick={() => setActiveDetailTaskId(task.id)}
              onStatusSelect={(newStatus) => updateTaskStatus(task.id, newStatus)}
            />
          ))
        )}
      </div>
    </div>
  );
};
