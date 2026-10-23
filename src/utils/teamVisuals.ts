import {
  Users,
  ListTodo,
  User,
  type LucideIcon,
} from 'lucide-react';

/**
 * 10 Curated, Dark-Mode Optimized Luminous Pastel Colors.
 * Calibrated for uniform perceived contrast (~70% lightness) on dark backgrounds (#000, #0F0F12).
 * Explicitly excludes #B4FF00 (Viora Neon Lime) to avoid collision with primary active states.
 */
export const TEAM_PASTEL_PALETTE = [
  '#818CF8', // Soft Indigo / Lavender
  '#38BDF8', // Crisp Sky Blue
  '#34D399', // Fresh Mint Emerald
  '#F472B6', // Warm Rose Pink
  '#FBBF24', // Radiant Amber / Honey
  '#A78BFA', // Soft Royal Violet
  '#FB923C', // Luminous Sunset Coral
  '#2DD4BF', // Modern Lagoon Teal
  '#FB7185', // Refined Ruby / Crimson
  '#60A5FA', // Classic Cornflower Blue
];

/**
 * Deterministic hash-based pastel color generator for teams.
 * In a freelancer/agency platform, each client team gets a unique pastel identity.
 */
export function getTeamPastelColor(id: string): string {
  if (!id) return TEAM_PASTEL_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return TEAM_PASTEL_PALETTE[Math.abs(hash) % TEAM_PASTEL_PALETTE.length];
}

/**
 * Unified Team Icon for Freelancer & Agency Workspaces.
 * All client teams and external collaborations share the canonical Users icon,
 * ensuring high visual consistency, instant scannability, and zero arbitrary guesswork.
 * Distinct teams are recognized by their unique deterministic pastel color.
 */
export const TEAM_ICON: LucideIcon = Users;

export function getTeamIcon(name?: string, id?: string): LucideIcon {
  if (id === 'team_personal' || (name || '').toLowerCase() === 'personal') {
    return User;
  }
  return Users;
}

/**
 * Unified List Icon.
 * All task collections/lists under a client team use the canonical ListTodo icon.
 * Personal / Private spaces use the User icon.
 */
export const LIST_ICON: LucideIcon = ListTodo;

export function getListIcon(name?: string, isPersonal?: boolean): LucideIcon {
  if (isPersonal) return User;
  const lower = (name || '').toLowerCase();
  if (lower.includes('personal') || lower.includes('private')) {
    return User;
  }
  return ListTodo;
}

/**
 * Deterministic List Color Generator.
 * By default, lists inherit their parent team's pastel color for visual unity,
 * or receive their own accent if no parent is provided.
 */
export function getListColor(listId: string, parentTeamColor?: string): string {
  if (parentTeamColor) {
    return parentTeamColor;
  }
  if (!listId) return TEAM_PASTEL_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < listId.length; i++) {
    hash = (hash << 5) - hash + listId.charCodeAt(i);
    hash |= 0;
  }
  return TEAM_PASTEL_PALETTE[Math.abs(hash) % TEAM_PASTEL_PALETTE.length];
}

