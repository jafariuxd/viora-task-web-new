import { DeadlineSource, type TaskList, type Team } from '../types';

/**
 * Calculates accurate calendar days difference between a target date and today.
 * Both dates are normalized to start-of-day (00:00:00 local time) so timezone/hour offsets don't skew results.
 * Returns:
 *   < 0 : Overdue by Math.abs(days) days
 *   === 0 : Due today
 *   > 0 : Days remaining
 */
export function getCalendarDaysDiff(
  targetDateOrMillis: number | Date | string,
  baseDate: Date = new Date()
): number {
  let target: Date;
  if (typeof targetDateOrMillis === 'number') {
    target = new Date(targetDateOrMillis);
  } else if (typeof targetDateOrMillis === 'string') {
    // If it's a date-only string like YYYY-MM-DD, parse year, month, day to avoid UTC conversion shifts
    const parts = targetDateOrMillis.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      target = new Date(year, month, day);
    } else {
      target = new Date(targetDateOrMillis);
    }
  } else {
    target = targetDateOrMillis;
  }

  if (isNaN(target.getTime())) return 0;

  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  ).getTime();

  const baseStart = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate()
  ).getTime();

  const diffMillis = targetStart - baseStart;
  return Math.round(diffMillis / (24 * 60 * 60 * 1000));
}

/**
 * Formats a target date into a clean display string (e.g., "2026 Sep 10" or "Sep 10")
 */
export function formatDueDateText(targetDateOrMillis: number | Date | string): string {
  let d: Date;
  if (typeof targetDateOrMillis === 'number') {
    d = new Date(targetDateOrMillis);
  } else if (typeof targetDateOrMillis === 'string') {
    const parts = targetDateOrMillis.split('T')[0].split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(targetDateOrMillis);
    }
  } else {
    d = targetDateOrMillis;
  }

  if (isNaN(d.getTime())) return 'No deadline';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getFullYear()} ${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

export interface DeadlineCalculationParams {
  rawDueDate?: string | number | null;
  selectedDeadlineMillis?: number | null;
  createdAtMillis?: number;
  listId?: string;
  teamId?: string;
  lists?: TaskList[];
  teams?: Team[];
  userDefaultDeadlineDays?: number;
}

export interface DeadlineCalculationResult {
  daysLeft: number;
  dueDateText: string;
  computedDeadlineMillis: number;
  selectedDeadlineMillis?: number;
  deadlineSource: DeadlineSource;
}

/**
 * Evaluates the full Viora deadline inheritance hierarchy:
 * 1. Specific Task Deadline (highest priority)
 * 2. List Default Deadline
 * 3. Team Default Deadline
 * 4. User Default Deadline (fallback: 3 days)
 */
export function computeTaskDeadline(
  params: DeadlineCalculationParams
): DeadlineCalculationResult {
  const {
    rawDueDate,
    selectedDeadlineMillis,
    createdAtMillis = Date.now(),
    listId,
    teamId,
    lists = [],
    teams = [],
    userDefaultDeadlineDays = 3,
  } = params;

  // 1. Specific deadline from explicit user selection or raw backend dueDate
  let explicitTargetMillis: number | null = null;

  if (typeof selectedDeadlineMillis === 'number' && selectedDeadlineMillis > 0) {
    explicitTargetMillis = selectedDeadlineMillis;
  } else if (rawDueDate) {
    if (typeof rawDueDate === 'number' && rawDueDate > 0) {
      explicitTargetMillis = rawDueDate;
    } else if (typeof rawDueDate === 'string' && rawDueDate.trim()) {
      const parsed = new Date(rawDueDate).getTime();
      if (!isNaN(parsed)) {
        explicitTargetMillis = parsed;
      }
    }
  }

  if (explicitTargetMillis !== null) {
    const daysLeft = getCalendarDaysDiff(explicitTargetMillis);
    const dueDateText = formatDueDateText(explicitTargetMillis);
    return {
      daysLeft,
      dueDateText,
      computedDeadlineMillis: explicitTargetMillis,
      selectedDeadlineMillis: explicitTargetMillis,
      deadlineSource: DeadlineSource.SPECIFIC,
    };
  }

  // 2. Inherited deadline from List
  const matchedList = listId ? lists.find((l) => l.id === listId) : null;
  if (matchedList && typeof matchedList.defaultDeadlineDays === 'number' && matchedList.defaultDeadlineDays > 0) {
    const targetMillis = createdAtMillis + matchedList.defaultDeadlineDays * 24 * 60 * 60 * 1000;
    return {
      daysLeft: getCalendarDaysDiff(targetMillis),
      dueDateText: formatDueDateText(targetMillis),
      computedDeadlineMillis: targetMillis,
      deadlineSource: DeadlineSource.LIST,
    };
  }

  // 3. Inherited deadline from Team
  const matchedTeam = teamId ? teams.find((t) => t.id === teamId) : null;
  if (matchedTeam && typeof matchedTeam.defaultDeadlineDays === 'number' && matchedTeam.defaultDeadlineDays > 0) {
    const targetMillis = createdAtMillis + matchedTeam.defaultDeadlineDays * 24 * 60 * 60 * 1000;
    return {
      daysLeft: getCalendarDaysDiff(targetMillis),
      dueDateText: formatDueDateText(targetMillis),
      computedDeadlineMillis: targetMillis,
      deadlineSource: DeadlineSource.TEAM,
    };
  }

  // 4. Inherited deadline from User/Account default (e.g. 3 days)
  const defaultDays = userDefaultDeadlineDays || 3;
  const targetMillis = createdAtMillis + defaultDays * 24 * 60 * 60 * 1000;
  return {
    daysLeft: getCalendarDaysDiff(targetMillis),
    dueDateText: formatDueDateText(targetMillis),
    computedDeadlineMillis: targetMillis,
    deadlineSource: DeadlineSource.USER,
  };
}
