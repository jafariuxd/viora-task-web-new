import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Activity,
  RotateCcw,
  Check,
  ChevronRight,
  Server,
  RefreshCw,
  QrCode,
  Palette,
} from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { presetCities } from '../utils/cities';
import { PWAInstallButton } from '../components/PWAInstallButton';

export function SettingsScreen() {
  const {
    weatherCity,
    setWeatherCity,
    setWeatherInfo,
    googleCalendarSynced,
    toggleGoogleCalendarSync,
    setShowApiInspector,
    setShowVioraPass,
    goBack,
    showMessage,
    serverStatus,
    lastSyncTime,
    syncWithBackend,
    clearAllCacheAndReset,
    cardTheme,
    setCardTheme,
  } = useViora();

  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSelectCity = (cityName: string) => {
    setWeatherCity(cityName);
    const temps: Record<string, string> = {
      Tehran: '9°',
      Mashhad: '7°',
      Isfahan: '12°',
      Shiraz: '15°',
      Tabriz: '4°',
      Karaj: '8°',
      Ahvaz: '22°',
      Yazd: '14°',
      Rasht: '11°',
      Kerman: '10°',
      Qom: '11°',
      Sanandaj: '6°',
      Zahedan: '18°',
      Sari: '12°',
    };

    setWeatherInfo((prev) => ({
      ...prev,
      location: cityName,
      temperature: temps[cityName] || '10°',
      lastRefreshText: 'Last refresh: Just now',
    }));

    setShowCityPicker(false);
    showMessage(`Weather location updated to ${cityName}`);
  };

  return (
    <div className="min-h-screen bg-viora-bg text-white pb-24 md:pb-12 pt-4 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
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

        <h1 className="text-white text-lg font-bold">Settings</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-6">
        {/* PWA & Desktop Installation */}
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2 px-1">
            Application Installation (نصب برنامه PWA)
          </span>
          <PWAInstallButton variant="settings" />
        </div>

        {/* Card Theme & Appearance */}
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2 px-1">
            Card Theme & Appearance (تم کارت‌ها)
          </span>
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-viora-neonLime/10 text-viora-neonLime flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Task Card Theme</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  Choose the background color of task cards for both Board and List views
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* White Option */}
              <button
                type="button"
                onClick={() => {
                  setCardTheme('white');
                  showMessage('Card theme set to White (سفید)');
                }}
                className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col gap-2.5 ${
                  cardTheme === 'white'
                    ? 'bg-white/10 border-viora-neonLime ring-2 ring-viora-neonLime/30 shadow-lg'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    {/* Visual mini card preview */}
                    <div className="w-7 h-7 rounded-lg bg-white border border-black/10 shadow-sm flex flex-col justify-center gap-0.5 px-1">
                      <div className="w-full h-1 rounded-full bg-zinc-800" />
                      <div className="w-3/5 h-0.5 rounded-full bg-zinc-400" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">White (سفید)</span>
                      <span className="text-[10px] text-zinc-400">Pure Stark White</span>
                    </div>
                  </div>
                  {cardTheme === 'white' && (
                    <span className="w-5 h-5 rounded-full bg-viora-neonLime text-black flex items-center justify-center text-[10px] font-black shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-zinc-400 leading-snug">
                  Both List view and Board view task cards use crisp stark white backgrounds.
                </p>
              </button>

              {/* Gray Option */}
              <button
                type="button"
                onClick={() => {
                  setCardTheme('gray');
                  showMessage('Card theme set to Dark Grey (خاکستری)');
                }}
                className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col gap-2.5 ${
                  cardTheme === 'gray'
                    ? 'bg-white/10 border-viora-neonLime ring-2 ring-viora-neonLime/30 shadow-lg'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    {/* Visual mini card preview */}
                    <div className="w-7 h-7 rounded-lg bg-[#18181C] border border-white/20 shadow-sm flex flex-col justify-center gap-0.5 px-1">
                      <div className="w-full h-1 rounded-full bg-white" />
                      <div className="w-3/5 h-0.5 rounded-full bg-zinc-500" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">Charcoal Grey (خاکستری)</span>
                      <span className="text-[10px] text-zinc-400">Dark Modern Grey</span>
                    </div>
                  </div>
                  {cardTheme === 'gray' && (
                    <span className="w-5 h-5 rounded-full bg-viora-neonLime text-black flex items-center justify-center text-[10px] font-black shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-zinc-400 leading-snug">
                  Both List view and Board view task cards use sleek charcoal dark grey backgrounds.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Weather Preferences */}
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2 px-1">
            Weather & Location Preferences
          </span>
          <div
            onClick={() => setShowCityPicker(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[24px] p-5 cursor-pointer flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-viora-neonLime/10 text-viora-neonLime flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Selected City</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  Current: {weatherCity} (Open-Meteo Iranian Cities)
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-white/40" />
          </div>
        </div>

        {/* Google Calendar Sync */}
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2 px-1">
            Integrations & Calendar
          </span>
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Google Calendar Sync</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  Synchronize events with your account
                </p>
              </div>
            </div>

            <button
              onClick={toggleGoogleCalendarSync}
              className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center ${
                googleCalendarSynced ? 'bg-viora-neonLime justify-end' : 'bg-white/20 justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-black shadow-md" />
            </button>
          </div>
        </div>

        {/* Backend Cloud Server */}
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2 px-1">
            Backend Server & Cloud Sync
          </span>
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-viora-neonLime/10 text-viora-neonLime flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    Viora API Server
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        serverStatus === 'connected'
                          ? 'bg-viora-neonLime/20 text-viora-neonLime border border-viora-neonLime/30'
                          : serverStatus === 'syncing'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {serverStatus === 'connected'
                        ? 'Live Cloud'
                        : serverStatus === 'syncing'
                        ? 'Syncing'
                        : 'Offline / Local Cache'}
                    </span>
                  </h3>
                  <p className="text-white/40 text-xs font-mono mt-0.5">
                    http://45.195.250.77:3000/api
                  </p>
                </div>
              </div>

              <button
                id="btn-settings-sync-now"
                onClick={syncWithBackend}
                disabled={serverStatus === 'syncing'}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${serverStatus === 'syncing' ? 'animate-spin' : ''}`}
                />
                <span>Sync Now</span>
              </button>
            </div>

            {lastSyncTime && (
              <div className="text-[11px] text-white/30 pt-2 border-t border-white/5 flex justify-between">
                <span>Last successful cloud sync:</span>
                <span className="font-mono text-white/50">{lastSyncTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Digital Viora Pass */}
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2 px-1">
            Identity & Digital Pass
          </span>
          <div
            onClick={() => setShowVioraPass(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[24px] p-5 cursor-pointer flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-viora-neonLime/10 text-viora-neonLime flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Digital Viora Pass ID</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  View personalized membership QR code and digital ID card
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-white/40" />
          </div>
        </div>

        {/* Developer Tools */}
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2 px-1">
            Developer & Diagnostics
          </span>
          <div
            onClick={() => setShowApiInspector(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[24px] p-5 cursor-pointer flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">API & Network Inspector</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  Inspect live API requests, status codes, and latency
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-white/40" />
          </div>
        </div>

        {/* Storage & Wipe Cache */}
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2 px-1">
            Storage, Cookies & Cache
          </span>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-[24px] p-5 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-red-400 text-base">Clear Cache & Reset Simulator</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  Wipe all localStorage, session cookies, and local cached states
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-[#1C1C1E] border border-white/10 rounded-[32px] p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h2 className="text-white text-lg font-bold mb-2">Clear All Cache & Cookies?</h2>
            <p className="text-zinc-400 text-xs mb-6">
              This will wipe all local storage data, cookies, saved tokens, and reset the simulator to clean slate for testing.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-12 rounded-full bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  clearAllCacheAndReset();
                }}
                className="flex-1 h-12 rounded-full bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors shadow-lg"
              >
                Wipe & Reset
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* City Picker Modal */}
      {showCityPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowCityPicker(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-[32px] p-6 shadow-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-xl font-bold mb-4">Select City</h2>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {presetCities.map((city) => {
                const isSelected = weatherCity === city.name;
                return (
                  <button
                    key={city.name}
                    onClick={() => handleSelectCity(city.name)}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-viora-neonLime text-black font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  >
                    <span>{city.name}</span>
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
