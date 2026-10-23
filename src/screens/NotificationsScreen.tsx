import { useState } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Clock,
  AlertCircle,
  Bell,
  Trash2,
  UserCheck,
  UserPlus,
  Check,
  X,
  Users,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { UserAvatar } from '../components/UserAvatar';
import { EmptyState } from '../components/EmptyState';
import { NotificationType } from '../types';

export function NotificationsScreen() {
  const {
    notifications,
    clearAllNotifications,
    goBack,
    teamInvites,
    acceptTeamInvite,
    declineTeamInvite,
  } = useViora();

  const [activeTab, setActiveTab] = useState<'all' | 'invites'>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingInvites = teamInvites.filter((inv) => inv.status === 'pending' || !inv.status);

  const todayList = notifications.filter((n) => n.timeGroup === 'Today');
  const earlierList = notifications.filter((n) => n.timeGroup !== 'Today');

  const handleClearAll = () => {
    clearAllNotifications();
    setShowMenu(false);
  };

  const handleAccept = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      await acceptTeamInvite(inviteId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      await declineTeamInvite(inviteId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-28 md:pb-12 pt-3 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto font-['SF_Pro_Display',-apple-system,sans-serif]">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between py-2 mb-3">
        <button
          type="button"
          onClick={goBack}
          className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="h-11 px-4 rounded-full bg-[#B4FF00] text-black text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Mark all read</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-95"
              aria-label="Menu"
            >
              <MoreVertical className="w-5 h-5 stroke-[2.2]" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 z-50 bg-[#1C1C1E] border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[170px] animate-in fade-in zoom-in-95"
              >
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. TITLE */}
      <div className="mb-4">
        <h1 className="text-white text-[38px] font-extrabold tracking-tight">
          Notifications
        </h1>
      </div>

      {/* 3. TAB CONTROLS (ALL vs TEAM INVITES) */}
      <div className="flex items-center bg-[#1C1C1E] p-1.5 rounded-2xl border border-white/10 mb-6 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'all'
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>All Updates</span>
          {notifications.length > 0 && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                activeTab === 'all' ? 'bg-black/10 text-black' : 'bg-white/10 text-zinc-300'
              }`}
            >
              {notifications.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invites')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${
            activeTab === 'invites'
              ? 'bg-[#B4FF00] text-black shadow-md shadow-[#B4FF00]/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Team Invites</span>
          {pendingInvites.length > 0 && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                activeTab === 'invites'
                  ? 'bg-black text-[#B4FF00]'
                  : 'bg-[#B4FF00] text-black animate-pulse'
              }`}
            >
              {pendingInvites.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {activeTab === 'invites' ? (
        /* TEAM INVITES TAB */
        <div>
          {pendingInvites.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              iconBadgeClass="bg-[#B4FF00]/10 border-[#B4FF00]/20 text-[#B4FF00]"
              title="No pending invites"
              description="You don't have any pending team invitations at the moment. When a team owner invites you, it will appear here."
              primaryAction={{
                label: 'View Workspace Teams',
                icon: Users,
                onClick: goBack,
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-zinc-400 text-xs font-bold tracking-wider uppercase">
                  Pending Invitations ({pendingInvites.length})
                </span>
                <span className="text-[11px] text-[#B4FF00] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Auto-join on accept
                </span>
              </div>

              {pendingInvites.map((invite) => {
                const isProcessing = processingId === invite.id;

                return (
                  <div
                    key={invite.id}
                    className="bg-[#1C1C1E] border border-white/10 rounded-[28px] p-5 text-white shadow-xl relative overflow-hidden transition-all hover:border-white/20"
                  >
                    {/* Top Neon Accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B4FF00] via-lime-400 to-[#B4FF00]" />

                    {/* Inviter Info Header */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          userId={invite.inviterUsername}
                          avatarUrl={invite.inviterAvatar}
                          size={40}
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{invite.inviterName}</span>
                            <span className="text-[10px] text-zinc-400 font-normal">
                              (@{invite.inviterUsername})
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            Invited you as{' '}
                            <span className="text-[#B4FF00] font-semibold">
                              {invite.role || 'Member'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {invite.membersCount && (
                        <div className="bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-zinc-300 flex items-center gap-1 shrink-0">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{invite.membersCount} members</span>
                        </div>
                      )}
                    </div>

                    {/* Team Workspace Box */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 mb-4">
                      <h3 className="text-base font-extrabold text-white tracking-tight">
                        {invite.teamName}
                      </h3>
                      {invite.teamDescription && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {invite.teamDescription}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAccept(invite.id)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#B4FF00] hover:bg-[#a0eb00] text-black font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#B4FF00]/15 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Accept & Join Team</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleDecline(invite.id)}
                        className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ALL NOTIFICATIONS TAB */
        <div>
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              iconBadgeClass="bg-white/5 border-white/10 text-white/50"
              title="No notifications"
              description="You're all caught up! When there are task updates, reminders, or team mentions, they will show up here."
              primaryAction={{
                label: 'Return to Workspace',
                icon: ArrowLeft,
                onClick: goBack,
              }}
            />
          ) : (
            <div className="space-y-6">
              {/* Today Group */}
              {todayList.length > 0 && (
                <div>
                  <span className="text-zinc-400 text-[14px] font-medium block mb-3 px-1">
                    Today
                  </span>
                  <div className="space-y-3">
                    {todayList.map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-white rounded-[26px] p-4 text-black shadow-md flex items-center gap-3.5"
                      >
                        {/* Icon or Avatar */}
                        {notif.type === NotificationType.INVITE ? (
                          <div className="w-11 h-11 rounded-full bg-[#B4FF00]/20 text-black border border-[#B4FF00] flex items-center justify-center shrink-0 font-bold">
                            <UserPlus className="w-5 h-5 text-black" />
                          </div>
                        ) : notif.type === NotificationType.CONNECTION ? (
                          <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5" />
                          </div>
                        ) : notif.type === NotificationType.REMINDER ? (
                          <div className="w-11 h-11 rounded-full bg-[#D4EFA5] text-[#234B00] flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 fill-current" />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#FFD8D8] text-[#8A0000] flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5 fill-current" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-bold text-black leading-snug">
                            {notif.title}
                          </h3>
                          <p className="text-[13px] text-zinc-600 mt-0.5 leading-snug truncate">
                            {notif.description}
                          </p>
                        </div>

                        {notif.type === NotificationType.INVITE && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('invites')}
                            className="bg-black text-[#B4FF00] hover:bg-zinc-800 text-xs font-extrabold px-3 py-1.5 rounded-xl shrink-0 transition-all active:scale-95"
                          >
                            View Invite
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Earlier Group */}
              {earlierList.length > 0 && (
                <div>
                  <span className="text-zinc-400 text-[14px] font-medium block mb-3 px-1">
                    Earlier
                  </span>
                  <div className="space-y-3">
                    {earlierList.map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-white rounded-[26px] p-4 text-black shadow-md flex items-center gap-3.5"
                      >
                        {notif.avatarUrl ? (
                          <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-black/10">
                            <UserAvatar avatarUrl={notif.avatarUrl} size={44} />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#D4EFA5] text-[#234B00] flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 fill-current" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-bold text-black leading-snug">
                            {notif.title}
                          </h3>
                          <p className="text-[13px] text-zinc-600 mt-0.5 leading-snug truncate">
                            {notif.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
