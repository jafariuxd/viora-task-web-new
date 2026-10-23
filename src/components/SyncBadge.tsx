import React, { useState, useEffect } from 'react';
import { syncEngine, type SyncEngineState } from '../services/syncEngine';

export const SyncBadge: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncEngineState>(syncEngine.getState());
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((newState) => {
      setSyncState(newState);
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = () => {
    syncEngine.processQueue();
  };

  const getStatusBadge = () => {
    if (!syncState.isOnline) {
      return (
        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-900/50 transition-all cursor-pointer"
          title="Offline Mode - Click to view queued actions"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Offline ({syncState.pendingCount})</span>
        </button>
      );
    }

    if (syncState.status === 'syncing') {
      return (
        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-950/40 border border-[#B4FF00]/40 text-[#B4FF00] text-xs font-medium hover:bg-lime-900/50 transition-all cursor-pointer"
          title="Syncing changes with server"
        >
          <svg className="w-3 h-3 animate-spin text-[#B4FF00]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Syncing {syncState.pendingCount ? `(${syncState.pendingCount})` : ''}</span>
        </button>
      );
    }

    // Synced State
    return (
      <button
        onClick={() => setShowDrawer(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-xs font-medium hover:border-zinc-700 hover:text-zinc-200 transition-all cursor-pointer"
        title="All changes synced with server"
      >
        <span className="w-2 h-2 rounded-full bg-[#B4FF00]" />
        <span>Synced</span>
      </button>
    );
  };

  return (
    <>
      {getStatusBadge()}

      {/* Sync Status Bottom Sheet / Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-t-[28px] sm:rounded-[28px] p-6 text-white shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    !syncState.isOnline
                      ? 'bg-red-500 animate-pulse'
                      : syncState.status === 'syncing'
                      ? 'bg-[#B4FF00] animate-ping'
                      : 'bg-[#B4FF00]'
                  }`}
                />
                <h3 className="font-semibold text-lg text-white">Sync Status & Queue</h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                <span className="text-sm text-zinc-400">Connection Status</span>
                <span
                  className={`text-sm font-semibold ${
                    syncState.isOnline ? 'text-[#B4FF00]' : 'text-red-400'
                  }`}
                >
                  {syncState.isOnline ? 'Online (Connected)' : 'Offline (No Connection)'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                <span className="text-sm text-zinc-400">Pending Actions Queue</span>
                <span className="text-sm font-semibold text-white">
                  {syncState.pendingCount} queued
                </span>
              </div>

              {syncState.lastSyncTime && (
                <div className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                  <span className="text-sm text-zinc-400">Last Sync</span>
                  <span className="text-sm font-medium text-zinc-300">
                    {syncState.lastSyncTime}
                  </span>
                </div>
              )}

              {/* List of pending queued mutations */}
              {syncState.activeMutations.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Queued Mutations
                  </p>
                  {syncState.activeMutations.map((mut) => (
                    <div
                      key={mut.id}
                      className="flex items-center justify-between p-2.5 bg-zinc-900 rounded-xl border border-zinc-800/50 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#B4FF00]">
                          {mut.type}
                        </span>
                        <p className="text-zinc-400 truncate max-w-[200px]">
                          {mut.payload?.title || mut.payload?.id || 'Action'}
                        </p>
                      </div>
                      <span className="text-zinc-500 font-mono text-[10px]">
                        {new Date(mut.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={handleManualSync}
                disabled={!syncState.isOnline || syncState.status === 'syncing'}
                className="flex-1 py-3 bg-[#B4FF00] hover:bg-[#a1e600] disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold rounded-2xl transition-all text-sm cursor-pointer"
              >
                {syncState.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={() => setShowDrawer(false)}
                className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium rounded-2xl transition-all text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
