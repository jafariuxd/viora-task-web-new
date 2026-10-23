import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, User, AtSign } from 'lucide-react';
import { useViora } from '../../context/VioraContext';
import { AuthLayout } from '../../components/auth/AuthLayout';

export function ProfileSetupScreen() {
  const { userProfile, updateUserProfile, navigate, goBack } = useViora();
  const [name, setName] = useState(userProfile.name);
  const [username, setUsername] = useState(userProfile.username);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    updateUserProfile({
      name: name.trim(),
      username: username.trim().toLowerCase(),
    });

    navigate('deadline_setup');
  };

  return (
    <AuthLayout badgeText="Profile Onboarding">
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

        {/* Main Content (matching PDF Page 14) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-auto py-4 space-y-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              Complete your profile
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm mt-2 leading-relaxed">
              Shape your workspace identity. Complete your profile to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-zinc-600 text-xs font-bold uppercase tracking-wider block mb-1.5 px-1">
                Full name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Mahdi Jafari"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-2xl pl-12 pr-4 py-3.5 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-600 text-xs font-bold uppercase tracking-wider block mb-1.5 px-1">
                Username
              </label>
              <div className="relative">
                <AtSign className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="mahdi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-2xl pl-12 pr-4 py-3.5 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-full bg-viora-neonLime text-black font-extrabold text-base hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(180,255,0,0.35)] mt-4"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>
        </motion.div>

        <div className="text-center text-zinc-400 text-xs pb-2">
          Step 1 of 2 · Workspace Identity
        </div>
      </div>
    </AuthLayout>
  );
}
