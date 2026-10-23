import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Mic, CheckCircle2, Sparkles } from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { TaskStatus } from '../types';

export function VoiceTaskModal() {
  const { showVoiceAdd, setShowVoiceAdd, addTask, userProfile } = useViora();
  const [isRecording, setIsRecording] = useState(true);
  const [transcribedText, setTranscribedText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    if (!showVoiceAdd) return;

    const t1 = setTimeout(() => {
      setTranscribedText('Fix responsive spacing for task detail header...');
    }, 1000);

    const t2 = setTimeout(() => {
      setTranscribedText('Fix responsive spacing for task detail header and assign to Mohammad due in 2 days for Viora design.');
    }, 2200);

    const t3 = setTimeout(() => {
      setIsRecording(false);
      setIsParsing(true);
    }, 3500);

    const t4 = setTimeout(() => {
      setIsParsing(false);
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [showVoiceAdd]);

  if (!showVoiceAdd) return null;

  const handleConfirmTask = () => {
    addTask({
      title: 'Fix responsive spacing for task detail header',
      client: 'Viora Design',
      daysLeft: 2,
      status: TaskStatus.TODO,
      assigneePhotos: [userProfile?.username || 'mehran'],
      isUnplanned: false,
      description: 'Automatically transcribed from Viora Voice Intelligence engine.',
      tags: ['voice', 'ui', 'spacing'],
      dueDateText: '2026 Sep 12',
      folder: 'Viora Design',
      subtasks: [
        { id: 'vsub_1', title: 'Verify 5.dp horizontal/vertical card spacing', completed: false },
        { id: 'vsub_2', title: 'Check 72.dp status buttons alignment', completed: false },
      ],
    });
    setShowVoiceAdd(false);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4"
      onClick={() => setShowVoiceAdd(false)}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="w-full max-w-md bg-[#1C1C1E] border border-white/15 rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-viora-neonLime" />
            <span className="text-white text-sm font-semibold">Viora Voice AI</span>
          </div>
          <button
            onClick={() => setShowVoiceAdd(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Animated Mic & Waves */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative">
            {isRecording && (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-viora-neonLime"
              />
            )}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center relative z-10 transition-all ${
                isRecording ? 'bg-viora-neonLime text-black' : 'bg-white/10 text-white'
              }`}
            >
              <Mic className="w-9 h-9" />
            </div>
          </div>

          <p className="text-white font-bold text-lg mt-4">
            {isRecording
              ? 'Listening...'
              : isParsing
              ? 'Parsing entities with AI...'
              : 'Task Detected!'}
          </p>
        </div>

        {/* Transcribed text bubble */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 my-4 text-left">
          <p className="text-white/40 text-[11px] uppercase font-bold tracking-wider mb-1">
            Live Speech-to-Text
          </p>
          <p className="text-white text-[14px] leading-relaxed italic">
            "{transcribedText || 'Speak your task naturally...'}"
          </p>
        </div>

        {!isRecording && !isParsing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-viora-neonLime/10 border border-viora-neonLime/30 rounded-2xl p-3 text-left mb-6"
          >
            <div className="flex items-center gap-2 text-viora-neonLime font-bold text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Structured Breakdown
            </div>
            <p className="text-white text-xs">
              <strong className="text-white/60">Title:</strong> Fix responsive spacing for task detail header
              <br />
              <strong className="text-white/60">Team:</strong> Viora Design •{' '}
              <strong className="text-white/60">Assignee:</strong> @mohammad •{' '}
              <strong className="text-white/60">Deadline:</strong> 2 days
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsRecording(true);
              setTranscribedText('');
            }}
            className="flex-1 h-12 rounded-full bg-white/10 text-white font-semibold text-sm hover:bg-white/15"
          >
            Try Again
          </button>
          <button
            onClick={handleConfirmTask}
            disabled={isRecording || isParsing}
            className="flex-1 h-12 rounded-full bg-viora-neonLime disabled:opacity-40 text-black font-bold text-sm shadow-md"
          >
            Add Task
          </button>
        </div>
      </motion.div>
    </div>
  );
}
