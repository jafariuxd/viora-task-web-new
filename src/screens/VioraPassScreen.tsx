import { useMemo } from 'react';
import { motion } from 'motion/react';
import { X, QrCode, ScanLine, Sparkles, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useViora } from '../context/VioraContext';
import { UserAvatar } from '../components/UserAvatar';

export function VioraPassScreen() {
  const {
    showVioraPass,
    setShowVioraPass,
    userProfile,
    navigate,
    showMessage,
  } = useViora();

  const qrPayload = useMemo(() => {
    return JSON.stringify({
      type: 'VIORA_PASS',
      version: '1.0',
      username: userProfile.username,
      name: userProfile.name,
      id: userProfile.id,
    });
  }, [userProfile.username, userProfile.name, userProfile.id]);

  if (!showVioraPass) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://viora.app/u/${userProfile.username}`);
    showMessage('Profile link copied to clipboard');
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      onClick={() => setShowVioraPass(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="w-full max-w-sm bg-[#18181A] border border-white/20 rounded-[36px] p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic accent glow in background */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-viora-neonLime/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Actions */}
        <div className="w-full flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-viora-neonLime" />
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              Viora Digital Pass
            </span>
          </div>

          <button
            onClick={() => setShowVioraPass(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Card Pass View */}
        <div className="w-full bg-gradient-to-b from-[#252528] to-[#1C1C1E] border border-white/15 rounded-[28px] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4 w-full">
            <UserAvatar userId={userProfile.username} size={48} className="ring-2 ring-viora-neonLime" />
            <div className="text-left overflow-hidden">
              <h2 className="text-white font-bold text-base truncate">{userProfile.name}</h2>
              <p className="text-viora-neonLime text-xs font-mono font-medium">@{userProfile.username}</p>
            </div>
            <div className="ml-auto w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <QrCode className="w-4 h-4 text-viora-neonLime" />
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl shadow-inner my-2 flex items-center justify-center">
            <QRCodeSVG
              value={qrPayload}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>

          <p className="text-white/50 text-[11px] font-mono mt-3">
            Scan to instantly connect & recruit into teams
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-5 space-y-2.5 relative z-10">
          <button
            onClick={() => {
              setShowVioraPass(false);
              navigate('scanner_camera');
            }}
            className="w-full h-13 rounded-full bg-viora-neonLime text-black font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <ScanLine className="w-4 h-4 stroke-[2.5]" />
            Scan Another Pass
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Pass Link
          </button>
        </div>
      </motion.div>
    </div>
  );
}
