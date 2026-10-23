import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  List as ListIcon,
  ChevronRight,
  Maximize2,
  Pin,
  X,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskStatus } from '../types';

/**
 * Matches TeamsScreen.kt from jafariuxd/viora-task:
 * - Pure Black background (#000000)
 * - Top bar: "Teams" header with (+) Add Team button
 * - Each team has:
 *   - Header Row: Team Name (22sp, bold, white), (+) Add list button, and Open In Full button (#8E8E93)
 *   - Gray Card: bg-[#1C1C1E] rounded-[24px]
 *   - Child lists: List icon (#8E8E93), List Name (19sp, medium), Pin if My Tasks, task count, chevron right
 *   - Empty state in card: "+ Add list" in VioraNeonLime (#B4FF00)
 */
export const TeamsScreen: React.FC = () => {
  const {
    teams,
    lists,
    activeTasks,
    addTeam,
    addList,
    setActiveListId,
    setActiveTeamId,
    navigate,
  } = useViora();

  // Modals state
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState<string>('');
  const [newListName, setNewListName] = useState('');

  const activeTeams = useMemo(() => {
    return teams.filter((t) => !t.isArchived);
  }, [teams]);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    addTeam(newTeamName.trim(), 7);
    setNewTeamName('');
    setShowCreateTeamModal(false);
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !targetTeamId) return;
    addList(newListName.trim(), targetTeamId, 3);
    setNewListName('');
    setShowCreateListModal(false);
  };

  const openList = (listId: string) => {
    setActiveListId(listId);
    navigate('list_detail');
  };

  const openTeam = (teamId: string) => {
    setActiveTeamId(teamId);
    navigate('team_detail');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white pb-28 pt-3 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto font-['SF_Pro_Display',-apple-system,sans-serif]">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between py-2 mb-4">
        <h1 className="text-[26px] sm:text-[32px] font-bold text-white tracking-tight">
          Teams
        </h1>

        <button
          onClick={() => setShowCreateTeamModal(true)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#B4FF00] hover:bg-white/10 active:scale-95 transition-all"
          title="Add Team"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 2. Teams List */}
      <div className="space-y-6">
        {activeTeams.map((team) => {
          const childLists = lists.filter((l) => l.teamId === team.id && !l.isArchived);

          return (
            <div key={team.id} className="space-y-2">
              {/* Team Name Header Row */}
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => openTeam(team.id)}
                  className="text-left text-[22px] font-bold text-white tracking-[-0.3px] hover:text-[#B4FF00] transition-colors flex items-center gap-2"
                >
                  <span>{team.name}</span>
                </button>

                <div className="flex items-center gap-1">
                  {/* Add List (+) Button */}
                  <button
                    onClick={() => {
                      setTargetTeamId(team.id);
                      setShowCreateListModal(true);
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 active:scale-95 transition-all"
                    title={`Add list to ${team.name}`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  {/* Open In Full Button */}
                  <button
                    onClick={() => openTeam(team.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                    title={`Open ${team.name}`}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Gray Card containing child lists (Matching Surface in TeamsScreen.kt) */}
              <div className="w-full bg-[#1C1C1E] rounded-[24px] overflow-hidden py-1">
                {childLists.length === 0 ? (
                  /* Empty state: clickable row with "+" and "Add list" in neon lime */
                  <button
                    onClick={() => {
                      setTargetTeamId(team.id);
                      setShowCreateListModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-6 py-5 text-[#B4FF00] hover:bg-white/[0.04] transition-colors"
                  >
                    <Plus className="w-5 h-5 stroke-[2.2]" />
                    <span className="text-[17px] font-medium">Add list</span>
                  </button>
                ) : (
                  childLists.map((list, idx) => {
                    const isMyTasks =
                      list.name.toLowerCase() === 'my tasks' || list.isPersonal;
                    const activeCount = activeTasks.filter(
                      (t) =>
                        (t.listId === list.id || t.folder === list.name) &&
                        t.status !== TaskStatus.DONE &&
                        !t.isArchived
                    ).length;

                    return (
                      <div key={list.id}>
                        {idx > 0 && (
                          <div className="mx-6 border-b border-white/[0.05]" />
                        )}
                        <div
                          onClick={() => openList(list.id)}
                          className="flex items-center justify-between px-6 py-4.5 hover:bg-white/[0.04] transition-colors cursor-pointer select-none"
                        >
                          {/* List icon + Title */}
                          <div className="flex items-center gap-3 min-w-0">
                            <ListIcon className="w-5 h-5 text-[#8E8E93] shrink-0" />
                            <span className="text-white text-[19px] font-medium truncate">
                              {list.name}
                            </span>
                            {isMyTasks && (
                              <Pin className="w-4 h-4 text-[#B4FF00] shrink-0 fill-current" />
                            )}
                          </div>

                          {/* Task count + Chevron */}
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
          );
        })}
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-[28px] p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">New Team</h3>
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Team Name
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder="e.g. Design Systems"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full bg-[#2A2A2D] border border-white/10 rounded-2xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#B4FF00]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeamModal(false)}
                    className="px-5 py-2.5 rounded-full text-zinc-400 hover:text-white text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#B4FF00] text-black text-sm font-bold active:scale-95 transition-all"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create List Modal */}
      <AnimatePresence>
        {showCreateListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-[28px] p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Add New List</h3>
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
                    placeholder="e.g. Sprint Tasks"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
