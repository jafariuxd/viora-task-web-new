import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Camera, Upload, Link, RefreshCw } from 'lucide-react';
import { useViora } from '../context/VioraContext';
import { UserAvatar } from '../components/UserAvatar';
import { BUNDLED_AVATARS, formatAvatarUrl } from '../utils/avatarRegistry';

const PRESET_AVATARS = [
  BUNDLED_AVATARS.mehran,
  BUNDLED_AVATARS.sara,
  BUNDLED_AVATARS.mohammad,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
];

export function EditProfileScreen() {
  const { userProfile, updateUserProfile, goBack } = useViora();

  const [name, setName] = useState(userProfile.name);
  const [username, setUsername] = useState(userProfile.username);
  const [email, setEmail] = useState(userProfile.email || '');
  const [avatarUri, setAvatarUri] = useState(userProfile.profileImageUri || '');
  const [deadlineDays, setDeadlineDays] = useState(
    userProfile.stats?.defaultDeadlineDays || 3
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const rawResult = reader.result;
        // Optimize & compress uploaded image via canvas to 256x256 max
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
          } else {
            if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setAvatarUri(compressed);
          } else {
            setAvatarUri(rawResult);
          }
        };
        img.onerror = () => {
          setAvatarUri(rawResult);
        };
        img.src = rawResult;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    updateUserProfile({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
      profileImageUri: avatarUri.trim() || undefined,
      stats: {
        ...userProfile.stats,
        defaultDeadlineDays: deadlineDays,
      },
    });

    goBack();
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pb-12 pt-4 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto font-['SF_Pro_Display',-apple-system,sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between py-2 mb-6">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 className="text-white text-lg font-bold">Edit Profile</h1>
        <div className="w-10" />
      </div>

      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Avatar Photo Section */}
        <div className="flex flex-col items-center justify-center mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer"
            title="Click to upload profile photo"
          >
            <UserAvatar
              userId={username}
              avatarUrl={avatarUri}
              size={104}
              className="ring-4 ring-white/20 shadow-2xl"
            />
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
              <Camera className="w-6 h-6 mb-1 text-viora-neonLime" />
              <span className="text-[10px] font-bold">Change</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload photo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const randomPreset =
                  PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
                setAvatarUri(randomPreset);
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Random</span>
            </button>
          </div>

          {/* Preset Avatars Row */}
          <div className="flex items-center gap-2 mt-4 pt-2">
            {PRESET_AVATARS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatarUri(url)}
                className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                  avatarUri === url
                    ? 'border-viora-neonLime scale-110 shadow-[0_0_8px_rgba(180,255,0,0.4)]'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={formatAvatarUrl(url) || url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-[#18181C] border border-white/10 rounded-[28px] p-5 space-y-4 shadow-sm">
          <div>
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#202025] border border-white/10 rounded-2xl px-4 py-3.5 text-white text-[15px] focus:outline-none focus:border-viora-neonLime"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-1">
              Viora Username (@handle) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                @
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#202025] border border-white/10 rounded-2xl pl-9 pr-4 py-3.5 text-white text-[15px] focus:outline-none focus:border-viora-neonLime"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#202025] border border-white/10 rounded-2xl px-4 py-3.5 text-white text-[15px] focus:outline-none focus:border-viora-neonLime"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-1">
              Custom Avatar Image URL
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUri.startsWith('data:') ? '' : avatarUri}
                onChange={(e) => setAvatarUri(e.target.value)}
                className="w-full bg-[#202025] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-viora-neonLime"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-1">
              Default Task Deadline (Days)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 7].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setDeadlineDays(days)}
                  className={`h-11 rounded-2xl font-bold text-xs transition-all ${
                    deadlineDays === days
                      ? 'bg-viora-neonLime text-black shadow-md'
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {days} {days === 1 ? 'Day' : 'Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full h-14 rounded-full bg-viora-neonLime text-black font-extrabold text-[16px] hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          Save Changes
        </button>
      </motion.form>
    </div>
  );
}
