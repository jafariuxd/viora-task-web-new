import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  type Task,
  TaskStatus,
  DeadlineSource,
  type Subtask,
  type Team,
  type TaskList,
  type User,
  type UserProfile,
  type Notification,
  NotificationType,
  type CalendarEvent,
  type WeatherInfo,
  type ApiLog,
  type MessageEvent,
  type AppRoute,
  type CardTheme,
  type TeamInvite,
  type PushToastPayload,
} from '../types';
import {
  computeTaskDeadline,
  getCalendarDaysDiff,
  formatDueDateText,
} from '../utils/deadlineUtils';
import { playTaskCompletedFeedback } from '../utils/feedbackUtils';
import {
  authApi,
  usersApi,
  tasksApi,
  subtasksApi,
  teamsApi,
  listsApi,
  notificationsApi,
} from '../services/api';
import { fcmService } from '../services/fcmService';
import { BUNDLED_AVATARS, registerServerAvatar, registerServerUsers } from '../utils/avatarRegistry';
import { idbService } from '../services/idbService';
import { syncEngine } from '../services/syncEngine';

// Safe default profile for unauthenticated / initial state
export const defaultUserProfile: UserProfile = {
  id: 'user_mehran',
  name: 'Mehran Marbini',
  username: 'mehran',
  email: 'mehranamarbini@gmail.com',
  profileImageUri: BUNDLED_AVATARS.mehran,
  joinDate: 'Oct 2026',
  stats: {
    assignedTasks: 12,
    completedTasks: 8,
    overdueTasks: 1,
    activeTeams: 2,
    defaultDeadlineDays: 3,
  },
};

export const defaultUsers: User[] = [
  {
    id: 'user_mehran',
    name: 'Mehran Marbini',
    username: 'mehran',
    avatarUrl: BUNDLED_AVATARS.mehran,
    defaultDeadlineDays: 3,
  },
  {
    id: 'user_sara',
    name: 'Sara Ahmadi',
    username: 'sara',
    avatarUrl: BUNDLED_AVATARS.sara,
    defaultDeadlineDays: 3,
  },
  {
    id: 'user_mohammad',
    name: 'Mohammad Rezaei',
    username: 'mohammad',
    avatarUrl: BUNDLED_AVATARS.mohammad,
    defaultDeadlineDays: 3,
  },
];

export const defaultInvites: TeamInvite[] = [
  {
    id: 'inv_viora_core',
    teamId: 'team_viora_core',
    teamName: 'Viora Design & Core Engineering',
    teamDescription: 'Building the next generation mobile & web task experience',
    inviterName: 'Sara Ahmadi',
    inviterUsername: 'sara',
    inviterAvatar: 'img_avatar_sara_1783672418392.jpg',
    role: 'Product Designer / Developer',
    membersCount: 8,
    createdAt: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: 'inv_frontend_lead',
    teamId: 'team_frontend',
    teamName: 'Mobile Platform Guild',
    teamDescription: 'Jetpack Compose & React Web Architecture',
    inviterName: 'Mohammad Hoseini',
    inviterUsername: 'mohammad',
    inviterAvatar: 'img_profile_mohammad_1783672402325.jpg',
    role: 'Senior Engineer',
    membersCount: 12,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'pending',
  },
];

export const defaultWeatherInfo: WeatherInfo = {
  location: 'Tehran',
  temperature: '21°',
  condition: 'Clear',
  uvIndex: 'Low',
  dateText: 'Today',
  lastRefreshText: 'Live',
};

// One-time client storage purge to remove historical mock data
if (typeof window !== 'undefined') {
  const isPurged = localStorage.getItem('viora_mock_purged_v3');
  if (!isPurged) {
    localStorage.removeItem('viora_tasks');
    localStorage.removeItem('viora_teams');
    localStorage.removeItem('viora_lists');
    localStorage.removeItem('viora_users');
    localStorage.removeItem('viora_notifications');
    localStorage.setItem('viora_mock_purged_v3', 'true');
  }
}

interface VioraContextType {
  // Navigation
  currentRoute: AppRoute;
  setCurrentRoute: (route: AppRoute) => void;
  navigationHistory: AppRoute[];
  navigate: (route: AppRoute) => void;
  goBack: () => void;

  // Modals & Overlays
  activeDetailTaskId: string | null;
  setActiveDetailTaskId: (id: string | null) => void;
  activeTeamId: string | null;
  setActiveTeamId: (id: string | null) => void;
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;
  showQuickTaskModal: boolean;
  setShowQuickTaskModal: (show: boolean) => void;
  showVoiceAdd: boolean;
  setShowVoiceAdd: (show: boolean) => void;
  showApiInspector: boolean;
  setShowApiInspector: (show: boolean) => void;
  showVioraPass: boolean;
  setShowVioraPass: (show: boolean) => void;

  // Real-time time & date
  currentTime: string;
  currentDate: string;

  // Backend Sync & Status
  serverStatus: 'connected' | 'syncing' | 'offline';
  lastSyncTime: string | null;
  syncWithBackend: () => Promise<void>;

  // Todoist Desktop UX Controls
  activeTodoistView: 'today' | 'inbox' | 'upcoming' | 'completed' | 'all' | 'project';
  setActiveTodoistView: (view: 'today' | 'inbox' | 'upcoming' | 'completed' | 'all' | 'project') => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  displayMode: 'list' | 'board';
  setDisplayMode: (mode: 'list' | 'board') => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  quickSearchQuery: string;
  setQuickSearchQuery: (query: string) => void;
  cardTheme: CardTheme;
  setCardTheme: (theme: CardTheme) => void;

  // Tasks
  tasks: Task[];
  activeTasks: Task[];
  archivedTasks: Task[];
  completedTasks: Task[];
  completedCount: number;
  nextTask: Task | null;
  subsequentTasks: Task[];
  unplannedCount: number;
  addTask: (task: Omit<Task, 'id' | 'createdAtMillis' | 'isArchived'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, text: string) => void;
  reorderTasks: (sourceTaskId: string, targetTaskId: string) => void;

  // Teams & Lists
  teams: Team[];
  activeTeams: Team[];
  archivedTeams: Team[];
  users: User[];
  lists: TaskList[];
  activeLists: TaskList[];
  archivedLists: TaskList[];
  addTeam: (name: string, defaultDeadlineDays?: number) => Promise<void>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  archiveTeam: (id: string) => Promise<void>;
  restoreTeam: (id: string) => Promise<void>;
  addMemberToTeam: (teamId: string, username: string) => void;
  removeMemberFromTeam: (teamId: string, userId: string) => void;
  addList: (name: string, teamId: string, defaultDeadlineDays?: number) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  archiveList: (id: string) => Promise<void>;
  restoreList: (id: string) => Promise<void>;

  // User & Auth
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isLoggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  loginSuccess: (profileData?: Partial<UserProfile>) => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, name: string, username: string) => Promise<boolean>;
  logout: () => void;
  clearAllCacheAndReset: () => void;

  // Notifications & Invites
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  teamInvites: TeamInvite[];
  fetchTeamInvites: () => Promise<void>;
  acceptTeamInvite: (inviteId: string) => Promise<void>;
  declineTeamInvite: (inviteId: string) => Promise<void>;
  pushToasts: PushToastPayload[];
  triggerLivePush: (title: string, body: string, type?: string, data?: any) => void;
  removePushToast: (id: string) => void;
  registerFcmToken: (token: string) => Promise<void>;

  // Calendar & Weather
  calendarEvents: CalendarEvent[];
  upcomingEvent: CalendarEvent | null;
  googleCalendarSynced: boolean;
  toggleGoogleCalendarSync: () => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  weatherInfo: WeatherInfo;
  setWeatherInfo: React.Dispatch<React.SetStateAction<WeatherInfo>>;
  weatherCity: string;
  setWeatherCity: (city: string) => void;

  // API Inspector Logs
  apiLogs: ApiLog[];
  logApiCall: (method: ApiLog['method'], url: string, status: number, durationMs: number, req?: any, res?: any) => void;
  clearApiLogs: () => void;

  // Toasts / Messages
  toastMessage: MessageEvent | null;
  showMessage: (message: string, isError?: boolean) => void;
  dismissToast: () => void;
}

export const VioraContext = createContext<VioraContextType | undefined>(undefined);

function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed ?? fallback;
  } catch (err) {
    console.warn(`[VioraContext] Corrupted storage key "${key}", falling back.`, err);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return fallback;
  }
}

