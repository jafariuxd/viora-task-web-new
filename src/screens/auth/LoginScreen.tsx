import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AtSign,
  AlertCircle,
} from 'lucide-react';
import { useViora } from '../../context/VioraContext';
import { AuthLayout } from '../../components/auth/AuthLayout';

export function LoginScreen() {
  const {
    navigate,
    showMessage,
    loginWithEmail,
    registerWithEmail,
  } = useViora();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const validateEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address');
      showMessage('Please enter a valid email address', true);
      return;
    }
    if (password.length < 4) {
      setAuthError('Password must be at least 4 characters');
      showMessage('Password must be at least 4 characters', true);
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginWithEmail(email, password);
      setIsLoading(false);
      if (success) {
        setAuthError(null);
        navigate('home');
      } else {
        setAuthError('Invalid email or password. Server rejected the login credentials.');
      }
    } catch {
      setIsLoading(false);
      setAuthError('Authentication failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!name.trim()) {
      setAuthError('Please enter your full name');
      showMessage('Please enter your full name', true);
      return;
    }
    if (!username.trim()) {
      setAuthError('Please enter a unique username');
      showMessage('Please enter a unique username', true);
      return;
    }
    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address');
      showMessage('Please enter a valid email address', true);
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      showMessage('Password must be at least 6 characters', true);
      return;
    }

    setIsLoading(true);
    try {
      const success = await registerWithEmail(email, password, name, username);
      setIsLoading(false);
      if (success) {
        setAuthError(null);
        navigate('home');
      } else {
        setAuthError('Registration failed. Username or email may already be registered.');
      }
    } catch {
      setIsLoading(false);
      setAuthError('Failed to create account. Please try again.');
    }
  };

  return (
    <AuthLayout badgeText={mode === 'signin' ? 'Sign In' : 'Create Account'}>
      <div className="flex flex-col justify-between h-full space-y-7">
        {/* Centered Sign In / Sign Up Mode Switcher */}
        <div className="flex justify-center w-full pb-1">
          <div className="bg-zinc-100 p-1 rounded-full flex items-center gap-1 border border-zinc-200/60 shadow-inner">
            <button
              id="tab-mode-signin"
              type="button"
              onClick={() => {
                setMode('signin');
                setAuthError(null);
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-mode-signup"
              type="button"
              onClick={() => {
                setMode('signup');
                setAuthError(null);
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Title & Subtitle: Left-aligned with exact typography weights matching Viora-Taskw.jpg */}
        <div className="text-left space-y-2 pt-1">
          {mode === 'signin' ? (
            <h1 className="tracking-tight leading-[1.12]">
              <span className="block text-[26px] sm:text-[29px] font-normal text-zinc-900">
                Welcome 👋 to
              </span>
              <span className="block text-[34px] sm:text-[38px] font-semibold text-black tracking-tight mt-1">
                Viora Tasks
              </span>
            </h1>
          ) : (
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-black tracking-tight leading-tight">
              Create your workspace
            </h1>
          )}
          <p className="text-zinc-500 text-[13.5px] sm:text-[14.5px] leading-relaxed pt-1.5 max-w-sm">
            {mode === 'signin'
              ? 'Access your workspace and keep your workflow moving.'
              : 'Sign up to organize tasks, teams, and timelines with ease.'}
          </p>
        </div>

        {/* Error Alert if any */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{authError}</span>
          </motion.div>
        )}

        {/* Form Body with generous breathing room */}
        {mode === 'signin' ? (
          /* Sign In Form */
          <form onSubmit={handleSignIn} className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <label className="text-zinc-600 text-xs font-bold uppercase tracking-wider block px-1">
                Your email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="input-signin-email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-2xl pl-12 pr-4 h-14 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-zinc-600 text-xs font-bold uppercase tracking-wider block">
                  Your password
                </label>
                <button
                  id="btn-forgot-password"
                  type="button"
                  onClick={() => navigate('forgot_password')}
                  className="text-black font-semibold hover:underline text-xs"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="input-signin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-2xl pl-12 pr-12 h-14 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Neon Lime Action Button (Form cleanly ends here with generous top margin) */}
            <div className="pt-3">
              <button
                id="btn-submit-signin"
                type="submit"
                disabled={isLoading}
                className="w-full h-14 sm:h-[58px] rounded-full bg-viora-neonLime text-black font-extrabold text-base hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_22px_rgba(180,255,0,0.38)] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-zinc-600 text-[11px] font-bold uppercase tracking-wider block px-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-signup-name"
                    type="text"
                    required
                    placeholder="Mahdi Jafari"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-2xl pl-9 pr-3 h-12 text-zinc-900 text-xs placeholder:text-zinc-400 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600 text-[11px] font-bold uppercase tracking-wider block px-1">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-signup-username"
                    type="text"
                    required
                    placeholder="mahdi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-2xl pl-9 pr-3 h-12 text-zinc-900 text-xs placeholder:text-zinc-400 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-600 text-xs font-bold uppercase tracking-wider block px-1">
                Your email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-signup-email"
                  type="email"
                  required
                  placeholder="jafariuxd@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-2xl pl-10 pr-3 h-12 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-600 text-xs font-bold uppercase tracking-wider block px-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-2xl pl-10 pr-10 h-12 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                id="btn-submit-signup"
                type="submit"
                disabled={isLoading}
                className="w-full h-14 sm:h-[58px] rounded-full bg-viora-neonLime text-black font-extrabold text-base hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_22px_rgba(180,255,0,0.38)] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
