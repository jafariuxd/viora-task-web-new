import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Sparkles, Clock } from 'lucide-react';
import { useViora } from '../../context/VioraContext';
import { AuthLayout } from '../../components/auth/AuthLayout';

export function DeadlineSetupScreen() {
  const { userProfile, updateUserProfile, navigate, goBack, loginSuccess } = useViora();
  const [selectedDays, setSelectedDays] = useState(
    userProfile.stats.defaultDeadlineDays || 3
  );

  const handleFinish = () => {
    updateUserProfile({
      stats: {
        ...userProfile.stats,
        defaultDeadlineDays: selectedDays,
      },
    });

    loginSuccess();
    navigate('home');
  };

  const deadlineOptions = [
    { days: 1, label: '1 Day', desc: 'Fast turnaround, immediate execution' },
    { days: 2, label: '2 Days', desc: 'Balanced sprints and iterations' },
    { days: 3, label: '3 Days', desc: 'Standard production cadence' },
    { days: 7, label: '7 Days', desc: 'Weekly milestones & deep work' },
  ];

  return (
    <AuthLayout badgeText="Task Preferences">
      <div className="flex flex-col justify-between h-full space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content (matching PDF Page 12 & 13) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-auto py-2 space-y-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              Choose default deadline
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm mt-2 leading-relaxed">
              We assign this deadline to your unscheduled tasks to ensure none are missed.
            </p>
          </div>

          <div className="space-y-2.5">
            {deadlineOptions.map((opt) => {
              const isSelected = selectedDays === opt.days;
              return (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setSelectedDays(opt.days)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-viora-neonLime/15 border-viora-neonLime text-zinc-950 shadow-sm ring-1 ring-viora-neonLime'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-viora-neonLime text-black font-black'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-950">{opt.label}</div>
                      <div className="text-xs text-zinc-500">{opt.desc}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-viora-neonLime text-black flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full h-14 rounded-full bg-viora-neonLime text-black font-extrabold text-base hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(180,255,0,0.35)] mt-4"
          >
            <Sparkles className="w-5 h-5" />
            <span>Let's Go!</span>
          </button>
        </motion.div>

        <div className="text-center text-zinc-400 text-xs pb-2">
          Step 2 of 2 · Ready to start
        </div>
      </div>
    </AuthLayout>
  );
}
