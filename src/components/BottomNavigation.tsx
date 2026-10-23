import React, { useState } from 'react';
import { Home, Plus, Users } from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { useM3WindowSize } from '../utils/useM3WindowSize';
import { SelectListSheet } from './SelectListSheet';

/**
 * Mobile Bottom Navigation Bar (< 768px / Compact Window)
 * Strictly matches VioraBottomNavigation in Kotlin repository jafariuxd/viora-task:
 * - 3 Destinations: Home, New Task, Teams
 * - Active pill: 64dp x 34dp rounded-2xl (16dp), background #2A2B2D (VioraDarkPill), icon pure White
 * - Inactive: transparent background, 50% opacity White icon
 * - Text: 12sp (text-[12px]), medium (510 weight), 50% white when unselected, pure white when selected
 * - Solid Black background with subtle top divider
 */
export const BottomNavigation: React.FC = () => {
  const {
    currentRoute,
    navigate,
    setActiveTodoistView,
    setShowQuickAdd,
    setSelectedProjectId,
    setActiveListId,
    setShowQuickTaskModal,
  } = useViora();

  const { isCompact } = useM3WindowSize();
  const [showSelectListSheet, setShowSelectListSheet] = useState(false);

  // Bottom Navigation is displayed exclusively on mobile (< 768px)
  if (!isCompact) return null;

  const handleSelectList = (listId: string) => {
    setShowSelectListSheet(false);
    if (listId === 'default' || !listId) {
      setShowQuickAdd(true);
    } else {
      setSelectedProjectId(listId);
      setActiveListId(listId);
      setShowQuickAdd(true);
    }
  };

  return (
    <>
      <nav
        aria-label="Viora Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-white/[0.08] px-4 pt-1.5 pb-safe-bottom flex justify-around items-center select-none"
      >
        {/* 1. Home Item */}
        <button
          type="button"
          onClick={() => {
            setActiveTodoistView('all');
            navigate('home');
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95"
        >
          <div
            className={`w-[64px] h-[34px] rounded-[16px] flex items-center justify-center transition-colors ${
              currentRoute === 'home' ? 'bg-[#2A2B2D]' : 'bg-transparent'
            }`}
          >
            <Home
              className={`w-[22px] h-[22px] transition-colors ${
                currentRoute === 'home' ? 'text-white' : 'text-white/50'
              }`}
            />
          </div>
          <span
            className={`text-[12px] leading-[16px] tracking-[0.5px] font-[510] mt-1 transition-colors ${
              currentRoute === 'home' ? 'text-white' : 'text-white/50'
            }`}
          >
            Home
          </span>
        </button>

        {/* 2. New Task Item */}
        <button
          type="button"
          onClick={() => setShowSelectListSheet(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95"
        >
          <div className="w-[64px] h-[34px] rounded-[16px] flex items-center justify-center bg-transparent">
            <Plus className="w-[22px] h-[22px] text-white/50 transition-colors hover:text-white" />
          </div>
          <span className="text-[12px] leading-[16px] tracking-[0.5px] font-[510] mt-1 text-white/50">
            New Task
          </span>
        </button>

        {/* 3. Teams Item */}
        <button
          type="button"
          onClick={() => navigate('teams')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95"
        >
          <div
            className={`w-[64px] h-[34px] rounded-[16px] flex items-center justify-center transition-colors ${
              currentRoute === 'teams' ? 'bg-[#2A2B2D]' : 'bg-transparent'
            }`}
          >
            <Users
              className={`w-[22px] h-[22px] transition-colors ${
                currentRoute === 'teams' ? 'text-white' : 'text-white/50'
              }`}
            />
          </div>
          <span
            className={`text-[12px] leading-[16px] tracking-[0.5px] font-[510] mt-1 transition-colors ${
              currentRoute === 'teams' ? 'text-white' : 'text-white/50'
            }`}
          >
            Teams
          </span>
        </button>
      </nav>

      {/* Select List Bottom Sheet (as in SelectListForNewTaskBottomSheet.kt) */}
      <SelectListSheet
        isOpen={showSelectListSheet}
        onClose={() => setShowSelectListSheet(false)}
        onSelectQuickTask={() => setShowQuickTaskModal(true)}
        onSelectList={handleSelectList}
      />
    </>
  );
};