// Helper converters between Backend and Local UI Models
function mapBackendTaskToLocal(
  bt: any,
  currentUser?: UserProfile,
  lists: TaskList[] = [],
  teams: Team[] = []
): Task {
  let status: TaskStatus = TaskStatus.TODO;
  const rawStatus = (bt.status || bt.state || '').toString().toUpperCase();
  if (
    rawStatus === 'DONE' ||
    rawStatus === 'COMPLETED' ||
    rawStatus === 'FINISHED' ||
    bt.completed === true ||
    bt.isCompleted === true
  ) {
    status = TaskStatus.DONE;
  } else if (
    rawStatus === 'IN_PROGRESS' ||
    rawStatus === 'INPROGRESS' ||
    rawStatus === 'IN-PROGRESS' ||
    rawStatus === 'DOING' ||
    rawStatus === 'PROCESSING' ||
    rawStatus === 'ACTIVE'
  ) {
    status = TaskStatus.IN_PROGRESS;
  } else {
    status = TaskStatus.TODO;
  }

  const createdAtMillis = bt.createdAt
    ? new Date(bt.createdAt).getTime()
    : (typeof bt.createdAtMillis === 'number' ? bt.createdAtMillis : Date.now());

  const listId = bt.listId || bt.list_id;
  const teamId = bt.teamId || bt.team_id;

  const rawDueDate =
    bt.dueDate ||
    bt.due_date ||
    bt.deadline ||
    bt.dueAt ||
    bt.deadlineDate ||
    bt.selectedDeadlineMillis ||
    bt.targetDate;

  const deadlineResult = computeTaskDeadline({
    rawDueDate,
    selectedDeadlineMillis: typeof bt.selectedDeadlineMillis === 'number' ? bt.selectedDeadlineMillis : undefined,
    createdAtMillis,
    listId,
    teamId,
    lists,
    teams,
    userDefaultDeadlineDays: currentUser?.stats?.defaultDeadlineDays || 3,
  });

  // Extract assignees from Swagger TaskResponseDto (bt.users)
  let assigneePhotos: string[] = [];
  if (Array.isArray(bt.users) && bt.users.length > 0) {
    registerServerUsers(bt.users);
    assigneePhotos = bt.users
      .map((u: any) => u.username || u.name || u.fullName || u.id)
      .filter(Boolean);
  } else if (Array.isArray(bt.assignees) && bt.assignees.length > 0) {
    registerServerUsers(bt.assignees);
    assigneePhotos = bt.assignees
      .map((a: any) => {
        if (typeof a === 'string') return a;
        return a.username || a.fullName || a.name || a.id || 'user';
      })
      .filter(Boolean);
  } else if (Array.isArray(bt.assigneePhotos) && bt.assigneePhotos.length > 0) {
    assigneePhotos = bt.assigneePhotos;
  } else if (bt.assignee) {
    if (typeof bt.assignee === 'object' && bt.assignee.avatar) {
      registerServerUsers([bt.assignee]);
    }
    assigneePhotos = [
      typeof bt.assignee === 'string'
        ? bt.assignee
        : bt.assignee.username || bt.assignee.fullName || bt.assignee.name || currentUser?.username || 'mehran',
    ];
  } else if (currentUser?.username) {
    assigneePhotos = [currentUser.username];
  } else {
    assigneePhotos = ['mehran'];
  }

  // Extract tags
  let tags: string[] = [];
  if (Array.isArray(bt.tags)) {
    tags = bt.tags.map((t: any) => (typeof t === 'string' ? t : t.name || String(t))).filter(Boolean);
  } else if (typeof bt.tags === 'string' && bt.tags.trim()) {
    tags = bt.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  } else if (Array.isArray(bt.categories)) {
    tags = bt.categories.map((c: any) => (typeof c === 'string' ? c : c.name || String(c))).filter(Boolean);
  }
  if (tags.length === 0) {
    tags = ['General'];
  }

  // Extract subtasks
  let subtasks: Subtask[] = [];
  const rawSubtasks = bt.subtasks || bt.checklist || bt.items || [];
  if (Array.isArray(rawSubtasks) && rawSubtasks.length > 0) {
    subtasks = rawSubtasks.map((st: any, idx: number) => ({
      id: String(st.id || st._id || `sub_${idx}_${Date.now()}`),
      title: st.title || st.name || st.text || 'Subtask',
      completed: Boolean(st.completed || st.done || st.isDone),
    }));
  }

  // Extract folder & client
  const folderName =
    bt.folder ||
    bt.teamName ||
    bt.team?.name ||
    bt.listName ||
    bt.list?.name ||
    bt.category ||
    bt.client ||
    'General';

  const clientName =
    bt.client ||
    bt.folder ||
    bt.teamName ||
    bt.team?.name ||
    bt.listName ||
    bt.list?.name ||
    'Core Project';

  return {
    id: String(bt.id || bt._id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
    title: bt.title || bt.name || bt.taskName || 'Untitled Task',
    client: clientName,
    listId,
    teamId,
    userId: bt.userId || bt.user_id,
    status,
    priority: bt.priority ? (Number(bt.priority) as any) : undefined,
    daysLeft: deadlineResult.daysLeft,
    dueDateText: deadlineResult.dueDateText,
    selectedDeadlineMillis: deadlineResult.selectedDeadlineMillis,
    computedDeadlineMillis: deadlineResult.computedDeadlineMillis,
    deadlineSource: deadlineResult.deadlineSource,
    assigneePhotos,
    isUnplanned: Boolean(bt.isUnplanned || bt.unplanned),
    description: bt.description || bt.desc || bt.content || '',
    tags,
    folder: folderName,
    isArchived: Boolean(bt.isArchived || bt.archived),
    subtasks,
    createdAtMillis,
  };
}

function isValidUuid(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function mapLocalStatusToBackend(status: TaskStatus | string): 'todo' | 'in-progress' | 'done' {
  const s = String(status).toLowerCase();
  if (s === 'done') return 'done';
  if (s === 'in_progress' || s === 'in-progress' || s === 'in progress') return 'in-progress';
  return 'todo';
}

export function VioraProvider({ children }: { children: React.ReactNode }) {
  // Navigation State
  const [navigationHistory, setNavigationHistory] = useState<AppRoute[]>(['home']);
  const currentRoute = navigationHistory[navigationHistory.length - 1] || 'home';

  const navigate = (route: AppRoute) => {
    setNavigationHistory((prev) => [...prev, route]);
  };

  const setCurrentRoute = (route: AppRoute) => {
    setNavigationHistory([route]);
  };

  const goBack = () => {
    setNavigationHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : ['home']));
  };

  // Modals
  const [activeDetailTaskId, setActiveDetailTaskId] = useState<string | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const [showVoiceAdd, setShowVoiceAdd] = useState(false);
  const [showApiInspector, setShowApiInspector] = useState(false);
  const [showVioraPass, setShowVioraPass] = useState(false);

  // Server Status State
  const [serverStatus, setServerStatus] = useState<'connected' | 'syncing' | 'offline'>('offline');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Todoist Desktop UX Controls - Default to 'all' so full chronological timeline of today + future tasks is visible on launch
  const [activeTodoistView, setActiveTodoistView] = useState<'today' | 'inbox' | 'upcoming' | 'completed' | 'all' | 'project'>(() => {
    const saved = localStorage.getItem('viora_todoist_view');
    if (saved && saved !== 'today' && saved !== 'filters') {
      return saved as any;
    }
    return 'all';
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return localStorage.getItem('viora_selected_project') || null;
  });
  const [displayMode, setDisplayMode] = useState<'list' | 'board'>(() => {
    return (localStorage.getItem('viora_display_mode') as 'list' | 'board') || 'list';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('viora_sidebar_collapsed') === 'true';
  });
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [cardTheme, setCardTheme] = useState<CardTheme>(() => {
    return (localStorage.getItem('viora_card_theme') as CardTheme) || 'white';
  });

  useEffect(() => {
    localStorage.setItem('viora_card_theme', cardTheme);
  }, [cardTheme]);

  useEffect(() => {
    localStorage.setItem('viora_todoist_view', activeTodoistView);
  }, [activeTodoistView]);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('viora_selected_project', selectedProjectId);
    } else {
      localStorage.removeItem('viora_selected_project');
    }
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem('viora_display_mode', displayMode);
  }, [displayMode]);

  useEffect(() => {
    localStorage.setItem('viora_sidebar_collapsed', isSidebarCollapsed ? 'true' : 'false');
  }, [isSidebarCollapsed]);

  // Time & Date
  const [currentTime, setCurrentTime] = useState('22:13');
  const [currentDate, setCurrentDate] = useState('Wednesday, 29 Aug');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      setCurrentDate(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tasks State (Production: Empty by default, populated via backend sync)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const parsed = safeJsonParse<Task[]>('viora_tasks', []);
    if (!Array.isArray(parsed)) return [];
    // Re-evaluate daysLeft and deadlines dynamically against current calendar day
    return parsed.filter(Boolean).map((t) => {
      // Normalize assignees: if empty or stuck on legacy 'user' or 'mohammad' default, point to 'mehran'
      let assignees = t.assigneePhotos;
      if (
        !assignees ||
        !Array.isArray(assignees) ||
        assignees.length === 0 ||
        (assignees.length === 1 && (assignees[0] === 'user' || assignees[0] === 'mohammad'))
      ) {
        assignees = ['mehran'];
      }
      const targetMillis = t.selectedDeadlineMillis || t.computedDeadlineMillis;
      if (targetMillis) {
        return {
          ...t,
          assigneePhotos: assignees,
          daysLeft: getCalendarDaysDiff(targetMillis),
          dueDateText: t.dueDateText || formatDueDateText(targetMillis),
        };
      } else if (t.dueDateText) {
        return {
          ...t,
          assigneePhotos: assignees,
          daysLeft: getCalendarDaysDiff(t.dueDateText),
        };
      }
      return { ...t, assigneePhotos: assignees };
    });
  });

  useEffect(() => {
    localStorage.setItem('viora_tasks', JSON.stringify(tasks));
    idbService.setCache('tasks', tasks);
  }, [tasks]);

  // Teams State (Production: Empty by default, populated via backend sync)
  const [teams, setTeams] = useState<Team[]>(() => {
    const parsed = safeJsonParse<Team[]>('viora_teams', []);
    return Array.isArray(parsed) ? parsed : [];
  });

  useEffect(() => {
    localStorage.setItem('viora_teams', JSON.stringify(teams));
    idbService.setCache('teams', teams);
  }, [teams]);

  // Lists State (Production: Empty by default, populated via backend sync)
  const [lists, setLists] = useState<TaskList[]>(() => {
    const parsed = safeJsonParse<TaskList[]>('viora_lists', []);
    return Array.isArray(parsed) ? parsed : [];
  });

  useEffect(() => {
    localStorage.setItem('viora_lists', JSON.stringify(lists));
    idbService.setCache('lists', lists);
  }, [lists]);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const parsed = safeJsonParse<any>('viora_profile', null);
    if (parsed && typeof parsed === 'object') {
      const resolvedProfile: UserProfile = {
        ...defaultUserProfile,
        ...parsed,
        name: parsed.name || defaultUserProfile.name,
        username: parsed.username || defaultUserProfile.username,
        email: parsed.email || defaultUserProfile.email,
        profileImageUri: parsed.profileImageUri || parsed.avatar || defaultUserProfile.profileImageUri,
      };
      if (resolvedProfile.profileImageUri) {
        registerServerAvatar(resolvedProfile.username || 'mehran', resolvedProfile.profileImageUri);
        registerServerAvatar('mehran', resolvedProfile.profileImageUri);
        registerServerAvatar('mehranamarbini', resolvedProfile.profileImageUri);
        registerServerAvatar('self', resolvedProfile.profileImageUri);
        registerServerAvatar('me', resolvedProfile.profileImageUri);
        registerServerAvatar('user', resolvedProfile.profileImageUri);
        if (resolvedProfile.id) registerServerAvatar(resolvedProfile.id, resolvedProfile.profileImageUri);
        if (resolvedProfile.email) registerServerAvatar(resolvedProfile.email, resolvedProfile.profileImageUri);
      }
      return resolvedProfile;
    }
    return defaultUserProfile;
  });

  // Users State
  const [users] = useState<User[]>(() => {
    const parsed = safeJsonParse<User[]>('viora_users', defaultUsers);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultUsers;
  });

  useEffect(() => {
    localStorage.setItem('viora_profile', JSON.stringify(userProfile));
    if (userProfile?.profileImageUri) {
      registerServerAvatar(userProfile.username || 'mehran', userProfile.profileImageUri);
      registerServerAvatar('mehran', userProfile.profileImageUri);
      registerServerAvatar('mehranamarbini', userProfile.profileImageUri);
      registerServerAvatar('self', userProfile.profileImageUri);
      registerServerAvatar('me', userProfile.profileImageUri);
      registerServerAvatar('user', userProfile.profileImageUri);
      if (userProfile.id) registerServerAvatar(userProfile.id, userProfile.profileImageUri);
      if (userProfile.email) registerServerAvatar(userProfile.email, userProfile.profileImageUri);
    }
  }, [userProfile]);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('viora_auth') === 'true';
  });

  const setLoggedIn = (loggedIn: boolean) => {
    setIsLoggedIn(loggedIn);
    localStorage.setItem('viora_auth', loggedIn ? 'true' : 'false');
  };

  const logout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    localStorage.setItem('viora_auth', 'false');
    localStorage.removeItem('viora_access_token');
    localStorage.removeItem('viora_refresh_token');
    setCurrentRoute('welcome');
    showMessage('Logged out successfully');
  };

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<MessageEvent | null>(null);

  const showMessage = useCallback((message: string, isError = false) => {
    setToastMessage({
      id: 'msg_' + Date.now(),
      message,
      isError,
    });
  }, []);

  // Handle global session expiration event dispatched by Axios interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      setIsLoggedIn(false);
      localStorage.setItem('viora_auth', 'false');
      setCurrentRoute('welcome');
      showMessage('Session expired. Please sign in again.', true);
    };

    window.addEventListener('viora_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('viora_auth_expired', handleAuthExpired);
  }, [showMessage, setCurrentRoute]);

  // Proactive silent token refresh on app focus and initial launch
  useEffect(() => {
    if (isLoggedIn) {
      authApi.checkAndRefreshToken();

      const handleFocus = () => {
        authApi.checkAndRefreshToken();
      };

      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [isLoggedIn]);

  const clearAllCacheAndReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage clear failed', e);
    }
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('sessionStorage clear failed', e);
    }
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      }
    } catch (e) {
      console.warn('cookie clear failed', e);
    }

    setIsLoggedIn(false);
    setUserProfile(defaultUserProfile);
    setTasks([]);
    setTeams([]);
    setLists([]);
    setNotifications([]);
    setApiLogs([]);
    setCurrentRoute('welcome');
    showMessage('Simulator cache, cookies, and local database wiped completely.');
  };

  // Notifications & Invites
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const parsed = safeJsonParse<Notification[]>('viora_notifications', []);
    return Array.isArray(parsed) ? parsed : [];
  });

  useEffect(() => {
    localStorage.setItem('viora_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>(() => {
    const parsed = safeJsonParse<TeamInvite[]>('viora_team_invites', defaultInvites);
    return Array.isArray(parsed) ? parsed : defaultInvites;
  });

  useEffect(() => {
    localStorage.setItem('viora_team_invites', JSON.stringify(teamInvites));
  }, [teamInvites]);

  const [pushToasts, setPushToasts] = useState<PushToastPayload[]>([]);

  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const parsed = safeJsonParse<CalendarEvent[]>('viora_events', []);
    return Array.isArray(parsed) ? parsed : [];
  });

  const [googleCalendarSynced, setGoogleCalendarSynced] = useState<boolean>(() => {
    return localStorage.getItem('viora_gcal_sync') !== 'false';
  });

  // API Inspector Logs
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  const logApiCall = useCallback(
    (
      method: ApiLog['method'],
      url: string,
      status: number,
      durationMs: number,
      req?: any,
      res?: any
    ) => {
      const newLog: ApiLog = {
        id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 5),
        timestamp: new Date().toLocaleTimeString(),
        method,
        url,
        status,
        durationMs,
        requestBody: req ? JSON.stringify(req, null, 2) : undefined,
        responseBody: res ? JSON.stringify(res, null, 2) : undefined,
      };
      setApiLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    },
    [setApiLogs]
  );

  const dismissToast = () => {
    setToastMessage(null);
  };

  // References to prevent dependency loop in syncWithBackend
  const userProfileRef = React.useRef(userProfile);
  const listsRef = React.useRef(lists);
  const teamsRef = React.useRef(teams);
  const usersRef = React.useRef(users);

  useEffect(() => {
    userProfileRef.current = userProfile;
    listsRef.current = lists;
    teamsRef.current = teams;
    usersRef.current = users;
  }, [userProfile, lists, teams, users]);

  const isSyncingRef = React.useRef(false);
  const hasInitialSyncedRef = React.useRef(false);

  // -----------------------------------------------------------------
  // Sync with Live Backend
  // -----------------------------------------------------------------
  const syncWithBackend = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setServerStatus('syncing');
    const startTime = Date.now();
    try {
      // 1. Sync User Profile and Report
      try {
        const reportRes = await usersApi.getReport();
        if (reportRes?.data) {
          const rep = reportRes.data;
          const userAvatar = rep.avatar || (rep as any).profileImageUri || (rep as any).avatarUrl;
          if (userAvatar) {
            if (rep.userId) registerServerAvatar(rep.userId, userAvatar);
            if (rep.username) registerServerAvatar(rep.username, userAvatar);
            if (rep.email) registerServerAvatar(rep.email, userAvatar);
            registerServerAvatar('me', userAvatar);
            registerServerAvatar('self', userAvatar);
          }

          setUserProfile((prev) => ({
            ...prev,
            id: rep.userId || prev.id,
            email: rep.email || prev.email,
            name: rep.fullName || prev.name,
            username: rep.username || (rep.email ? rep.email.split('@')[0] : prev.username),
            profileImageUri: userAvatar || prev.profileImageUri,
            stats: {
              ...prev.stats,
              defaultDeadlineDays: rep.remainingDays || prev.stats.defaultDeadlineDays,
              completedTasks: Array.isArray(rep.taskSummary)
                ? rep.taskSummary.filter((t: any) => t.status === 'done').length
                : prev.stats.completedTasks,
            },
          }));
        }
      } catch (meErr) {
        console.warn('Profile report sync fallback', meErr);
      }

      // 2. Fetch Teams
      let currentTeams = teamsRef.current;
      try {
        const teamsRes = await teamsApi.getAll();
        let rawTeamsList: any[] | null = null;
        if (Array.isArray(teamsRes)) rawTeamsList = teamsRes;
        else if (Array.isArray(teamsRes?.data)) rawTeamsList = teamsRes.data;
        else if (Array.isArray((teamsRes as any)?.data?.items)) rawTeamsList = (teamsRes as any).data.items;
        else if (Array.isArray((teamsRes as any)?.data?.teams)) rawTeamsList = (teamsRes as any).data.teams;

        if (rawTeamsList !== null) {
          rawTeamsList.forEach((t) => {
            if (t.owner) registerServerUsers([t.owner]);
            if (Array.isArray(t.members)) registerServerUsers(t.members);
          });

          const mappedTeams: Team[] = rawTeamsList.map((bt) => ({
            id: String(bt.id || bt._id || 'team_' + Date.now()),
            name: bt.name || 'Team',
            ownerId: bt.ownerId || (bt.owner && bt.owner.id) || userProfileRef.current.id,
            defaultDeadlineDays: bt.defaultDeadlineDays || 3,
            isArchived: Boolean(bt.isArchived),
            members: Array.isArray(bt.members)
              ? bt.members.map((m: any) => ({
                  id: String(m.id || m._id || m.username || 'member'),
                  name: m.fullName || m.name || m.username || 'Member',
                  username: m.username || 'member',
                  avatarUrl: m.avatar || m.avatarUrl,
                  defaultDeadlineDays: m.defaultDeadlineDays || 3,
                }))
              : [],
          }));
          currentTeams = mappedTeams;
          setTeams(mappedTeams);
          localStorage.setItem('viora_teams', JSON.stringify(mappedTeams));
        }
      } catch (teamErr) {
        console.warn('Teams sync fallback', teamErr);
      }

      // 3. Fetch Lists
      let currentLists = listsRef.current;
      try {
        const listsRes = await listsApi.getAll();
        let rawLists: any[] | null = null;
        if (Array.isArray(listsRes)) rawLists = listsRes;
        else if (Array.isArray(listsRes?.data)) rawLists = listsRes.data;
        else if (Array.isArray((listsRes as any)?.data?.lists)) rawLists = (listsRes as any).data.lists;

        if (rawLists !== null) {
          rawLists.forEach((l) => {
            if (Array.isArray(l.users)) registerServerUsers(l.users);
          });

          const mappedLists: TaskList[] = rawLists.map((bl) => ({
            id: String(bl.id || bl._id || 'list_' + Date.now()),
            name: bl.name || 'Folder',
            teamId: bl.teamId || bl.team_id || '',
            defaultDeadlineDays: bl.defaultDeadlineDays || 3,
            isArchived: Boolean(bl.isArchived),
            members: Array.isArray(bl.users)
              ? bl.users.map((u: any) => ({
                  id: String(u.id || u.username),
                  name: u.fullName || u.username,
                  username: u.username,
                  avatarUrl: u.avatar,
                  defaultDeadlineDays: 3,
                }))
              : undefined,
          }));
          currentLists = mappedLists;
          setLists(mappedLists);
          localStorage.setItem('viora_lists', JSON.stringify(mappedLists));
        }
      } catch (listErr) {
        console.warn('Lists sync fallback', listErr);
      }

      // 4. Sync Tasks
      const tasksRes = await tasksApi.getAll();
      const duration = Date.now() - startTime;
      logApiCall('GET', '/api/tasks', 200, duration, null, tasksRes);

      let rawTaskList: any[] | null = null;
      if (Array.isArray(tasksRes)) {
        rawTaskList = tasksRes;
      } else if (Array.isArray(tasksRes?.data)) {
        rawTaskList = tasksRes.data;
      } else if (Array.isArray((tasksRes as any)?.data?.tasks)) {
        rawTaskList = (tasksRes as any).data.tasks;
      } else if (Array.isArray((tasksRes as any)?.data?.items)) {
        rawTaskList = (tasksRes as any).data.items;
      } else if (Array.isArray((tasksRes as any)?.tasks)) {
        rawTaskList = (tasksRes as any).tasks;
      }

      if (rawTaskList !== null) {
        const mappedTasks = rawTaskList.map((bt) =>
          mapBackendTaskToLocal(bt, userProfileRef.current, currentLists, currentTeams)
        );
        setTasks(mappedTasks);
        localStorage.setItem('viora_tasks', JSON.stringify(mappedTasks));
      }

      setServerStatus('connected');
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logApiCall(
        'GET',
        '/api/tasks',
        error?.response?.status || 503,
        duration,
        null,
        error?.response?.data || { error: 'Network / Mixed Content fallback active' }
      );
      setServerStatus('offline');
    } finally {
      isSyncingRef.current = false;
    }
  }, [logApiCall]);

  // Register syncEngine subscription and background refresh callback
  useEffect(() => {
    syncEngine.registerDataRefreshCallback(async () => {
      await syncWithBackend();
    });

    const unsubscribe = syncEngine.subscribe((state) => {
      setServerStatus(
        state.status === 'offline' ? 'offline' : state.status === 'syncing' ? 'syncing' : 'connected'
      );
      if (state.lastSyncTime) {
        setLastSyncTime(state.lastSyncTime);
      }
    });

    return () => unsubscribe();
  }, [syncWithBackend]);

  // Initial Sync when logged in - runs once on startup / login
  useEffect(() => {
    if (isLoggedIn && !hasInitialSyncedRef.current) {
      hasInitialSyncedRef.current = true;
      syncWithBackend();
    } else if (!isLoggedIn) {
      hasInitialSyncedRef.current = false;
    }
  }, [isLoggedIn, syncWithBackend]);

  // Filtered Tasks
  const activeTasks = tasks.filter((t) => !t.isArchived);
  const archivedTasks = tasks.filter((t) => t.isArchived);
  const activeTeams = teams.filter((t) => !t.isArchived);
  const archivedTeams = teams.filter((t) => t.isArchived);
  const activeLists = lists.filter((l) => !l.isArchived);
  const archivedLists = lists.filter((l) => l.isArchived);

  // Completed vs Pending Active tasks
  const completedTasks = activeTasks.filter((t) => t.status === TaskStatus.DONE);
  const completedCount = completedTasks.length;
  const pendingTasks = activeTasks.filter((t) => t.status !== TaskStatus.DONE);

  // Next Task & Subsequent Tasks: strictly sorted by deadline urgency (closest deadline first)
  const sortedPendingTasks = [...pendingTasks].sort((a, b) => {
    if (a.isUnplanned && !b.isUnplanned) return 1;
    if (!a.isUnplanned && b.isUnplanned) return -1;
    if (a.daysLeft !== b.daysLeft) {
      return a.daysLeft - b.daysLeft;
    }
    const aTime = a.selectedDeadlineMillis || a.computedDeadlineMillis || a.createdAtMillis || 0;
    const bTime = b.selectedDeadlineMillis || b.computedDeadlineMillis || b.createdAtMillis || 0;
    return aTime - bTime;
  });

  const nextTask = sortedPendingTasks[0] || null;
  const subsequentTasks = nextTask ? sortedPendingTasks.filter((t) => t.id !== nextTask.id) : [];
  const unplannedCount = pendingTasks.filter((t) => t.isUnplanned).length;

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const upcomingEvent = calendarEvents[0] || null;

  // Task Actions
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAtMillis' | 'isArchived'>) => {
    const tempId = 'task_' + Date.now();
    const createdAtMillis = Date.now();

    const deadlineResult = computeTaskDeadline({
      rawDueDate: taskData.dueDateText,
      selectedDeadlineMillis: taskData.selectedDeadlineMillis,
      createdAtMillis,
      listId: taskData.listId,
      teamId: taskData.teamId,
      lists,
      teams,
      userDefaultDeadlineDays: userProfile?.stats?.defaultDeadlineDays || 3,
    });

    // Check if the deadline was specifically set by user or inherited
    const isSpecificDeadline =
      taskData.deadlineSource === DeadlineSource.SPECIFIC ||
      (typeof taskData.selectedDeadlineMillis === 'number' && taskData.selectedDeadlineMillis > 0);

    let deadlineDays: number | null = null;
    if (isSpecificDeadline && taskData.selectedDeadlineMillis) {
      const targetDate = new Date(taskData.selectedDeadlineMillis);
      const today = new Date();
      const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      deadlineDays = Math.max(1, Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24)));
    }

    const newTask: Task = {
      ...taskData,
      id: tempId,
      createdAtMillis,
      daysLeft: typeof taskData.daysLeft === 'number' ? taskData.daysLeft : deadlineResult.daysLeft,
      dueDateText: taskData.dueDateText || deadlineResult.dueDateText,
      selectedDeadlineMillis: taskData.selectedDeadlineMillis || deadlineResult.selectedDeadlineMillis,
      computedDeadlineMillis: deadlineResult.computedDeadlineMillis,
      deadlineSource: taskData.deadlineSource || deadlineResult.deadlineSource,
      isArchived: false,
    };

    // Optimistic local update: insert into feed immediately
    setTasks((prev) => [newTask, ...prev]);

    // Clean usernames: Strip any leading @ and trim whitespace
    const cleanUsernames = (taskData.assigneePhotos || [])
      .map((u) => (typeof u === 'string' ? u.replace(/^@+/, '').trim() : ''))
      .filter((u) => u.length > 0 && u !== 'unassigned');

    // Validate listId: Only pass listId if it is a valid UUIDv4 string; otherwise pass null
    const validListId = isValidUuid(taskData.listId) ? taskData.listId : null;

    // Clean tags
    const cleanTags = (taskData.tags || [])
      .map((t) => (typeof t === 'string' ? t.trim() : ''))
      .filter((t) => t.length > 0);

    // Backend payload according to Swagger specification
    const backendPayload: any = {
      name: taskData.title.trim(),
      description: taskData.description && taskData.description.trim() ? taskData.description.trim() : null,
      deadlineDays,
      listId: validListId,
      status: mapLocalStatusToBackend(taskData.status),
      tags: cleanTags.length > 0 ? cleanTags : null,
      usernames: cleanUsernames.length > 0 ? cleanUsernames : null,
    };

    if (taskData.subtasks && taskData.subtasks.length > 0) {
      backendPayload.subtasks = taskData.subtasks.map((s) => ({
        name: s.title.trim(),
        status: s.completed ? 'done' : 'todo',
      }));
    }

    const startTime = Date.now();
    try {
      const res = await tasksApi.create(backendPayload);

      const duration = Date.now() - startTime;
      logApiCall('POST', '/api/tasks', 201, duration, backendPayload, res);

      const remoteId = (res?.data as any)?.task?.id || (res?.data as any)?.id || (res as any)?.id;
      if (remoteId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: remoteId } : t))
        );
      }
      showMessage('Task created and synced online');
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const status = err?.response?.status || 500;
      const errorData = err?.response?.data || { error: err?.message || 'Network / Auth error' };
      logApiCall('POST', '/api/tasks', status, duration, backendPayload, errorData);

      // Enqueue for background offline sync
      await syncEngine.enqueue('CREATE_TASK', backendPayload);

      if (status === 401) {
        showMessage('Saved locally. Backend returned 401: Queued for sync once re-authenticated.', true);
      } else {
        showMessage('Saved locally & queued for background sync');
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const prevTask = tasks.find((t) => t.id === id);

    // 1. Optimistic local update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (
          updates.dueDateText !== undefined ||
          updates.selectedDeadlineMillis !== undefined ||
          updates.teamId !== undefined ||
          updates.listId !== undefined
        ) {
          const dl = computeTaskDeadline({
            rawDueDate: updated.dueDateText,
            selectedDeadlineMillis: updated.selectedDeadlineMillis,
            createdAtMillis: updated.createdAtMillis,
            listId: updated.listId,
            teamId: updated.teamId,
            lists,
            teams,
            userDefaultDeadlineDays: userProfile?.stats?.defaultDeadlineDays || 3,
          });
          if (updates.daysLeft === undefined) {
            updated.daysLeft = dl.daysLeft;
          }
          if (updates.dueDateText === undefined) {
            updated.dueDateText = dl.dueDateText;
          }
          updated.computedDeadlineMillis = dl.computedDeadlineMillis;
          updated.deadlineSource = dl.deadlineSource;
        }
        return updated;
      })
    );

    // 2. Guard: do not send PATCH request if id is not a valid UUID
    if (!isValidUuid(id)) {
      return;
    }

    const startTime = Date.now();
    const backendUpdates: any = {};

    if (updates.title !== undefined) {
      backendUpdates.name = updates.title.trim();
    }
    if (updates.description !== undefined) {
      backendUpdates.description = updates.description && updates.description.trim() ? updates.description.trim() : null;
    }
    if (updates.status !== undefined) {
      backendUpdates.status = mapLocalStatusToBackend(updates.status);
    }
    if (updates.selectedDeadlineMillis !== undefined) {
      if (updates.selectedDeadlineMillis) {
        const targetDate = new Date(updates.selectedDeadlineMillis);
        const today = new Date();
        const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        backendUpdates.deadlineDays = Math.max(1, Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24)));
      } else {
        backendUpdates.deadlineDays = null;
      }
    }
    if (updates.listId !== undefined) {
      backendUpdates.listId = isValidUuid(updates.listId) ? updates.listId : null;
    }
    if (updates.tags !== undefined) {
      backendUpdates.tagsToAdd = updates.tags && updates.tags.length > 0
        ? updates.tags.map((t) => t.trim()).filter(Boolean)
        : null;
    }

    // Compute diffed assignee arrays:
    // usernamesToAdd: currentAssignees.filter(u => !prevAssignees.includes(u))
    // usernamesToRemove: prevAssignees.filter(u => !currentAssignees.includes(u))
    if (updates.assigneePhotos !== undefined && prevTask) {
      const prevAssignees = (prevTask.assigneePhotos || [])
        .map((u) => (typeof u === 'string' ? u.replace(/^@+/, '').trim() : ''))
        .filter((u) => u.length > 0 && u !== 'unassigned');
      const currentAssignees = updates.assigneePhotos
        .map((u) => (typeof u === 'string' ? u.replace(/^@+/, '').trim() : ''))
        .filter((u) => u.length > 0 && u !== 'unassigned');

      const toAdd = currentAssignees.filter((u) => !prevAssignees.includes(u));
      const toRemove = prevAssignees.filter((u) => !currentAssignees.includes(u));

      if (toAdd.length > 0) {
        backendUpdates.usernamesToAdd = toAdd;
      }
      if (toRemove.length > 0) {
        backendUpdates.usernamesToRemove = toRemove;
      }
    }

    if (Object.keys(backendUpdates).length === 0) {
      return;
    }

    try {
      const res = await tasksApi.update(id, backendUpdates);
      const duration = Date.now() - startTime;
      logApiCall('PATCH', `/api/tasks/${id}`, 200, duration, backendUpdates, res);
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const status = err?.response?.status || 500;
      const errorData = err?.response?.data || { error: err?.message || 'Sync error' };
      logApiCall('PATCH', `/api/tasks/${id}`, status, duration, backendUpdates, errorData);

      // If server error, rollback optimistic update and show localized banner
      if (status >= 400 && status < 500 && status !== 401 && prevTask) {
        setTasks((prev) => prev.map((t) => (t.id === id ? prevTask : t)));
        showMessage(`Server error (${status}): Update reverted.`, true);
      } else {
        await syncEngine.enqueue('UPDATE_TASK', { id, ...backendUpdates });
      }
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const prevTask = tasks.find((t) => t.id === id);
    const wasDone = prevTask?.status === TaskStatus.DONE;
    const isNowDone = status === TaskStatus.DONE;

    // Optimistic local update: instantly updates feed & re-calculates Next Task
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

    if (isNowDone && !wasDone) {
      // Tactile / Audio feedback on completion confirmation
      playTaskCompletedFeedback();

      setUserProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          completedTasks: prev.stats.completedTasks + 1,
        },
      }));
      showMessage('Task marked as Done 🎉');
    } else if (!isNowDone && wasDone) {
      setUserProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          completedTasks: Math.max(0, prev.stats.completedTasks - 1),
        },
      }));
      showMessage(`Status reverted to ${status}`);
    } else {
      showMessage(`Status updated to ${status}`);
    }

    if (!isValidUuid(id)) {
      return;
    }

    const startTime = Date.now();
    const backendStatus = mapLocalStatusToBackend(status);
    try {
      const res = await tasksApi.update(id, { status: backendStatus });
      const duration = Date.now() - startTime;
      logApiCall('PATCH', `/api/tasks/${id}`, 200, duration, { status: backendStatus }, res);
    } catch (err: any) {
      const duration = Date.now() - startTime;
      logApiCall('PATCH', `/api/tasks/${id}`, err?.response?.status || 500, duration, { status: backendStatus }, err?.response?.data);

      // Rollback optimistic state if server rejects request
      if (prevTask) {
        setTasks((prev) => prev.map((t) => (t.id === id ? prevTask : t)));
        if (isNowDone && !wasDone) {
          setUserProfile((prev) => ({
            ...prev,
            stats: {
              ...prev.stats,
              completedTasks: Math.max(0, prev.stats.completedTasks - 1),
            },
          }));
        }
      }
      showMessage('Failed to update task status on server. Reverted.', true);
      await syncEngine.enqueue('UPDATE_TASK', { id, status: backendStatus });
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (!isValidUuid(id)) {
      showMessage('Task removed locally');
      return;
    }
    const startTime = Date.now();
    try {
      const res = await tasksApi.delete(id);
      const duration = Date.now() - startTime;
      logApiCall('DELETE', `/api/tasks/${id}`, 200, duration, null, res);
      showMessage('Task deleted on server');
    } catch (err: any) {
      const duration = Date.now() - startTime;
      logApiCall('DELETE', `/api/tasks/${id}`, err?.response?.status || 500, duration, null, err?.response?.data);
      await syncEngine.enqueue('DELETE_TASK', { id });
      showMessage('Task deleted locally & queued for sync');
    }
  };

  const archiveTask = async (id: string) => {
    updateTask(id, { isArchived: true });
    if (!isValidUuid(id)) {
      showMessage('Task moved to Archives');
      return;
    }
    try {
      await tasksApi.archive(id);
    } catch {
      // Handled locally
    }
    showMessage('Task moved to Archives');
  };

  const restoreTask = async (id: string) => {
    updateTask(id, { isArchived: false });
    if (!isValidUuid(id)) {
      showMessage('Task restored');
      return;
    }
    try {
      await tasksApi.archive(id);
    } catch {
      // Handled locally
    }
    showMessage('Task restored');
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    let previousSubtaskCompleted = false;
    let nextStatus: 'done' | 'todo' = 'done';

    // Optimistic local state update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const subtasks = (t.subtasks || []).map((s) => {
          if (s.id === subtaskId) {
            previousSubtaskCompleted = s.completed;
            nextStatus = !s.completed ? 'done' : 'todo';
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        return { ...t, subtasks };
      })
    );

    if (nextStatus === 'done') {
      playTaskCompletedFeedback();
    }

    if (subtaskId.startsWith('sub_') || !isValidUuid(subtaskId)) {
      return;
    }

    try {
      // Direct call to PATCH /api/subtasks/{subtaskId}/status with body: { "status": "done" | "todo" }
      await subtasksApi.updateStatus(subtaskId, nextStatus);
    } catch (err: any) {
      console.warn('Subtask status sync error', err);
      // Gracefully rollback optimistic state if network fails
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const subtasks = (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, completed: previousSubtaskCompleted } : s
          );
          return { ...t, subtasks };
        })
      );
      showMessage('Failed to update subtask status on server. Reverted.', true);
    }
  };

  const addSubtask = async (taskId: string, title: string) => {
    const tempSubId = 'sub_' + Date.now();
    const newSubtask = { id: tempSubId, title, completed: false };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, subtasks: [...(t.subtasks || []), newSubtask] };
      })
    );
    try {
      if (!taskId.startsWith('task_')) {
        await tasksApi.update(taskId, {
          subtasksToAdd: [{ name: title, status: 'todo' }],
        });
      }
    } catch (err) {
      console.warn('Add subtask online sync error', err);
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId) };
      })
    );
    try {
      if (!taskId.startsWith('task_') && !subtaskId.startsWith('sub_')) {
        await tasksApi.update(taskId, {
          subtaskIdsToRemove: [subtaskId],
        });
      }
    } catch (err) {
      console.warn('Delete subtask online sync error', err);
    }
  };

  const addComment = (taskId: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: 'cmt_' + Date.now(),
      authorName: userProfile?.name || 'User',
      authorUsername: userProfile?.username || 'user',
      text: text.trim(),
      createdAtMillis: Date.now(),
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, comments: [...(t.comments || []), newComment] };
      })
    );
  };

  const reorderTasks = (sourceTaskId: string, targetTaskId: string) => {
    if (sourceTaskId === targetTaskId) return;
    setTasks((prev) => {
      const sourceIndex = prev.findIndex((t) => t.id === sourceTaskId);
      const targetIndex = prev.findIndex((t) => t.id === targetTaskId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const newTasks = [...prev];
      const [movedItem] = newTasks.splice(sourceIndex, 1);
      newTasks.splice(targetIndex, 0, movedItem);
      return newTasks;
    });
  };

  // Team Actions with Live API Integration
  const addTeam = async (name: string, defaultDeadlineDays = 3) => {
    const tempId = 'team_' + Date.now();
    const newTeam: Team = {
      id: tempId,
      name,
      ownerId: userProfile.id || 'me',
      defaultDeadlineDays,
      isArchived: false,
      members: userProfile.id
        ? [
            {
              id: userProfile.id,
              name: userProfile.name || 'Owner',
              username: userProfile.username || 'owner',
              avatarUrl: userProfile.profileImageUri,
              defaultDeadlineDays,
            },
          ]
        : [],
    };
    setTeams((prev) => [...prev, newTeam]);

    const startTime = Date.now();
    try {
      const res = await teamsApi.create({ name, deadlineDays: defaultDeadlineDays });
      const duration = Date.now() - startTime;
      logApiCall('POST', '/api/teams', 201, duration, { name, deadlineDays: defaultDeadlineDays }, res);
      const remoteId = (res?.data as any)?.id || (res as any)?.id;
      if (remoteId) {
        setTeams((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: remoteId } : t))
        );
      }
      showMessage(`Team "${name}" created on server`);
    } catch (err: any) {
      const duration = Date.now() - startTime;
      logApiCall('POST', '/api/teams', err?.response?.status || 500, duration, { name });
      showMessage(`Team "${name}" created locally`);
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    try {
      if (!id.startsWith('team_')) {
        await teamsApi.update(id, {
          name: updates.name,
          description: updates.description,
          deadlineDays: updates.defaultDeadlineDays,
        });
      }
    } catch (err) {
      console.warn('Update team online sync error', err);
    }
    logApiCall('PATCH', `/api/teams/${id}`, 200, 70, updates);
  };

  const deleteTeam = async (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    try {
      if (!id.startsWith('team_')) {
        await teamsApi.delete(id);
      }
    } catch (err) {
      console.warn('Delete team online sync error', err);
    }
    logApiCall('DELETE', `/api/teams/${id}`, 200, 95);
    showMessage('Team deleted');
  };

  const archiveTeam = async (id: string) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, isArchived: true } : t)));
    try {
      if (!id.startsWith('team_')) {
        await teamsApi.archive(id);
      }
    } catch (err) {
      console.warn('Archive team online sync error', err);
    }
    showMessage('Team archived');
  };

  const restoreTeam = async (id: string) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, isArchived: false } : t)));
    try {
      if (!id.startsWith('team_')) {
        await teamsApi.unarchive(id);
      }
    } catch (err) {
      console.warn('Restore team online sync error', err);
    }
    showMessage('Team restored');
  };

  const addMemberToTeam = async (teamId: string, username: string) => {
    const cleanUsername = username.trim().replace(/^@/, '');
    const newMemberUser: User = {
      id: 'user_' + Date.now(),
      name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
      username: cleanUsername,
      defaultDeadlineDays: 3,
    };

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        if (t.members.some((m) => m.username.toLowerCase() === cleanUsername.toLowerCase())) return t;
        return { ...t, members: [...t.members, newMemberUser] };
      })
    );

    try {
      if (!teamId.startsWith('team_')) {
        await teamsApi.update(teamId, { addUsernames: [cleanUsername] });
      }
    } catch (err) {
      console.warn('Add team member online sync error', err);
    }
    logApiCall('POST', `/api/teams/${teamId}/members`, 200, 85, { username: cleanUsername });
    showMessage(`@${cleanUsername} added to team`);
  };

  const removeMemberFromTeam = async (teamId: string, userId: string) => {
    const targetTeam = teams.find((t) => t.id === teamId);
    const targetMember = targetTeam?.members.find((m) => m.id === userId);
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        return { ...t, members: t.members.filter((m) => m.id !== userId) };
      })
    );
    try {
      if (!teamId.startsWith('team_') && targetMember?.username) {
        await teamsApi.update(teamId, { removeUsernames: [targetMember.username] });
      }
    } catch (err) {
      console.warn('Remove member online sync error', err);
    }
    showMessage('Member removed from team');
  };

  // List Actions with Live API Integration
  const addList = async (name: string, teamId: string, defaultDeadlineDays?: number) => {
    const tempId = 'list_' + Date.now();
    const newList: TaskList = {
      id: tempId,
      name,
      teamId,
      defaultDeadlineDays,
      isArchived: false,
    };
    setLists((prev) => [...prev, newList]);

    const startTime = Date.now();
    try {
      const payload: any = {
        name: name.trim(),
        deadlineDays: defaultDeadlineDays || 3,
      };
      if (isValidUuid(teamId)) {
        payload.teamId = teamId;
      }
      const res = await listsApi.create(payload);
      const duration = Date.now() - startTime;
      logApiCall('POST', '/api/lists', 201, duration, payload, res);
      const remoteId = (res?.data as any)?.list?.id || (res?.data as any)?.id || (res as any)?.id;
      if (remoteId) {
        setLists((prev) => prev.map((l) => (l.id === tempId ? { ...l, id: remoteId } : l)));
      }
      showMessage(`List "${name}" created on server`);
    } catch (err: any) {
      const duration = Date.now() - startTime;
      logApiCall('POST', '/api/lists', err?.response?.status || 201, duration, { name, teamId });
      showMessage(`List "${name}" created locally`);
    }
  };

  const deleteList = async (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (!isValidUuid(id)) {
      showMessage('List deleted');
      return;
    }
    const startTime = Date.now();
    try {
      await listsApi.delete(id);
      const duration = Date.now() - startTime;
      logApiCall('DELETE', `/api/lists/${id}`, 200, duration);
    } catch {
      // Local deletion done
    }
    showMessage('List deleted');
  };

  const archiveList = async (id: string) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, isArchived: true } : l)));
    if (!isValidUuid(id)) {
      showMessage('List archived');
      return;
    }
    try {
      await listsApi.archive(id);
    } catch {
      // Local
    }
    showMessage('List archived');
  };

  const restoreList = async (id: string) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, isArchived: false } : l)));
    showMessage('List restored');
  };

  // User Profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...updates };
      if (updated.profileImageUri) {
        registerServerAvatar(updated.username || 'mehran', updated.profileImageUri);
        registerServerAvatar('mehran', updated.profileImageUri);
        registerServerAvatar('mehranamarbini', updated.profileImageUri);
        registerServerAvatar('self', updated.profileImageUri);
        registerServerAvatar('me', updated.profileImageUri);
        registerServerAvatar('user', updated.profileImageUri);
        if (updated.id) registerServerAvatar(updated.id, updated.profileImageUri);
        if (updated.email) registerServerAvatar(updated.email, updated.profileImageUri);
      }
      return updated;
    });
    const startTime = Date.now();
    try {
      const res = await usersApi.updateMe({
        fullName: updates.name,
        avatar: updates.profileImageUri,
        days: updates.stats?.defaultDeadlineDays,
      });
      const duration = Date.now() - startTime;
      logApiCall('PATCH', '/api/users/me', 200, duration, updates, res);
      showMessage('Profile synced with server');
    } catch (err: any) {
      const duration = Date.now() - startTime;
      logApiCall('PATCH', '/api/users/me', err?.response?.status || 200, duration, updates);
      showMessage('Profile updated');
    }
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showMessage('All notifications marked as read');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showMessage('Notifications cleared');
  };

  // Live Push & FCM Handlers
  const removePushToast = useCallback((id: string) => {
    setPushToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerLivePush = useCallback(
    (title: string, body: string, type = 'GENERAL', data?: any) => {
      const newToast: PushToastPayload = {
        id: 'push_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        title,
        body,
        type,
        inviteId: data?.inviteId,
        teamId: data?.teamId,
        timestamp: Date.now(),
      };
      setPushToasts((prev) => [newToast, ...prev]);

      // Add to persistent notifications list
      const newNotif: Notification = {
        id: 'notif_' + Date.now(),
        type: type === 'INVITE' ? NotificationType.INVITE : NotificationType.TASK_ASSIGNED,
        title,
        description: body,
        timeGroup: 'Today',
        read: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        inviteId: data?.inviteId,
        teamId: data?.teamId,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        removePushToast(newToast.id);
      }, 6000);
    },
    [removePushToast]
  );

  const registerFcmToken = useCallback(
    async (token: string) => {
      try {
        await notificationsApi.registerFcmToken(token);
        logApiCall('POST', '/api/notifications/fcm-token', 200, 45, { fcmToken: token, platform: 'web' });
      } catch (err: any) {
        logApiCall('POST', '/api/notifications/fcm-token', err?.response?.status || 200, 45, { fcmToken: token });
      }
    },
    [logApiCall]
  );

  // Auto initialize FCM token registration & push listener when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fcmService.initAndRegister().then((token) => {
        if (token) registerFcmToken(token);
      });

      const unsubscribe = fcmService.subscribeToPushes((payload) => {
        triggerLivePush(payload.title, payload.body, payload.type, payload.data);
      });

      return () => unsubscribe();
    }
  }, [isLoggedIn, registerFcmToken, triggerLivePush]);

  // Team Invitation Handlers
  const fetchTeamInvites = useCallback(async () => {
    try {
      const res = await teamsApi.getInvitations();
      let items: any[] = [];
      if (Array.isArray(res)) items = res;
      else if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res?.data?.items)) items = res.data.items;

      if (items.length > 0) {
        const mapped: TeamInvite[] = items.map((inv: any) => ({
          id: inv.id || 'inv_' + Date.now(),
          teamId: inv.teamId || inv.team_id || 'team_joined',
          teamName: inv.teamName || inv.team_name || inv.team?.name || 'New Team Workspace',
          teamDescription: inv.teamDescription || inv.team?.description || 'Collaborative team workspace',
          inviterName: inv.inviterName || inv.inviter?.fullName || 'Team Admin',
          inviterUsername: inv.inviterUsername || inv.inviter?.username || 'admin',
          inviterAvatar: inv.inviterAvatar || inv.inviter?.avatar,
          role: inv.role || 'Member',
          membersCount: inv.membersCount || inv.team?.members?.length || 5,
          createdAt: inv.createdAt || new Date().toISOString(),
          status: inv.status || 'pending',
        }));
        setTeamInvites(mapped);
      }
    } catch {
      // keep local state
    }
  }, []);

  const acceptTeamInvite = async (inviteId: string) => {
    const invite = teamInvites.find((i) => i.id === inviteId);
    const targetTeamName = invite?.teamName || 'New Team Workspace';
    const targetTeamId = invite?.teamId || 'team_' + Date.now();

    const startTime = Date.now();
    try {
      await teamsApi.acceptInvitation(inviteId);
      logApiCall('POST', `/api/teams/invitations/${inviteId}/accept`, 200, Date.now() - startTime);
    } catch (err: any) {
      logApiCall('POST', `/api/teams/invitations/${inviteId}/accept`, err?.response?.status || 200, Date.now() - startTime);
    }

    // Remove invite from pending list
    setTeamInvites((prev) => prev.filter((i) => i.id !== inviteId));

    // Ensure target team is present in teams list
    const existingTeam = teams.find((t) => t.id === targetTeamId);
    let joinedTeam: Team;
    if (existingTeam) {
      joinedTeam = existingTeam;
    } else {
      joinedTeam = {
        id: targetTeamId,
        name: targetTeamName,
        description: invite?.teamDescription || 'Collaborative team workspace',
        ownerId: invite?.inviterUsername || 'admin',
        defaultDeadlineDays: 5,
        isArchived: false,
        members: [
          {
            id: userProfile.id || 'me',
            name: userProfile.name,
            username: userProfile.username,
            avatarUrl: userProfile.profileImageUri,
            defaultDeadlineDays: 5,
          },
        ],
      };
      setTeams((prev) => [joinedTeam, ...prev]);
    }

    showMessage(`Accepted invitation and joined ${targetTeamName}!`);

    // Sync with backend to refresh tasks, lists and teams
    await syncWithBackend();

    // Automatically navigate to newly joined team
    setCurrentRoute('teams');
  };

  const declineTeamInvite = async (inviteId: string) => {
    const invite = teamInvites.find((i) => i.id === inviteId);
    const startTime = Date.now();
    try {
      await teamsApi.declineInvitation(inviteId);
      logApiCall('POST', `/api/teams/invitations/${inviteId}/decline`, 200, Date.now() - startTime);
    } catch (err: any) {
      logApiCall('POST', `/api/teams/invitations/${inviteId}/decline`, err?.response?.status || 200, Date.now() - startTime);
    }

    setTeamInvites((prev) => prev.filter((i) => i.id !== inviteId));
    showMessage(`Declined invitation to ${invite?.teamName || 'team'}`);
  };

  // Weather & Calendar
  const [weatherCity, setWeatherCity] = useState('Tehran');
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>(defaultWeatherInfo);

  const toggleGoogleCalendarSync = () => {
    setGoogleCalendarSynced((prev) => {
      const next = !prev;
      localStorage.setItem('viora_gcal_sync', String(next));
      logApiCall('POST', '/api/integrations/google-calendar/sync', 200, 140, { enabled: next });
      showMessage(next ? 'Google Calendar synchronized' : 'Google Calendar sync paused');
      return next;
    });
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = { ...event, id: 'ev_' + Date.now() };
    setCalendarEvents((prev) => [newEv, ...prev]);
    logApiCall('POST', '/api/calendar/events', 201, 80, newEv);
    showMessage('Event scheduled');
  };

  const loginSuccess = (profileData?: Partial<UserProfile>) => {
    if (profileData) {
      setUserProfile((prev) => ({ ...prev, ...profileData }));
    }
    setLoggedIn(true);
    showMessage('Welcome to Viora!');
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();
    const startTime = Date.now();

    try {
      const res = await authApi.login(trimmedEmail, password);
      const duration = Date.now() - startTime;
      logApiCall('POST', '/api/auth/login', 200, duration, { email: trimmedEmail }, res);

      if (res?.data?.user) {
        const u = res.data.user;
        if (u.avatar) {
          registerServerAvatar(u.id, u.avatar);
          if (u.username) registerServerAvatar(u.username, u.avatar);
          if (u.email) registerServerAvatar(u.email, u.avatar);
          registerServerAvatar('me', u.avatar);
          registerServerAvatar('self', u.avatar);
        }
        setUserProfile((prev) => ({
          ...prev,
          id: u.id || prev.id,
          email: u.email || trimmedEmail,
          name: u.fullName || prev.name,
          username: u.username || u.email?.split('@')[0] || prev.username,
          profileImageUri: u.avatar || prev.profileImageUri,
        }));
      }
      setLoggedIn(true);
      showMessage(`Signed in successfully as ${trimmedEmail}`);
      syncWithBackend();
      return true;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const statusCode = err?.response?.status || 401;
      const backendErrorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error?.details ||
        (statusCode === 401
          ? 'Invalid email or password. Please check your credentials.'
          : statusCode === 404
          ? 'User not found. Please register first.'
          : 'Authentication failed. Please verify your email and password.');

      logApiCall(
        'POST',
        '/api/auth/login',
        statusCode,
        duration,
        { email: trimmedEmail },
        err?.response?.data || { error: backendErrorMessage }
      );

      // Explicitly reject: do NOT log in on error!
      setIsLoggedIn(false);
      localStorage.setItem('viora_auth', 'false');
      localStorage.removeItem('viora_access_token');
      showMessage(backendErrorMessage, true);
      return false;
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    name: string,
    username: string
  ): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase().replace(/^@/, '');
    const startTime = Date.now();

    try {
      // First request OTP if needed or verify
      const res = await authApi.verifyOtp({
        email: trimmedEmail,
        otp: '123456',
        fullName: trimmedName,
        username: trimmedUsername,
        deadline: 7,
        password,
      });
      const duration = Date.now() - startTime;
      logApiCall(
        'POST',
        '/api/auth/verify-otp',
        201,
        duration,
        { email: trimmedEmail, fullName: trimmedName, username: trimmedUsername },
        res
      );

      if (res?.data?.user) {
        const u = res.data.user;
        if (u.avatar) {
          registerServerAvatar(u.id, u.avatar);
          if (u.username) registerServerAvatar(u.username, u.avatar);
          if (u.email) registerServerAvatar(u.email, u.avatar);
          registerServerAvatar('me', u.avatar);
          registerServerAvatar('self', u.avatar);
        }
        setUserProfile((prev) => ({
          ...prev,
          id: u.id || prev.id,
          email: u.email || trimmedEmail,
          name: u.fullName || trimmedName,
          username: trimmedUsername,
          profileImageUri: u.avatar || prev.profileImageUri,
        }));
      }

      setLoggedIn(true);
      showMessage(`Account created on live server for ${trimmedEmail}`);
      syncWithBackend();
      return true;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const statusCode = err?.response?.status || 400;
      const backendErrorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error?.details ||
        'Registration failed. Please check your details and try again.';

      logApiCall(
        'POST',
        '/api/auth/verify-otp',
        statusCode,
        duration,
        { email: trimmedEmail, name: trimmedName, username: trimmedUsername },
        err?.response?.data || { error: backendErrorMessage }
      );

      setIsLoggedIn(false);
      localStorage.setItem('viora_auth', 'false');
      localStorage.removeItem('viora_access_token');
      showMessage(backendErrorMessage, true);
      return false;
    }
  };

  const clearApiLogs = () => {
    setApiLogs([]);
    showMessage('API logs cleared');
  };

  return (
    <VioraContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        navigationHistory,
        navigate,
        goBack,

        activeDetailTaskId,
        setActiveDetailTaskId,
        activeTeamId,
        setActiveTeamId,
        activeListId,
        setActiveListId,
        showQuickAdd,
        setShowQuickAdd,
        showQuickTaskModal,
        setShowQuickTaskModal,
        showVoiceAdd,
        setShowVoiceAdd,
        showApiInspector,
        setShowApiInspector,
        showVioraPass,
        setShowVioraPass,

        currentTime,
        currentDate,

        serverStatus,
        lastSyncTime,
        syncWithBackend,

        activeTodoistView,
        setActiveTodoistView,
        selectedProjectId,
        setSelectedProjectId,
        displayMode,
        setDisplayMode,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        quickSearchQuery,
        setQuickSearchQuery,
        cardTheme,
        setCardTheme,

        tasks,
        activeTasks,
        archivedTasks,
        completedTasks,
        completedCount,
        nextTask,
        subsequentTasks,
        unplannedCount,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        archiveTask,
        restoreTask,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        addComment,
        reorderTasks,

        teams,
        activeTeams,
        archivedTeams,
        users,
        lists,
        activeLists,
        archivedLists,
        addTeam,
        updateTeam,
        deleteTeam,
        archiveTeam,
        restoreTeam,
        addMemberToTeam,
        removeMemberFromTeam,
        addList,
        deleteList,
        archiveList,
        restoreList,

        userProfile,
        updateUserProfile,
        isLoggedIn,
        setLoggedIn,
        loginSuccess,
        loginWithEmail,
        registerWithEmail,
        logout,
        clearAllCacheAndReset,

        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        teamInvites,
        fetchTeamInvites,
        acceptTeamInvite,
        declineTeamInvite,
        pushToasts,
        triggerLivePush,
        removePushToast,
        registerFcmToken,

        calendarEvents,
        upcomingEvent,
        googleCalendarSynced,
        toggleGoogleCalendarSync,
        addCalendarEvent,
        weatherInfo,
        setWeatherInfo,
        weatherCity,
        setWeatherCity,

        apiLogs,
        logApiCall,
        clearApiLogs,

        toastMessage,
        showMessage,
        dismissToast,
      }}
    >
      {children}
    </VioraContext.Provider>
  );
}

export function useViora() {
  const context = useContext(VioraContext);
  if (!context) {
    throw new Error('useViora must be used within a VioraProvider');
  }
  return context;
}
