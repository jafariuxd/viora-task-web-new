import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Flashlight,
  CheckCircle2,
  Scan,
  Users,
  Sparkles,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { UserAvatar } from '../components/UserAvatar';

export function ScannerCameraOverlay() {
  const {
    teams,
    activeTeamId,
    addMemberToTeam,
    goBack,
    showMessage,
  } = useViora();

  const [flashOn, setFlashOn] = useState(false);
  const [scannedUser, setScannedUser] = useState<{
    name: string;
    username: string;
  } | null>(null);

  const targetTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

  const handleSimulateScan = (username: string, name: string) => {
    setScannedUser({ name, username });
  };

  const handleRecruit = () => {
    if (scannedUser && targetTeam) {
      addMemberToTeam(targetTeam.id, scannedUser.username);
      showMessage(`@${scannedUser.username} added to ${targetTeam.name} 🎉`);
      goBack();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black flex flex-col justify-between p-6 select-none">
      {/* Top Controls */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={goBack}
          className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <Scan className="w-4 h-4 text-viora-neonLime" />
          <span className="text-white text-xs font-bold">Viora QR Scanner</span>
        </div>

        <button
          onClick={() => setFlashOn(!flashOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            flashOn ? 'bg-viora-neonLime text-black' : 'bg-white/15 text-white'
          }`}
        >
          <Flashlight className="w-5 h-5" />
        </button>
      </div>

      {/* Center Viewfinder */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Animated Viewfinder Box */}
        <div className="w-72 h-72 rounded-[36px] border-2 border-viora-neonLime/60 relative overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(180,255,0,0.2)]">
          {/* Laser Scanning Line */}
          <motion.div
            animate={{ y: [-130, 130, -130] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="w-full h-1 bg-viora-neonLime shadow-[0_0_15px_#B4FF00] absolute"
          />

          {/* Corner Markers */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-viora-neonLime rounded-tl-xl" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-viora-neonLime rounded-tr-xl" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-viora-neonLime rounded-bl-xl" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-viora-neonLime rounded-br-xl" />

          <p className="text-white/60 text-xs font-mono tracking-wider absolute bottom-6 text-center px-4">
            Align Viora Pass QR inside frame
          </p>
        </div>

        {/* Username Quick Input / Scanner Detection */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = (e.currentTarget.elements.namedItem('customUsername') as HTMLInputElement)?.value.trim();
              if (val) {
                const clean = val.replace(/^@/, '');
                handleSimulateScan(clean, clean.charAt(0).toUpperCase() + clean.slice(1));
              }
            }}
            className="flex items-center gap-2 w-full"
          >
            <input
              name="customUsername"
              type="text"
              placeholder="Enter @username to recruit..."
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-viora-neonLime"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-full bg-viora-neonLime text-black text-xs font-bold shrink-0 hover:opacity-90"
            >
              Scan
            </button>
          </form>
        </div>
      </div>

      {/* Target Team Banner at bottom */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-viora-neonLime" />
          <div>
            <span className="text-white/50 text-[11px] uppercase font-bold block">
              Recruiting For Team
            </span>
            <span className="text-white font-bold text-sm">{targetTeam.name}</span>
          </div>
        </div>
      </div>

      {/* Scanned Result Modal */}
      <AnimatePresence>
        {scannedUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setScannedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#1C1C1E] border border-viora-neonLime/40 rounded-[32px] p-6 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-viora-neonLime/10 text-viora-neonLime flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <h2 className="text-white text-xl font-bold mb-1">Viora Pass Detected!</h2>
              <p className="text-white/50 text-xs mb-6">
                Verified member profile ready to join workspace
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 mb-6 text-left">
                <UserAvatar userId={scannedUser.username} size={48} />
                <div>
                  <h3 className="text-white font-bold text-base">{scannedUser.name}</h3>
                  <p className="text-viora-neonLime text-xs font-mono">@{scannedUser.username}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleRecruit}
                  className="w-full h-14 rounded-full bg-viora-neonLime text-black font-bold text-base hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Add to {targetTeam.name}
                </button>
                <button
                  onClick={() => setScannedUser(null)}
                  className="w-full h-12 rounded-full bg-white/10 text-white font-semibold text-xs hover:bg-white/15"
                >
                  Scan Another
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
