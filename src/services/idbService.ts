/**
 * Viora IndexedDB Storage Service
 * Handles persistent offline caching and persistent offline mutation queueing.
 */

export interface PendingMutation {
  id: string;
  type: 
    | 'CREATE_TASK' 
    | 'UPDATE_TASK' 
    | 'DELETE_TASK' 
    | 'TOGGLE_SUBTASK' 
    | 'ADD_SUBTASK' 
    | 'DELETE_SUBTASK' 
    | 'ACCEPT_INVITE' 
    | 'DECLINE_INVITE'
    | 'CREATE_TEAM'
    | 'CREATE_LIST';
  payload: any;
  timestamp: number; // UTC timestamp for Last-Write-Wins
  retryCount: number;
  lastError?: string;
}

const DB_NAME = 'viora_app_db_v1';
const DB_VERSION = 1;
const STORE_CACHE = 'viora_cache';
const STORE_QUEUE = 'viora_offline_queue';

class IDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline cached entities (tasks, teams, lists, user profile, notifications, invites)
        if (!db.objectStoreNames.contains(STORE_CACHE)) {
          db.createObjectStore(STORE_CACHE, { keyPath: 'key' });
        }

        // Store for pending mutations queue
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to open Viora IndexedDB:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Reads a cached item from IndexedDB.
   */
  async getCache<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_CACHE, 'readonly');
        const store = transaction.objectStore(STORE_CACHE);
        const request = store.get(key);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.data as T);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          console.warn(`Error reading IDB cache key: ${key}`, request.error);
          resolve(null);
        };
      });
    } catch (e) {
      console.warn('IDB getCache failed fallback:', e);
      return null;
    }
  }

  /**
   * Saves or updates a cached item in IndexedDB.
   */
  async setCache<T>(key: string, data: T): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_CACHE, 'readwrite');
        const store = transaction.objectStore(STORE_CACHE);
        const request = store.put({ key, data, updatedAt: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('IDB setCache failed:', e);
    }
  }

  /**
   * Enqueues a new pending mutation to the offline queue.
   */
  async enqueueMutation(mutation: PendingMutation): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_QUEUE, 'readwrite');
        const store = transaction.objectStore(STORE_QUEUE);
        const request = store.put(mutation);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to enqueue mutation in IDB:', e);
    }
  }

  /**
   * Retrieves all pending mutations ordered by timestamp (FIFO).
   */
  async getPendingMutations(): Promise<PendingMutation[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_QUEUE, 'readonly');
        const store = transaction.objectStore(STORE_QUEUE);
        const request = store.getAll();

        request.onsuccess = () => {
          const list = (request.result || []) as PendingMutation[];
          list.sort((a, b) => a.timestamp - b.timestamp);
          resolve(list);
        };

        request.onerror = () => {
          console.warn('Error reading pending mutations:', request.error);
          resolve([]);
        };
      });
    } catch (e) {
      return [];
    }
  }

  /**
   * Removes a successfully processed mutation from the queue.
   */
  async removeMutation(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_QUEUE, 'readwrite');
        const store = transaction.objectStore(STORE_QUEUE);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Failed to remove mutation from IDB:', e);
    }
  }

  /**
   * Updates error or retry count for a failing mutation.
   */
  async updateMutationRetry(id: string, retryCount: number, error?: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORE_QUEUE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        if (getReq.result) {
          const updated = {
            ...getReq.result,
            retryCount,
            lastError: error || getReq.result.lastError,
          };
          store.put(updated);
        }
      };
    } catch (e) {
      console.warn('Failed to update mutation retry in IDB:', e);
    }
  }

  /**
   * Clears all pending mutations (e.g., on logout or manual flush reset).
   */
  async clearQueue(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_QUEUE, 'readwrite');
        const store = transaction.objectStore(STORE_QUEUE);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Failed to clear IDB queue:', e);
    }
  }
}

export const idbService = new IDBService();
