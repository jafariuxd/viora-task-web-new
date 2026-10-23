import React, { useState } from 'react';
import {
  X,
  MoreVertical,
  Camera,
  Edit2,
  Settings,
  QrCode,
  LogOut,
  Bell,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { UserAvatar } from '../components/UserAvatar';
import { TaskStatus } from '../types';

interface ActivityCardProps {
  title: string;
  count: number | string;
  unit: string;
  pillColor: string;
}

/**
 * Matches ActivityCard composable in UserProfileScreen.kt:
 * - height: 101.dp
 * - shape: RoundedCornerShape(24.dp)
 * - background: Color.White
 * - padding: start 18.dp, end 18.dp, top 12.dp, bottom 14.dp
 * - pill: height 23.dp, rounded-full, title in 12sp black
 * - bottom: count in 40sp black + unit in 14sp gray
 */
const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  count,
  unit,
  pillColor,
}) => {
  return (
    <div className="flex-1 h-[101px] bg-white rounded-[24px] px-[18px] pt-[12px] pb-[14px] flex flex-col justify-between shadow-sm select-none">
      {/* Title pill badge */}
      <div className="self-start">
        <span
          className="inline-flex items-center h-[23px] px-2 rounded-full text-[12px] font-normal text-black"
          style={{ backgroundColor: pillColor }}
        >
          {title}
        </span>
      </div>

      {/* Count + Unit */}
      <div className="flex items-baseline gap-1.5 leading-none">
        <span className="text-[38px] sm:text-[40px] font-normal text-black tracking-tight leading-none">
          {count}
        </span>
        <span className="text-[14px] text-zinc-500 font-normal">
          {unit}
        </span>
      </div>
    </div>
  );
};

export const UserProfileScreen: React.FC = () => {
  const {
    userProfile,
    tasks,
    teams,
    goBack,
    navigate,
    logout,
    setShowVioraPass,
  } = useViora();

  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const assignedTasksCount = tasks.filter((t) => !t.isArchived).length;
  const completedTasksCount = tasks.filter(
    (t) => t.status === TaskStatus.DONE && !t.isArchived
  ).length;
  const overdueTasksCount = tasks.filter(
    (t) => (t.daysLeft ?? 0) < 0 && t.status !== TaskStatus.DONE && !t.isArchived
  ).length;
  const activeTeamsCount = teams.filter((t) => !t.isArchived).length;

  const defaultDeadlineDays = userProfile.stats?.defaultDeadlineDays ?? 5;

  return (
    <div className="min-h-screen bg-[#000000] text-white pb-28 pt-2 px-3 sm:px-6 max-w-xl mx-auto font-['SF_Pro_Display',-apple-system,sans-serif]">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between py-2 mb-2">
        <button
          onClick={goBack}
          className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
            title="More Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 z-50 bg-white text-black rounded-[24px] p-2 shadow-2xl min-w-[190px] border border-black/10 animate-in fade-in zoom-in-95"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowVioraPass(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-black hover:bg-zinc-100 transition-colors"
              >
                <QrCode className="w-5 h-5 text-zinc-500" />
                <span>Share Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate('settings');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-black hover:bg-zinc-100 transition-colors"
              >
                <Settings className="w-5 h-5 text-zinc-500" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate('notifications');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-black hover:bg-zinc-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-zinc-500" />
                <span>Notifications</span>
              </button>
              <div className="my-1 border-t border-zinc-200" />
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Avatar Profile Section */}
      <div className="flex flex-col items-center justify-center text-center mt-2 mb-6">
        <div className="relative mb-4">
          <div className="w-[125px] h-[125px] rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
            <UserAvatar
              userId={userProfile.username || 'user'}
              avatarUrl={userProfile.profileImageUri}
              size={125}
            />
          </div>

          {/* Camera Badge in VioraNeonLime (#B4FF00) */}
          <button
            onClick={() => navigate('edit_profile')}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#B4FF00] text-black flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Change photo"
          >
            <Camera className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Name (24sp) */}
        <h1 className="text-[24px] font-semibold text-white tracking-tight leading-tight">
          {userProfile.name || 'User'}
        </h1>

        {/* Username in Neon Lime (#B4FF00) */}
        <p className="text-[#B4FF00] text-[16px] font-normal mt-1">
          {userProfile.username ? `@${userProfile.username}` : '@user'}
        </p>

        {/* Edit profile button */}
        <button
          onClick={() => navigate('edit_profile')}
          className="mt-4 px-6 py-2.5 rounded-[24px] bg-white text-black text-[16px] font-medium hover:bg-zinc-100 active:scale-95 transition-all shadow-sm"
        >
          Edit profile
        </button>
      </div>

      {/* 3. Activities Section */}
      <div className="space-y-2 mt-6">
        <h3 className="text-white/60 text-[14px] px-6 font-normal">
          Activities
        </h3>

        {/* Row 1: Assigned Tasks & Tasks Completed */}
        <div className="flex gap-[5px] px-[2px]">
          <ActivityCard
            title="Assigned Tasks"
            count={assignedTasksCount}
            unit="Tasks"
            pillColor="#D3E3FC"
          />
          <ActivityCard
            title="Tasks Completed"
            count={completedTasksCount}
            unit="Tasks"
            pillColor="#CEF4AC"
          />
        </div>

        {/* Row 2: Overdue & Active Teams */}
        <div className="flex gap-[5px] px-[2px]">
          <ActivityCard
            title="Overdue"
            count={overdueTasksCount}
            unit="Tasks"
            pillColor="#FFD9D9"
          />
          <ActivityCard
            title="Active Teams"
            count={activeTeamsCount}
            unit="Teams"
            pillColor="#FDE293"
          />
        </div>

        {/* Row 3: Default Deadline Card */}
        <div className="px-[2px] pt-[1px]">
          <div className="w-full h-[72px] rounded-[24px] bg-white text-black px-4 flex items-center justify-between shadow-sm select-none">
            <div className="h-[23px] px-2.5 rounded-full bg-[#F1F3F4] text-black text-[12px] flex items-center justify-center font-normal">
              Default Deadline
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[36px] font-normal text-black leading-none">
                {defaultDeadlineDays}
              </span>
              <span className="text-[16px] text-zinc-500 font-normal mr-2">
                Days
              </span>
              <button
                onClick={() => navigate('edit_profile')}
                className="w-9 h-9 rounded-full bg-[#F1F3F4] flex items-center justify-center text-zinc-500 hover:text-black hover:bg-[#E5E7EB] active:scale-95 transition-all"
                title="Edit Deadline"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1C1C1E] border border-white/10 rounded-[28px] p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Log Out</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to log out of Viora?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2.5 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
