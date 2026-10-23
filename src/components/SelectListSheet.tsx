import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  ChevronRight,
  Pin,
  Folder,
  X,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';

interface SelectListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuickTask: () => void;
  onSelectList: (listId: string) => void;
}

export const SelectListSheet: React.FC<SelectListSheetProps> = ({
  isOpen,
  onClose,
  onSelectQuickTask,
  onSelectList,
}) => {
  const { teams, lists } = useViora();

  if (!isOpen) return null;

  // Personal/Default List (My Tasks)
  const personalLists = lists.filter((l) => l.isPersonal || !l.teamId);
  
  // Group lists by team
  const teamsWithLists = teams.filter((t) => !t.isArchived).map((team) => ({
    team,
    teamLists: lists.filter((l) => l.teamId === team.id && !l.isArchived),
  }));

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md font-['SF_Pro_Display',-apple-system,sans-serif]"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#1C1C1E] border-t border-white/10 rounded-t-[28px] p-5 pb-8 shadow-2xl text-white max-h-[85vh] flex flex-col min-h-0"
        >
          {/* Top Handle Bar */}
          <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4 shrink-0 cursor-pointer" onClick={onClose} />

          {/* Sheet Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 shrink-0">
            <h3 className="text-[17px] font-bold text-white tracking-tight">Select Destination</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List options container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            {/* ITEM #1: Quick Task (At the very top) */}
            <div className="bg-[#242428] rounded-2xl overflow-hidden border border-white/5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectQuickTask();
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-viora-neonLime/15 text-viora-neonLime flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5 fill-viora-neonLime stroke-viora-neonLime" />
                  </div>
                  <span className="text-[19px] font-medium text-white tracking-tight">
                    Quick Task
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Personal Space & My Tasks */}
            <div className="bg-[#242428] rounded-2xl p-2 border border-white/5 space-y-1">
              <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-zinc-500">
                Personal Space
              </div>

              {personalLists.length > 0 ? (
                personalLists.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectList(list.id);
                    }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-viora-neonLime/10 text-viora-neonLime flex items-center justify-center shrink-0">
                        <Pin className="w-4 h-4 fill-viora-neonLime stroke-viora-neonLime" />
                      </div>
                      <span className="text-[19px] font-medium text-white tracking-tight">
                        {list.name}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectList('default');
                  }}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-viora-neonLime/10 text-viora-neonLime flex items-center justify-center shrink-0">
                      <Pin className="w-4 h-4 fill-viora-neonLime stroke-viora-neonLime" />
                    </div>
                    <span className="text-[19px] font-medium text-white tracking-tight">
                      My Tasks
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                </button>
              )}
            </div>

            {/* Team Workspaces */}
            {teamsWithLists.map(({ team, teamLists }) => (
              <div key={team.id} className="bg-[#242428] rounded-2xl p-2 border border-white/5 space-y-1">
                <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-zinc-400 flex items-center justify-between">
                  <span>{team.name}</span>
                  <span className="text-zinc-600 text-[10px]">{teamLists.length} lists</span>
                </div>

                {teamLists.length > 0 ? (
                  teamLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectList(list.id);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="w-4 h-4 text-zinc-400 group-hover:text-viora-neonLime shrink-0 transition-colors" />
                        <span className="text-[17px] font-medium text-zinc-200 group-hover:text-white tracking-tight">
                          {list.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-zinc-500 italic">No project lists created</div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
