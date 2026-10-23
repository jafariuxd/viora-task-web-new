import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trash2, Globe, Activity, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { type ApiLog } from '../types';

export function ApiInspectorModal() {
  const { showApiInspector, setShowApiInspector, apiLogs, clearApiLogs } = useViora();
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);

  if (!showApiInspector) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={() => setShowApiInspector(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl bg-[#18181A] border border-white/15 rounded-[28px] shadow-2xl overflow-hidden flex flex-col h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1F1F23]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-viora-neonLime/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-viora-neonLime" />
            </div>
            <div>
              <h2 className="text-white text-[16px] font-bold tracking-tight flex items-center gap-2">
                Viora Network & API Inspector
                <span className="text-[11px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-mono">
                  {apiLogs.length} requests
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearApiLogs}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Clear Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowApiInspector(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Logs List */}
          <div className="w-1/2 border-r border-white/10 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {apiLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40 p-6 text-center">
                <Globe className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-medium">No API calls recorded yet</p>
                <p className="text-xs text-white/30 mt-1">
                  Interact with tasks, teams, and settings to see real-time requests.
                </p>
              </div>
            ) : (
              apiLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                const isSuccess = log.status >= 200 && log.status < 300;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-white/15 border-viora-neonLime'
                        : 'bg-white/5 hover:bg-white/10 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                            log.method === 'GET'
                              ? 'bg-blue-500/20 text-blue-400'
                              : log.method === 'POST'
                              ? 'bg-green-500/20 text-green-400'
                              : log.method === 'PATCH'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {log.method}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isSuccess
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/40 font-mono">
                        {log.durationMs}ms
                      </span>
                    </div>
                    <p className="text-white text-[13px] font-mono truncate">{log.url}</p>
                    <span className="text-white/30 text-[10px] mt-1 block">
                      {log.timestamp}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Log Detail Inspector */}
          <div className="w-1/2 p-4 overflow-y-auto custom-scrollbar bg-[#121214]">
            {selectedLog ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-white/60 text-[11px] font-mono uppercase tracking-wider mb-1">
                    Request Summary
                  </h3>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1 font-mono text-xs text-white/90">
                    <p>
                      <span className="text-white/40">URL:</span> {selectedLog.url}
                    </p>
                    <p>
                      <span className="text-white/40">Method:</span> {selectedLog.method}
                    </p>
                    <p>
                      <span className="text-white/40">Status:</span> {selectedLog.status} OK
                    </p>
                    <p>
                      <span className="text-white/40">Latency:</span> {selectedLog.durationMs} ms
                    </p>
                    <p>
                      <span className="text-white/40">Time:</span> {selectedLog.timestamp}
                    </p>
                  </div>
                </div>

                {selectedLog.requestBody && (
                  <div>
                    <h3 className="text-white/60 text-[11px] font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Request Payload
                    </h3>
                    <pre className="bg-black/60 rounded-xl p-3 border border-white/5 text-xs text-viora-neonLime font-mono overflow-x-auto">
                      {selectedLog.requestBody}
                    </pre>
                  </div>
                )}

                {selectedLog.responseBody && (
                  <div>
                    <h3 className="text-white/60 text-[11px] font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ArrowDownLeft className="w-3 h-3" /> Response Data
                    </h3>
                    <pre className="bg-black/60 rounded-xl p-3 border border-white/5 text-xs text-blue-300 font-mono overflow-x-auto">
                      {selectedLog.responseBody}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/30 text-xs font-mono">
                Select a request log on the left to inspect payload
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
