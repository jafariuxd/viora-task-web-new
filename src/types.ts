export const TaskStatus = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const DeadlineSource = {
  SPECIFIC: 'SPECIFIC',
  LIST: 'LIST',
  TEAM: 'TEAM',
  USER: 'USER',
} as const;

export type DeadlineSource = (typeof DeadlineSource)[keyof typeof DeadlineSource];

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorUsername: string;
  text: string;
  createdAtMillis: number;
}

export type TaskPriority = 1 | 2 | 3 | 4; // 1: Urgent (Red), 2: High (Orange), 3: Medium (Blue), 4: Normal (Grey)

export type CardTheme = 'white' | 'gray';

export interface Task {
  id: string;
  title: string;
  client: string;
  listId?: string;
  teamId?: string;
  userId?: string;
  selectedDeadlineMillis?: number;
  createdAtMillis?: number;
  computedDeadlineMillis?: number;
  daysLeft: number;
  deadlineSource?: DeadlineSource;
  status: TaskStatus;
  priority?: TaskPriority;
  assigneePhotos: string[]; // "mohammad", "sara", or username
  isUnplanned: boolean;
  description: string;
  tags: string[];
  dueDateText: string;
  folder: string;
  isArchived: boolean;
  subtasks?: Subtask[];
  comments?: TaskComment[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  defaultDeadlineDays: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  defaultDeadlineDays?: number;
  isArchived: boolean;
  members: User[];
}

export interface TaskList {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  defaultDeadlineDays?: number;
  isArchived: boolean;
  isPersonal?: boolean;
  members?: User[];
}

export interface UserProfileStats {
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeTeams: number;
  defaultDeadlineDays: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImageUri?: string;
  joinDate: string;
  stats: UserProfileStats;
}

export const NotificationType = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  REMINDER: 'REMINDER',
  DEADLINE: 'DEADLINE',
  CONNECTION: 'CONNECTION',
  INVITE: 'INVITE',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timeGroup: 'Today' | 'Yesterday' | 'Earlier';
  avatarUrl?: string;
  read: boolean;
  timestamp: string;
  inviteId?: string;
  teamId?: string;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  teamDescription?: string;
  inviterName: string;
  inviterUsername: string;
  inviterAvatar?: string;
  role?: string;
  membersCount?: number;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface PushToastPayload {
  id: string;
  title: string;
  body: string;
  type?: string;
  inviteId?: string;
  teamId?: string;
  timestamp: number;
}

export interface CalendarEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  isOnline?: boolean;
  location?: string;
  color?: string;
}

export interface WeatherInfo {
  location: string;
  temperature: string;
  condition: string;
  uvIndex: string;
  dateText: string;
  lastRefreshText: string;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  status: number;
  durationMs: number;
  requestBody?: string;
  responseBody?: string;
}

export interface MessageEvent {
  id: string;
  message: string;
  isError?: boolean;
}

export type AppRoute =
  | 'home'
  | 'teams'
  | 'team_detail'
  | 'list_detail'
  | 'agenda'
  | 'daily_brief'
  | 'user_profile'
  | 'edit_profile'
  | 'viora_pass'
  | 'scanner_camera'
  | 'notifications'
  | 'search'
  | 'archives'
  | 'settings'
  | 'completed_tasks'
  | 'welcome'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'otp'
  | 'profile_setup'
  | 'deadline_setup';
