import { idbService, type PendingMutation } from './idbService';
import {
  tasksApi,
  subtasksApi,
  teamsApi,
  listsApi,
} from './api';
import type { Task } from '../types';

export type SyncStatus = 'synced' | 'syncing' | 'offline';

export interface SyncEngineState {
  status: SyncStatus;
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  activeMutations: PendingMutation[];
}

type SyncListener = (state: SyncEngineState) => void;

class SyncEngine {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private status: SyncStatus = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced';
  private pendingCount: number = 0;
  private lastSyncTime: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private isProcessing: boolean = false;
  private activeMutations: PendingMutation[] = [];
  private onDataRefreshedCallback?: () => Promise<void>;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      // Initial check on boot
      this.refreshPendingCount().then(() => {
        if (this.isOnline && this.pendingCount > 0) {
          this.processQueue();
        }
      });
    }
  }

  public registerDataRefreshCallback(callback: () => Promise<void>) {
    this.onDataRefreshedCallback = callback;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Immediately inform subscriber of current state
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SyncEngineState {
    return {
      status: this.status,
      isOnline: this.isOnline,
      pendingCount: this.pendingCount,
      lastSyncTime: this.lastSyncTime,
      activeMutations: this.activeMutations,
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error('Error in sync engine listener:', e);
      }
    });
  }

  private handleOnline = () => {
    console.log('[SyncEngine] Device went ONLINE. Processing offline queue...');
    this.isOnline = true;
    this.status = 'syncing';
    this.notify();

    this.processQueue();
  };

  private handleOffline = () => {
    console.log('[SyncEngine] Device went OFFLINE. Operations will be queued.');
    this.isOnline = false;
    this.status = 'offline';
    this.notify();
  };

  public async refreshPendingCount(): Promise<number> {
    const pending = await idbService.getPendingMutations();
    this.pendingCount = pending.length;
    this.activeMutations = pending;

    if (!this.isOnline) {
      this.status = 'offline';
    } else if (this.isProcessing) {
      this.status = 'syncing';
    } else {
      this.status = pending.length === 0 ? 'synced' : 'syncing';
    }

    this.notify();
    return pending.length;
  }

  /**
   * Enqueues an offline mutation and triggers queue processing if online.
   */
  public async enqueue(
    type: PendingMutation['type'],
    payload: any
  ): Promise<PendingMutation> {
    const mutation: PendingMutation = {
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await idbService.enqueueMutation(mutation);
    await this.refreshPendingCount();

    if (this.isOnline && !this.isProcessing) {
      this.processQueue();
    }

    return mutation;
  }

  /**
   * Processes all pending mutations in FIFO order.
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline) return;

    const pending = await idbService.getPendingMutations();
    if (pending.length === 0) {
      this.status = 'synced';
      this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.notify();
      return;
    }

    this.isProcessing = true;
    this.status = 'syncing';
    this.notify();

    for (const mutation of pending) {
      if (!this.isOnline) break;

      try {
        await this.executeMutation(mutation);
        await idbService.removeMutation(mutation.id);
      } catch (err: any) {
        console.warn(`[SyncEngine] Mutation ${mutation.id} (${mutation.type}) failed:`, err);
        const nextRetry = mutation.retryCount + 1;
        await idbService.updateMutationRetry(mutation.id, nextRetry, err?.message || 'Network error');

        // If network error occurred, suspend queue processing
        if (!navigator.onLine || err?.message?.includes('NetworkError') || err?.message?.includes('Failed to fetch')) {
          this.isOnline = false;
          this.status = 'offline';
          break;
        }

        // If permanent error (e.g., 404 or invalid payload after 5 attempts), drop item
        if (nextRetry >= 5) {
          console.error(`[SyncEngine] Dropping mutation ${mutation.id} after 5 failed attempts.`);
          await idbService.removeMutation(mutation.id);
        }
      }
    }

    this.isProcessing = false;
    await this.refreshPendingCount();

    if (this.isOnline && this.pendingCount === 0) {
      this.status = 'synced';
      this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Refresh background remote data if callback attached
      if (this.onDataRefreshedCallback) {
        try {
          await this.onDataRefreshedCallback();
        } catch (e) {
          console.warn('Data refresh post-sync failed silently:', e);
        }
      }
    }

    this.notify();
  }

  /**
   * Replays a mutation payload against backend REST endpoints.
   */
  private async executeMutation(mutation: PendingMutation): Promise<any> {
    const { type, payload } = mutation;

    switch (type) {
      case 'CREATE_TASK': {
        return await tasksApi.create(payload);
      }
      case 'UPDATE_TASK': {
        const { id, ...data } = payload;
        return await tasksApi.update(id, data);
      }
      case 'DELETE_TASK': {
        return await tasksApi.delete(payload.id);
      }
      case 'TOGGLE_SUBTASK': {
        return await subtasksApi.updateStatus(payload.subtaskId, payload.status);
      }
      case 'ACCEPT_INVITE': {
        return await teamsApi.acceptInvitation(payload.inviteId);
      }
      case 'DECLINE_INVITE': {
        return await teamsApi.declineInvitation(payload.inviteId);
      }
      case 'CREATE_TEAM': {
        return await teamsApi.create(payload);
      }
      case 'CREATE_LIST': {
        return await listsApi.create(payload);
      }
      default:
        console.warn(`[SyncEngine] Unknown mutation type: ${type}`);
        return null;
    }
  }

  /**
   * Conflict Resolution Strategy: Last-Write-Wins (LWW)
   * Merges incoming server tasks with local optimistic tasks based on timestamp.
   */
  public resolveLastWriteWins(localTasks: Task[], serverTasks: Task[]): Task[] {
    const taskMap = new Map<string, Task>();

    localTasks.forEach((t) => taskMap.set(t.id, t));

    serverTasks.forEach((serverTask) => {
      const localTask = taskMap.get(serverTask.id);

      if (!localTask) {
        taskMap.set(serverTask.id, serverTask);
      } else {
        const localTime = localTask.createdAtMillis || 0;
        const serverTime = serverTask.createdAtMillis || 0;

        if (serverTime >= localTime) {
          taskMap.set(serverTask.id, {
            ...serverTask,
          });
        }
      }
    });

    return Array.from(taskMap.values());
  }
}

export const syncEngine = new SyncEngine();
