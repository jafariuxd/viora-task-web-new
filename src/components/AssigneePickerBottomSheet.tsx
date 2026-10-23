import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Check } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { useViora } from '../context/VioraContext';

interface AssigneePickerBottomSheetProps {
  currentAssignees: string[];
  onDismiss: () => void;
  onSubmit: (assignees: string[]) => void;
}

export function AssigneePickerBottomSheet({
  currentAssignees,
  onDismiss,
  onSubmit,
}: AssigneePickerBottomSheetProps) {
  const { users } = useViora();
  const [selected, setSelected] = useState<string[]>(currentAssignees);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleUser = (username: string) => {
    setSelected((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 font-['SF_Pro_Display',-apple-system,sans-serif]"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-[#1C1C1E] border-t md:border border-white/10 rounded-t-[36px] md:rounded-[36px] p-6 max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (Page 3 & 4) */}
        <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-5 shrink-0" />

        {/* Search users to assign (Page 3 & 4) */}
        <div className="relative mb-5 shrink-0">
          <Search className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users to assign"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-white text-[15px] placeholder-white/40 focus:outline-none focus:border-viora-neonLime transition-colors"
          />
        </div>

        {/* Users Grid: 3 columns with avatar & name (Page 3 & 4) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-y-6 gap-x-2 py-2 custom-scrollbar">
          {filteredUsers.map((user) => {
            const isSelected = selected.includes(user.username);
            return (
              <div
                key={user.id}
                onClick={() => toggleUser(user.username)}
                className="flex flex-col items-center gap-2 cursor-pointer select-none group"
              >
                <div className="relative">
                  <div
                    className={`w-[68px] h-[68px] rounded-full p-[2px] transition-all ${
                      isSelected
                        ? 'ring-2 ring-viora-neonLime scale-105 shadow-[0_0_12px_rgba(180,255,0,0.3)]'
                        : 'hover:scale-105'
                    }`}
                  >
                    <UserAvatar userId={user.username} avatarUrl={user.avatarUrl} size={64} className="rounded-full overflow-hidden" />
                  </div>

                  {/* Green check badge on selected users (Page 3) */}
                  {isSelected && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-viora-neonLime border-2 border-[#1C1C1E] flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 text-black stroke-[3.5]" />
                    </div>
                  )}
                </div>

                <span
                  className={`text-[14px] font-medium text-center truncate max-w-[90px] transition-colors ${
                    isSelected ? 'text-viora-neonLime font-bold' : 'text-white'
                  }`}
                >
                  {user.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Share / Assign Button (Page 3 & 4) */}
        <div className="mt-5 pt-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => {
              onSubmit(selected);
              onDismiss();
            }}
            className="w-full h-14 rounded-full bg-viora-neonLime text-black font-extrabold text-[16px] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center shadow-lg"
          >
            Share
          </button>
        </div>
      </motion.div>
    </div>
  );
}
