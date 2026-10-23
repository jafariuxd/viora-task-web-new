import { notificationsApi } from './api';

export const VAPID_KEY = 'BMGKoik6YTDslBa63oDts3J7QO3N_n5pL8XUCp-b7SUNFQ8EMdnD08iTvUwG68K3s6pAA7EWstZMeGxKRtEQajU';

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  type?: 'INVITE' | 'TASK_ASSIGNED' | 'REMINDER' | 'DEADLINE' | 'GENERAL';
  data?: Record<string, any>;
  timestamp: string;
}

type PushListener = (payload: PushNotificationPayload) => void;

class FcmService {
  private listeners: PushListener[] = [];
  private token: string | null = null;
  private initialized = false;

  public async initAndRegister(): Promise<string | null> {
    if (this.initialized && this.token) {
      return this.token;
    }

    try {
      // 1. Request Browser Notification permission if supported
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission().catch(() => {});
        }
      }

      // 2. Obtain FCM Device Token (or generate persistent local Web FCM Token)
      let savedToken = localStorage.getItem('viora_fcm_token');
      if (!savedToken) {
        savedToken = 'fcm_web_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('viora_fcm_token', savedToken);
      }
      this.token = savedToken;

      // 3. Register token with backend service
      const auth = localStorage.getItem('viora_auth');
      if (auth === 'true') {
        await notificationsApi.registerFcmToken(this.token).catch((err) => {
          console.warn('[FCM] Token sync with backend fallback:', err);
        });
      }

      this.initialized = true;
      return this.token;
    } catch (err) {
      console.error('[FCM] Initialization failed:', err);
      return null;
    }
  }

  public subscribeToPushes(listener: PushListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public emitPush(payload: Omit<PushNotificationPayload, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
    const fullPayload: PushNotificationPayload = {
      id: payload.id || 'push_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: payload.title,
      body: payload.body,
      type: payload.type || 'GENERAL',
      data: payload.data || {},
      timestamp: payload.timestamp || new Date().toISOString(),
    };

    // Show native browser notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(fullPayload.title, {
          body: fullPayload.body,
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback to in-app toast
      }
    }

    // Emit to internal active listeners
    this.listeners.forEach((listener) => {
      try {
        listener(fullPayload);
      } catch (err) {
        console.error('[FCM] Error in push listener:', err);
      }
    });
  }

  public getToken(): string | null {
    return this.token || localStorage.getItem('viora_fcm_token');
  }
}

export const fcmService = new FcmService();
