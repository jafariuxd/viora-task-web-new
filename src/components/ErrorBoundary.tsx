import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Viora ErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem('viora_tasks');
      localStorage.removeItem('viora_teams');
      localStorage.removeItem('viora_lists');
      localStorage.removeItem('viora_notifications');
      localStorage.removeItem('viora_events');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-[24px] bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            مشکلی در اجرای برنامه رخ داد
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
            برنامه ویورا با یک خطای غیرمنتظره مواجه شد. می‌توانید با بارگذاری مجدد یا بازنشانی کش محلی مشکل را برطرف کنید.
          </p>

          {this.state.error?.message && (
            <div className="max-w-md w-full bg-[#121214] border border-white/10 rounded-[18px] p-3 mb-6 text-xs font-mono text-zinc-400 text-left overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="flex-1 py-3 px-4 rounded-[18px] bg-[#B4FF00] text-black font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              بارگذاری مجدد
            </button>
            <button
              onClick={this.handleResetCache}
              className="flex-1 py-3 px-4 rounded-[18px] bg-[#1C1C1E] border border-white/10 text-zinc-300 font-medium text-sm hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              پاکسازی کش
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
