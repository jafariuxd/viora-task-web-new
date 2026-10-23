import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useViora } from '../../context/VioraContext';
import { AuthLayout } from '../../components/auth/AuthLayout';

export function WelcomeScreen() {
  const { navigate } = useViora();

  return (
    <AuthLayout badgeText="Welcome">
      <div className="flex flex-col justify-between h-full min-h-[420px] space-y-6">
        {/* Brand header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-viora-neonLime flex items-center justify-center text-black font-black text-base shadow-sm">
            V
          </div>
          <span className="text-zinc-950 font-black text-xl tracking-tight">VIORA</span>
        </div>

        {/* Center Hero Intro (Decluttered, matching PDF page 34) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-auto py-2 text-left space-y-3"
        >
          <h2 className="tracking-tight leading-[1.12]">
            <span className="block text-[26px] sm:text-[29px] font-normal text-zinc-900">
              Welcome 👋 to
            </span>
            <span className="block text-[34px] sm:text-[38px] font-semibold text-black tracking-tight mt-1">
              Viora Tasks
            </span>
          </h2>

          <p className="text-zinc-500 text-sm leading-relaxed">
            Organize tasks, coordinate team spaces, and master your cadence with effortless clarity.
          </p>
        </motion.div>

        {/* Bottom CTA */}
        <div className="pt-2">
          <button
            id="btn-welcome-get-started"
            onClick={() => navigate('login')}
            className="w-full h-14 rounded-full bg-viora-neonLime text-black font-extrabold text-base hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(180,255,0,0.35)]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
