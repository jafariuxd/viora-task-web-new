import { motion } from 'motion/react';
import {
  ArrowLeft,
  Sparkles,
  Target,
  CheckCircle2,
  Lightbulb,
  Quote,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskStatus } from '../types';

export function DailyBriefScreen() {
  const {
    tasks,
    calendarEvents,
    userProfile,
    setActiveDetailTaskId,
    goBack,
    showMessage,
  } = useViora();

  const activeTasks = tasks.filter((t) => !t.isArchived && t.status !== TaskStatus.DONE);
  const urgentTasks = activeTasks.filter((t) => t.daysLeft <= 2);
  const completedTasksCount = tasks.filter((t) => t.status === TaskStatus.DONE).length;

  const focusScore = Math.min(100, Math.max(70, 85 + completedTasksCount * 2 - urgentTasks.length * 5));

  const handleFinishBriefing = () => {
    showMessage('Daily brief complete. You are ready to crush your goals today! 🚀');
    goBack();
  };

  return (
    <div className="min-h-screen bg-viora-bg text-white pb-24 md:pb-12 pt-4 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Top Bar */}
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

        <div className="flex items-center gap-2 text-viora-neonLime font-bold text-xs bg-white/5 border border-viora-neonLime/30 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Viora AI Intelligence</span>
        </div>
      </div>

      {/* Greeting & Focus Score Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] p-6 text-black mb-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold text-black/50 uppercase tracking-wider block mb-1">
              Morning Productivity Brief
            </span>
            <h1 className="text-black text-[28px] font-black tracking-tight leading-tight">
              Good morning, {userProfile.name ? userProfile.name.split(' ')[0] : 'there'}!
            </h1>
            <p className="text-black/70 text-sm mt-1 max-w-md leading-relaxed">
              You have <strong className="text-black font-bold">{urgentTasks.length} urgent tasks</strong> and{' '}
              <strong className="text-black font-bold">{calendarEvents.length} meetings</strong> on your radar today.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/5 rounded-[22px] p-4 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-black text-viora-neonLime flex items-center justify-center font-extrabold text-xl shadow-md">
              {focusScore}
            </div>
            <div>
              <span className="text-black text-xs font-bold block">Daily Focus Score</span>
              <span className="text-black/50 text-[11px] font-medium">Optimal Work State</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Focus Tasks */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-white text-[17px] font-bold tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-viora-neonLime" />
            Key Focus Deliverables
          </h2>
          <span className="text-white/40 text-xs">Execute these first</span>
        </div>

        {urgentTasks.length === 0 ? (
          <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 text-center">
            <p className="text-zinc-400 text-xs">No urgent deadlines pending. All clear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentTasks.slice(0, 2).map((task) => (
              <div
                key={task.id}
                onClick={() => setActiveDetailTaskId(task.id)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[24px] p-4 cursor-pointer transition-all flex flex-col justify-between h-[130px]"
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-viora-neonLime font-bold uppercase tracking-wider">
                      {task.client}
                    </span>
                    <span className="text-[11px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full">
                      {task.daysLeft}d left
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-sm line-clamp-2">{task.title}</h3>
                </div>
                <span className="text-white/40 text-[11px]">Due: {task.dueDateText}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Mindset & Tip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Mindset Quote */}
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-viora-neonLime text-xs font-bold mb-3">
            <Quote className="w-4 h-4" />
            <span>Daily Mindset</span>
          </div>
          <p className="text-white/90 text-sm italic leading-relaxed">
            "Clarity precedes mastery. Focus relentlessly on the single highest-leverage task before checking communications."
          </p>
          <span className="text-white/40 text-xs mt-3 block">— Viora Philosophy</span>
        </div>

        {/* Productivity Insight */}
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-viora-neonLime text-xs font-bold mb-3">
            <Lightbulb className="w-4 h-4" />
            <span>Time-Blocking Insight</span>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            Schedule a dedicated 90-minute deep focus block between 10:00 AM and 11:30 AM before your next sync meeting.
          </p>
          <span className="text-white/40 text-xs mt-3 block">Energy peak window detected</span>
        </div>
      </div>

      {/* Complete Briefing Button */}
      <button
        onClick={handleFinishBriefing}
        className="w-full h-14 rounded-full bg-viora-neonLime text-black font-bold text-[16px] hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl"
      >
        <CheckCircle2 className="w-5 h-5" />
        Let's Get to Work
      </button>
    </div>
  );
}
