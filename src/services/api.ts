import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Default configuration based on Viora Backend Integration Spec
const DEFAULT_DIRECT_URL = 'http://45.195.250.77:3000/api';
const PROXY_URL = '/backend-api/api';

// Use proxy when in browser dev environment or fallback to direct
export const API_BASE_URL =
  typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? PROXY_URL
    : DEFAULT_DIRECT_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('viora_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables for managing simultaneous token refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Response Interceptor: Handle 401 Unauthorized with automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Ignore 401 on auth endpoints (login, otp, refresh) to avoid infinite loops
    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/verify-otp') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/request-otp');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem('viora_refresh_token');

      if (!refreshToken) {
        // No refresh token available, session is invalid
        localStorage.removeItem('viora_access_token');
        localStorage.removeItem('viora_refresh_token');
        localStorage.setItem('viora_auth', 'false');
        window.dispatchEvent(new Event('viora_auth_expired'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue parallel requests until refresh completes
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Make direct refresh call using independent axios instance to avoid interceptors loop
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );

        const newAccessToken =
          refreshRes.data?.data?.accessToken ||
          refreshRes.data?.data?.tokens?.accessToken ||
          refreshRes.data?.accessToken;

        const newRefreshToken =
          refreshRes.data?.data?.refreshToken ||
          refreshRes.data?.data?.tokens?.refreshToken ||
          refreshRes.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('viora_access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('viora_refresh_token', newRefreshToken);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          onRefreshed(newAccessToken);
          isRefreshing = false;

          return apiClient(originalRequest);
        } else {
          throw new Error('Invalid token structure returned from refresh endpoint');
        }
      } catch (refreshErr) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Clear expired credentials and notify app
        localStorage.removeItem('viora_access_token');
        localStorage.removeItem('viora_refresh_token');
        localStorage.setItem('viora_auth', 'false');
        window.dispatchEvent(new Event('viora_auth_expired'));

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// OpenAPI Types matching Viora Manager Service
// -------------------------------------------------------------
export interface UserResponseDto {
  id: string;
  email: string;
  fullName: string;
  username: string;
  deadline: number;
  avatar?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface TokensResponseDto {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  tokens: TokensResponseDto;
}

export interface UserReportResponseDto {
  userId: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  userDeadline?: string;
  remainingDays: number;
  teamSummary: {
    totalTeams: number;
  };
  listSummary: any[];
  taskSummary: any[];
}

export interface TaskDeadlineInfoDto {
  actualDeadline: string;
  remainingDays: number;
  source: 'task' | 'list' | 'team' | 'user';
}

export interface TaskSummaryDto {
  id: string;
  name: string;
  description?: string;
  deadlineInfo: TaskDeadlineInfoDto;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  listId?: string;
  listName?: string;
  teamId?: string;
  teamName?: string;
  tagNames?: string[];
  assigneesCount?: number;
  subtasksCount?: number;
  isArchived?: boolean;
  createdAt?: string;
}

export interface TaskResponseDto {
  id: string;
  name: string;
  description?: string;
  deadline?: string | null;
  deadlineInfo: TaskDeadlineInfoDto;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  listId?: string;
  list?: {
    id: string;
    name: string;
    teamId?: string;
  };
  team?: {
    id: string;
    name: string;
  } | null;
  users?: Array<{
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatar?: string;
  }>;
  tags?: Array<{
    id: string;
    name: string;
  }>;
  subtasks?: Array<{
    id: string;
    name: string;
    status: 'todo' | 'in-progress' | 'in-review' | 'done';
    createdAt?: string;
    updatedAt?: string;
  }>;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListResponseDto {
  id: string;
  name: string;
  description?: string;
  deadline?: string | null;
  deadlineInfo?: {
    actualDeadline: string;
    remainingDays: number;
    source: 'list' | 'team' | 'user';
  };
  teamId: string;
  team?: {
    id: string;
    name: string;
    description?: string;
  };
  users?: Array<{
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatar?: string;
  }>;
  tasksCount?: number;
  isArchived?: boolean;
  isPersonal?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamResponseDto {
  id: string;
  name: string;
  description?: string;
  deadlineAt?: string | null;
  remainingDays?: number | null;
  ownerId: string;
  owner?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatar?: string;
  };
  members?: Array<{
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatar?: string;
  }>;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// 1. Authentication Endpoints
// -------------------------------------------------------------
export const authApi = {
  requestOtp: async (email: string) => {
    const res = await apiClient.post<{ success: boolean; data: { email: string; expiresIn: number } }>(
      '/auth/request-otp',
      { email }
    );
    return res.data;
  },

  verifyOtp: async (payload: {
    email: string;
    otp: string;
    fullName: string;
    username: string;
    deadline: number;
    password: string;
    avatar?: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponseDto }>(
      '/auth/verify-otp',
      payload
    );
    const tokens = res.data?.data?.tokens;
    if (tokens?.accessToken) {
      localStorage.setItem('viora_access_token', tokens.accessToken);
    }
    if (tokens?.refreshToken) {
      localStorage.setItem('viora_refresh_token', tokens.refreshToken);
    }
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponseDto }>(
      '/auth/login',
      { email, password }
    );
    const tokens = res.data?.data?.tokens;
    if (tokens?.accessToken) {
      localStorage.setItem('viora_access_token', tokens.accessToken);
    }
    if (tokens?.refreshToken) {
      localStorage.setItem('viora_refresh_token', tokens.refreshToken);
    }
    return res.data;
  },

  refresh: async (refreshToken: string) => {
    const res = await apiClient.post<{ success: boolean; data: TokensResponseDto }>(
      '/auth/refresh',
      { refreshToken }
    );
    const accessToken = res.data?.data?.accessToken || (res.data as any)?.accessToken;
    const newRefreshToken = res.data?.data?.refreshToken || (res.data as any)?.refreshToken;
    if (accessToken) {
      localStorage.setItem('viora_access_token', accessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('viora_refresh_token', newRefreshToken);
    }
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('viora_access_token');
      localStorage.removeItem('viora_refresh_token');
      localStorage.setItem('viora_auth', 'false');
    }
  },

  checkAndRefreshToken: async () => {
    const refreshToken = localStorage.getItem('viora_refresh_token');
    if (!refreshToken) return false;

    const accessToken = localStorage.getItem('viora_access_token');
    if (accessToken) {
      try {
        const payloadBase64 = accessToken.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          const nowSeconds = Math.floor(Date.now() / 1000);
          // If token has more than 5 minutes remaining, no need to refresh yet
          if (payload.exp && payload.exp - nowSeconds > 300) {
            return true;
          }
        }
      } catch {
        // Fallthrough to refresh attempt
      }
    }

    try {
      const res = await authApi.refresh(refreshToken);
      return Boolean(res);
    } catch {
      return false;
    }
  },
};

// -------------------------------------------------------------
// 2. User & Profile Endpoints
// -------------------------------------------------------------
export const usersApi = {
  getReport: async () => {
    const res = await apiClient.get<{ success: boolean; data: UserReportResponseDto }>(
      '/users/me/report'
    );
    return res.data;
  },

  updateDeadline: async (days: number) => {
    const res = await apiClient.patch<{ success: boolean; data: UserReportResponseDto }>(
      '/users/me/deadline',
      { days }
    );
    return res.data;
  },

  updateMe: async (updates: { fullName?: string; avatar?: string; days?: number }) => {
    const res = await apiClient.patch<{ success: boolean; data: UserReportResponseDto }>(
      '/users/me',
      updates
    );
    return res.data;
  },

  search: async (query: string) => {
    const res = await apiClient.get<{ success: boolean; data: UserResponseDto[] }>('/users/search', {
      params: { q: query },
    });
    return res.data;
  },
};

// -------------------------------------------------------------
// 3. Tasks Endpoints
// -------------------------------------------------------------
export const tasksApi = {
  getAll: async (params?: {
    listId?: string;
    teamId?: string;
    myTasksOnly?: boolean;
    status?: string;
    tag?: string;
    tags?: string[];
    archived?: boolean;
    search?: string;
    deadlineAfter?: string;
    deadlineBefore?: string;
  }) => {
    const res = await apiClient.get<{ success: boolean; data: TaskSummaryDto[] | any }>('/tasks', {
      params,
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: TaskResponseDto }>(`/tasks/${id}`);
    return res.data;
  },

  create: async (task: {
    name: string;
    description?: string | null;
    deadlineDays?: number | null;
    listId?: string | null;
    status?: 'todo' | 'in-progress' | 'done' | string;
    tags?: string[] | null;
    usernames?: string[] | null;
    subtasks?: Array<{ name: string; status?: string }>;
  }) => {
    const res = await apiClient.post<{ success: boolean; data: { task: TaskResponseDto } }>(
      '/tasks',
      task
    );
    return res.data;
  },

  update: async (
    id: string,
    updates: {
      name?: string;
      description?: string | null;
      deadlineDays?: number | null;
      status?: 'todo' | 'in-progress' | 'done' | string;
      listId?: string | null;
      tagsToAdd?: string[] | null;
      tagsToRemove?: string[] | null;
      usernamesToAdd?: string[] | null;
      usernamesToRemove?: string[] | null;
      subtasksToAdd?: Array<{ name: string; status?: string }>;
      subtaskIdsToRemove?: string[];
    }
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: { task: TaskResponseDto } }>(
      `/tasks/${id}`,
      updates
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/tasks/${id}`);
    return res.data;
  },

  archive: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; message?: string }>(
      `/tasks/${id}/archive`
    );
    return res.data;
  },
};

// -------------------------------------------------------------
// 4. Subtasks Endpoints
// -------------------------------------------------------------
export const subtasksApi = {
  getById: async (subtaskId: string) => {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/subtasks/${subtaskId}`);
    return res.data;
  },

  updateStatus: async (subtaskId: string, status: 'todo' | 'in-progress' | 'in-review' | 'done') => {
    const res = await apiClient.patch<{ success: boolean; data: any }>(
      `/subtasks/${subtaskId}/status`,
      { status }
    );
    return res.data;
  },
};

// -------------------------------------------------------------
// 5. Lists Endpoints
// -------------------------------------------------------------
export const listsApi = {
  getAll: async (params?: {
    teamId?: string;
    myListsOnly?: boolean;
    archived?: boolean;
    search?: string;
    deadlineAfter?: string;
    deadlineBefore?: string;
  }) => {
    const res = await apiClient.get<{ success: boolean; data: any[] | any }>('/lists', {
      params,
    });
    return res.data;
  },

  getPersonal: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/lists/personal');
    return res.data;
  },

  updatePersonal: async (updates: { name?: string; description?: string }) => {
    const res = await apiClient.patch<{ success: boolean; data: any }>('/lists/personal', updates);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: ListResponseDto }>(`/lists/${id}`);
    return res.data;
  },

  create: async (listData: {
    name: string;
    description?: string;
    deadlineDays?: number;
    teamId: string;
    userNamesToAdd?: string[];
  }) => {
    const res = await apiClient.post<{ success: boolean; data: { list: ListResponseDto } }>(
      '/lists',
      listData
    );
    return res.data;
  },

  update: async (
    id: string,
    updates: {
      name?: string;
      description?: string;
      deadlineDays?: number | null;
      userNamesToAdd?: string[];
      userNamesToRemove?: string[];
    }
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: { list: ListResponseDto } }>(
      `/lists/${id}`,
      updates
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/lists/${id}`);
    return res.data;
  },

  archive: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; message?: string }>(
      `/lists/${id}/archive`
    );
    return res.data;
  },
};

// -------------------------------------------------------------
// 6. Teams Endpoints
// -------------------------------------------------------------
export const teamsApi = {
  getAll: async (params?: {
    ownerId?: string;
    memberId?: string;
    name?: string;
    isArchived?: boolean;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    perPage?: number;
  }) => {
    const res = await apiClient.get<{ success: boolean; data: { items: TeamResponseDto[]; total: number } }>(
      '/teams',
      { params }
    );
    return res.data;
  },

  getArchived: async (params?: { page?: number; perPage?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: { items: TeamResponseDto[]; total: number } }>(
      '/teams/archives',
      { params }
    );
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: TeamResponseDto }>(`/teams/${id}`);
    return res.data;
  },

  create: async (teamData: { name: string; description?: string; deadlineDays?: number }) => {
    const res = await apiClient.post<{ success: boolean; data: TeamResponseDto }>(
      '/teams',
      teamData
    );
    return res.data;
  },

  update: async (
    id: string,
    updates: {
      name?: string;
      description?: string;
      deadlineDays?: number | null;
      addUsernames?: string[];
      removeUsernames?: string[];
    }
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: TeamResponseDto }>(
      `/teams/${id}`,
      updates
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/teams/${id}`);
    return res.data;
  },

  archive: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; data: TeamResponseDto }>(
      `/teams/${id}/archive`
    );
    return res.data;
  },

  unarchive: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; data: TeamResponseDto }>(
      `/teams/${id}/unarchive`
    );
    return res.data;
  },

  getInvitations: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/teams/invitations');
    return res.data;
  },

  acceptInvitation: async (inviteId: string) => {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/teams/invitations/${inviteId}/accept`);
    return res.data;
  },

  declineInvitation: async (inviteId: string) => {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/teams/invitations/${inviteId}/decline`);
    return res.data;
  },
};

