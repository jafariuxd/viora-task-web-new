import React, { useState } from 'react';
import { Download, Check, Share, PlusSquare, Smartphone, Monitor, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'sidebar' | 'settings' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'sidebar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If app is already installed in standalone mode, don't show the button
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-viora-neonLime/15 text-viora-neonLime flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Viora PWA Installed</p>
              <p className="text-[11px] text-zinc-400">Application is running in standalone mode</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-viora-neonLime bg-viora-neonLime/10 px-2 py-0.5 rounded-full border border-viora-neonLime/20">
            Active
          </span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    } else {
      // Show guided instructions for iOS or desktop browser address bar
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'sidebar' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl bg-gradient-to-r from-viora-neonLime/15 to-transparent border border-viora-neonLime/30 hover:border-viora-neonLime/60 hover:bg-viora-neonLime/20 text-white transition-all group shadow-sm ${className}`}
          title="Install Viora as a desktop or mobile application"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-viora-neonLime text-black flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(180,255,0,0.35)] group-hover:scale-105 transition-transform">
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white group-hover:text-viora-neonLime transition-colors truncate">
                Install Viora
              </p>
              <p className="text-[10px] text-zinc-400 font-medium truncate">
                Desktop & Mobile PWA
              </p>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-viora-neonLime/80 group-hover:text-viora-neonLime shrink-0 animate-pulse" />
        </button>
      )}

      {variant === 'settings' && (
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-viora-neonLime text-black flex items-center justify-center shadow-[0_0_15px_rgba(180,255,0,0.3)]">
                <Download className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Install Web App (PWA)</h3>
                <p className="text-xs text-white/50">Run Viora offline with desktop and mobile app speed</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 rounded-xl bg-viora-neonLime text-black text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Install Now</span>
            </button>
          </div>
        </div>
      )}

      {variant === 'banner' && (
        <div className={`flex items-center justify-between px-3.5 py-2 rounded-2xl bg-[#1A1A1E] border border-viora-neonLime/30 ${className}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-viora-neonLime text-black flex items-center justify-center shrink-0">
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-white truncate">Install Viora App for offline access</span>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 rounded-lg bg-viora-neonLime text-black text-[11px] font-bold hover:brightness-105 transition-all shrink-0 ml-2"
          >
            Install
          </button>
        </div>
      )}

      {/* Guided Instructions Modal for iOS & Desktop Browser Fallback */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[28px] bg-[#141418] border border-white/15 p-6 shadow-2xl relative text-left font-['SF_Pro_Display',-apple-system,sans-serif]">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-viora-neonLime text-black flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(180,255,0,0.3)]">
              {isIOS ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </div>

            <h3 className="text-lg font-bold text-white mb-1.5">
              {isIOS ? 'Install Viora on iOS' : 'Install Viora Application'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Install Viora to your home screen or desktop to open it in full screen and use it offline.
            </p>

            {isIOS ? (
              <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-xs text-zinc-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-viora-neonLime font-bold">
                    1
                  </div>
                  <p className="leading-snug">
                    Tap the <strong className="text-white">Share</strong> button <Share className="inline w-3.5 h-3.5 text-viora-neonLime mx-0.5" /> in the Safari toolbar.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-viora-neonLime font-bold">
                    2
                  </div>
                  <p className="leading-snug">
                    Scroll down and select <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="inline w-3.5 h-3.5 text-viora-neonLime mx-0.5" />.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-viora-neonLime font-bold">
                    3
                  </div>
                  <p className="leading-snug">
                    Tap <strong className="text-white">Add</strong> in the top-right corner to launch as a standalone app!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-xs text-zinc-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-viora-neonLime font-bold">
                    1
                  </div>
                  <p className="leading-snug">
                    Look for the <strong className="text-white">Install</strong> icon <Download className="inline w-3.5 h-3.5 text-viora-neonLime mx-0.5" /> on the right side of your browser's address bar.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-viora-neonLime font-bold">
                    2
                  </div>
                  <p className="leading-snug">
                    Click <strong className="text-white">Install</strong> to add Viora to your desktop, taskbar, or applications menu.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-viora-neonLime text-black font-bold text-xs hover:brightness-105 transition-all shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Success notification */}
      {installSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#1A1A1E] border border-viora-neonLime/50 text-white px-4 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-3">
          <div className="w-6 h-6 rounded-full bg-viora-neonLime text-black flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold">Viora Installed Successfully!</p>
            <p className="text-[11px] text-zinc-400">You can now launch it directly from your device</p>
          </div>
        </div>
      )}
    </>
  );
};
