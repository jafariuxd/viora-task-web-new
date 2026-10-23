import { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Trash2,
  Folder,
  Layers,
  Archive,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { EmptyState } from '../components/EmptyState';

export function ArchivesScreen() {
  const {
    archivedTasks,
    archivedTeams,
    archivedLists,
    restoreTask,
    restoreTeam,
    restoreList,
    deleteTask,
    goBack,
  } = useViora();

  const [activeTab, setActiveTab] = useState<'tasks' | 'teams' | 'lists'>('tasks');

  return (
    <div className="min-h-screen bg-viora-bg text-white pb-24 md:pb-12 pt-4 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-2 mb-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold">Back</span>
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-white text-[28px] font-bold tracking-tight">Archives & Trash</h1>
        <p className="text-white/40 text-[14px]">
          Restore previously archived tasks, teams, or project lists
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'tasks'
              ? 'bg-viora-neonLime text-black shadow-md'
              : 'bg-white/10 hover:bg-white/15 text-white'
          }`}
        >
          Archived Tasks ({archivedTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'teams'
              ? 'bg-viora-neonLime text-black shadow-md'
              : 'bg-white/10 hover:bg-white/15 text-white'
          }`}
        >
          Archived Teams ({archivedTeams.length})
        </button>
        <button
          onClick={() => setActiveTab('lists')}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'lists'
              ? 'bg-viora-neonLime text-black shadow-md'
              : 'bg-white/10 hover:bg-white/15 text-white'
          }`}
        >
          Archived Lists ({archivedLists.length})
        </button>
      </div>

      {/* Content View */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {archivedTasks.length === 0 ? (
            <EmptyState
              icon={Archive}
              iconBadgeClass="bg-white/5 border-white/10 text-white/50"
              title="No archived tasks"
              description="Tasks you archive from your active workspace or completed list will appear here."
              primaryAction={{
                label: 'Return to Active Tasks',
                icon: ArrowLeft,
                onClick: goBack,
              }}
            />
          ) : (
            archivedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/5 border border-white/10 rounded-[24px] p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs text-white/40 uppercase font-bold">{task.client}</span>
                  <h3 className="text-white font-bold text-base">{task.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => restoreTask(task.id)}
                    className="h-9 px-4 rounded-full bg-viora-neonLime text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                    title="Permanently Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="space-y-3">
          {archivedTeams.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center text-white/40">
              No archived teams found.
            </div>
          ) : (
            archivedTeams.map((team) => (
              <div
                key={team.id}
                className="bg-white/5 border border-white/10 rounded-[24px] p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-viora-neonLime" />
                  <h3 className="text-white font-bold text-base">{team.name}</h3>
                </div>

                <button
                  onClick={() => restoreTeam(team.id)}
                  className="h-9 px-4 rounded-full bg-viora-neonLime text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore Team
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'lists' && (
        <div className="space-y-3">
          {archivedLists.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center text-white/40">
              No archived project lists found.
            </div>
          ) : (
            archivedLists.map((list) => (
              <div
                key={list.id}
                className="bg-white/5 border border-white/10 rounded-[24px] p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-viora-neonLime" />
                  <h3 className="text-white font-bold text-base">{list.name}</h3>
                </div>

                <button
                  onClick={() => restoreList(list.id)}
                  className="h-9 px-4 rounded-full bg-viora-neonLime text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore List
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