// -------------------------------------------------------------
// 7. Notifications & FCM Endpoints
// -------------------------------------------------------------
export const notificationsApi = {
  registerFcmToken: async (fcmToken: string) => {
    const res = await apiClient.post<{ success: boolean; message?: string }>('/notifications/fcm-token', {
      fcmToken,
      platform: 'web',
    });
    return res.data;
  },

  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/notifications');
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`);
    return res.data;
  },
};

// -------------------------------------------------------------
// 7. Sync API Endpoints (Offline First Synchronization)
// -------------------------------------------------------------
export const syncApi = {
  pull: async (lastSyncAt?: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        serverTimestamp: string;
        updatedData: { tasks: any[]; lists: any[]; teams: any[] };
        deletedIds: { tasks: string[]; lists: string[]; teams: string[] };
      };
    }>('/v1/sync', {
      params: lastSyncAt ? { lastSyncAt } : undefined,
    });
    return res.data;
  },

  push: async (mutations: { tasks?: any[]; lists?: any[]; teams?: any[] }) => {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        processedIds: string[];
        conflicts: any[];
      };
    }>('/v1/sync', { mutations });
    return res.data;
  },
};

// Helper: Ping server status
export async function testServerConnection(): Promise<boolean> {
  try {
    const res = await apiClient.get('/users/me/report', { timeout: 3500 });
    return res.status >= 200 && res.status < 300;
  } catch (e: any) {
    // If it's a 401, the server is live and responding
    if (e.response && (e.response.status === 401 || e.response.status === 200)) {
      return true;
    }
    return false;
  }
}
