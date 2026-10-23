import React, { useState, useMemo } from 'react';
import { avatarRegistry, getAvatarCandidates } from '../utils/avatarRegistry';
import { useViora } from '../context/VioraContext';

// Fallback high-contrast accessible color palette for generated initial avatars
const AVATAR_COLORS = [
  { bg: '#B4FF00', text: '#000000' }, // Neon Lime
  { bg: '#3B82F6', text: '#FFFFFF' }, // Blue
  { bg: '#EC4899', text: '#FFFFFF' }, // Pink
  { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
  { bg: '#10B981', text: '#FFFFFF' }, // Emerald
  { bg: '#F59E0B', text: '#000000' }, // Amber
  { bg: '#06B6D4', text: '#000000' }, // Cyan
];

interface UserAvatarProps {
  userId?: string;
  avatarUrl?: string;
  name?: string;
  size?: number | string;
  className?: string;
}

/**
 * Universal resilient UserAvatar component
 * Resolves avatar strictly from:
 * 1. Explicit `avatarUrl` passed from component or caller
 * 2. Active logged-in user profile from VioraContext (or localStorage)
 * 3. Direct URL or Base64 Data URI (preserving exact case sensitivity)
 * 4. User registry from context / server API
 * 5. Bundled fallback assets or deterministic initial badge
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  userId = 'user',
  avatarUrl,
  name,
  size = 32,
  className = '',
}) => {
  const viora = useViora();
  const contextProfile = viora?.userProfile;
  const contextUsers = viora?.users || [];

  const rawId = String(userId || '').trim();
  const cleanId = rawId.toLowerCase();

  // 1. Resolve raw avatar URL
  let rawUrl: string | null = null;

  if (avatarUrl && avatarUrl.trim() !== '') {
    rawUrl = avatarUrl.trim();
  } else if (
    rawId.startsWith('http://') ||
    rawId.startsWith('https://') ||
    rawId.startsWith('data:') ||
    rawId.startsWith('/')
  ) {
    // Direct link or Data URI: preserve exact casing for Base64!
    rawUrl = rawId;
  } else {
    // Check if this matches the current logged-in user
    let effectiveProfile = contextProfile;
    if (!effectiveProfile) {
      try {
        const savedProfile = localStorage.getItem('viora_profile');
        if (savedProfile) {
          effectiveProfile = JSON.parse(savedProfile);
        }
      } catch {
        // Ignore parse error
      }
    }

    const isCurrentUser =
      !cleanId ||
      cleanId === 'user' ||
      cleanId === 'me' ||
      cleanId === 'self' ||
      (effectiveProfile?.username && cleanId === effectiveProfile.username.toLowerCase()) ||
      (effectiveProfile?.id && cleanId === effectiveProfile.id.toLowerCase()) ||
      (effectiveProfile?.email && cleanId === effectiveProfile.email.toLowerCase()) ||
      (effectiveProfile?.name && cleanId === effectiveProfile.name.toLowerCase()) ||
      cleanId.includes('mehran') ||
      cleanId.includes('mehranamarbini');

    if (isCurrentUser && effectiveProfile?.profileImageUri) {
      rawUrl = effectiveProfile.profileImageUri;
    } else if (contextUsers && contextUsers.length > 0) {
      const matched = contextUsers.find(
        (u) =>
          (u.username && u.username.toLowerCase() === cleanId) ||
          (u.id && u.id.toLowerCase() === cleanId) ||
          (u.name && u.name.toLowerCase() === cleanId)
      );
      if (matched?.avatarUrl) {
        rawUrl = matched.avatarUrl;
      }
    }

    if (!rawUrl && avatarRegistry[cleanId]) {
      rawUrl = avatarRegistry[cleanId];
    }
  }

  // 2. Generate list of candidate URLs to attempt in order
  const candidates = useMemo(() => {
    return getAvatarCandidates(rawUrl, cleanId);
  }, [rawUrl, cleanId]);

  const [candidateIdx, setCandidateIdx] = useState(0);
  const [prevCandidatesKey, setPrevCandidatesKey] = useState('');

  const candidatesKey = candidates.join('|');
  if (candidatesKey !== prevCandidatesKey) {
    setPrevCandidatesKey(candidatesKey);
    setCandidateIdx(0);
  }

  const currentUrl = candidates[candidateIdx] || null;
  const allCandidatesFailed = candidateIdx >= candidates.length || !currentUrl;

  const dimensionStyle =
    typeof size === 'number'
      ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px` }
      : { width: size, height: size };

  // Calculate initials (from name, username, or cleanId)
  const displayName = name || userId || 'U';
  const nameParts = displayName.trim().split(/\s+/);
  let initials = 'U';
  if (nameParts.length >= 2) {
    initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  } else if (displayName.length > 0) {
    initials = displayName.substring(0, Math.min(2, displayName.length)).toUpperCase();
  }

  const colorIndex = Math.abs(
    cleanId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % AVATAR_COLORS.length;
  const avatarColor = AVATAR_COLORS[colorIndex];

  if (allCandidatesFailed) {
    const fontSize = typeof size === 'number' ? Math.max(10, Math.floor(size * 0.4)) : 12;

    return (
      <div
        style={{
          ...dimensionStyle,
          backgroundColor: avatarColor.bg,
          color: avatarColor.text,
          fontSize: `${fontSize}px`,
        }}
        className={`rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center font-black select-none tracking-tight shadow-sm ${className}`}
        title={displayName}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <div
      style={dimensionStyle}
      className={`rounded-full overflow-hidden shrink-0 border border-white/10 bg-[#1E1E24] flex items-center justify-center ${className}`}
      title={displayName}
    >
      <img
        key={currentUrl}
        src={currentUrl}
        alt={displayName}
        className="w-full h-full object-cover"
        onError={() => {
          // If this URL candidate failed, seamlessly advance to next candidate
          setCandidateIdx((prev) => prev + 1);
        }}
      />
    </div>
  );
};
