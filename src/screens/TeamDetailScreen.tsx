import React, { useState } from 'react';
import {
  ChevronDown,
  Pin,
  Plus,
  MoreVertical,
  List as ListIcon,
  ChevronRight,
  Trash2,
  X,
  Share2,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskCard } from '../components/TaskCard';
import { TaskStatus } from '../types';

/**
 * Matches TeamDetailScreen.kt from jafariuxd/viora-task:
 * - Top bar: ChevronDown, PushPin + "Pull down to close", Add List (+) button
 * - Large title: 40sp (text-[36px] sm:text-[40px])
 * - Options dropdown (Invite link, Team members, Add members, Delete team)
 * - Lists section in bg-[#1C1C1E] rounded-[24px] card
 * - Tasks feed in px-[2px] space-y-[4px] with white TaskCards
 */
export const TeamDetailScreen: React.FC = () => {
  const {
    activeTeamId,
    teams,
    lists,
    tasks,
    addList,
    deleteTeam,
    setActiveDetailTaskId,
    setActiveListId,
    updateTaskStatus,
    goBack,
    setShowVioraPass,
  } = useViora();

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const team = teams.find((t) => t.id === activeTeamId) || teams[0];
  if (!team) return null;

  const teamLists = lists.filter((l) => l.teamId === team.id && !l.isArchived);
  const teamTasks = tasks.filter(
    (t) => (t.teamId === team.id || t.client === team.name) && !t.isArchived
  );

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    addList(newListName.trim(), team.id, team.defaultDeadlineDays || 7);
    setNewListName('');
    setShowCreateListModal(false);
  };

  const handleDeleteTeam = () => {
    deleteTeam(team.id);
    goBack();
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white pb-28 pt-2 px-3 sm:px-6 max-w-3xl mx-auto font-['SF_Pro_Display',-apple-system,sans-serif]">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between py-2 mb-4">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
          title="Back"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-zinc-500 text-[12px]">
          <Pin className="w-3.5 h-3.5 fill-current" />
          <span>Pull down to close</span>
        </div>

        <button
          onClick={() => setShowCreateListModal(true)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#B4FF00] hover:bg-white/10 active:scale-95 transition-all"
          title="Add List"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Title & Options */}
      <div className="flex items-center justify-between px-2 mb-6">
        <h1 className="text-[36px] sm:text-[40px] font-medium text-white tracking-[-1px] leading-tight">
          {team.name}
        </h1>

        <div className="relative">
          <button
            onClick={() => setShowOptionsMenu((prev) => !prev)}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
            title="Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showOptionsMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 z-50 bg-white text-black rounded-[24px] p-2 shadow-2xl min-w-[190px] border border-black/10 animate-in fade-in zoom-in-95"
            >
              <button
                onClick={() => {
                  setShowOptionsMenu(false);
                  setShowVioraPass(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-black hover:bg-zinc-100 transition-colors"
              >
                <Share2 className="w-5 h-5 text-zinc-500" />
                <span>Invite link</span>
              </button>
              <button
                onClick={() => {
                  setShowOptionsMenu(false);
                  setShowCreateListModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-black hover:bg-zinc-100 transition-colors"
              >
                <Plus className="w-5 h-5 text-zinc-500" />
                <span>Add list</span>
              </button>
              <div className="my-1 border-t border-zinc-200" />
              <button
                onClick={() => {
                  setShowOptionsMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete team</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Team Lists Section */}
      <div className="space-y-2 mb-8">
        <h3 className="text-white/60 text-[14px] px-2 font-normal">Lists</h3>
        <div className="w-full bg-[#1C1C1E] rounded-[24px] overflow-hidden py-1">
          {teamLists.length === 0 ? (
            <button
              onClick={() => setShowCreateListModal(true)}
              className="w-full flex items-center gap-2.5 px-6 py-5 text-[#B4FF00] hover:bg-white/[0.04] transition-colors"
            >
              <Plus className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[17px] font-medium">Add list</span>
            </button>
          ) : (
            teamLists.map((list, idx) => {
              const activeCount = teamTasks.filter(
                (t) =>
                  (t.listId === list.id || t.folder === list.name) &&
                  t.status !== TaskStatus.DONE
              ).length;

              return (
                <div key={list.id}>
                  {idx > 0 && <div className="mx-6 border-b border-white/[0.05]" />}
                  <div
                    onClick={() => {
                      setActiveListId(list.id);
                      // navigation to list_detail
                    }}
                    className="flex items-center justify-between px-6 py-4.5 hover:bg-white/[0.04] transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ListIcon className="w-5 h-5 text-[#8E8E93] shrink-0" />
                      <span className="text-white text-[19px] font-medium truncate">
                        {list.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeCount > 0 && (
                        <span className="text-[#AAAAAA] text-[14px] font-medium">
                          {activeCount}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[#666666]" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Team Tasks Feed */}
      <div className="space-y-2">
        <h3 className="text-white/60 text-[14px] px-2 font-normal">Tasks</h3>
        <div className="px-[2px] space-y-[4px]">
          {teamTasks.length === 0 ? (
            <div className="w-full bg-[#1C1C1E] rounded-[24px] p-6 text-center text-zinc-400">
              <p className="text-white text-base font-semibold">No tasks in this team</p>
              <p className="text-xs mt-1">Tap + to add a task or list</p>
            </div>
          ) : (
            teamTasks.map((task) => (
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

      {/* Add List Modal */}
      {showCreateListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-[28px] p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add List to {team.name}</h3>
              <button
                onClick={() => setShowCreateListModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                  List Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Design Tasks"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full bg-[#2A2A2D] border border-white/10 rounded-2xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#B4FF00]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateListModal(false)}
                  className="px-5 py-2.5 rounded-full text-zinc-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#B4FF00] text-black text-sm font-bold active:scale-95 transition-all"
                >
                  Add List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Team Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1C1C1E] border border-white/10 rounded-[28px] p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Delete Team</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to delete {team.name}? This will remove all its lists.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
