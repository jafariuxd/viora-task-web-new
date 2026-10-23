import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useViora } from '../../context/VioraContext';
import { AuthLayout } from '../../components/auth/AuthLayout';

export function OtpScreen() {
  const { navigate, goBack, showMessage } = useViora();
  const [digits, setDigits] = useState(['', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length === 4) {
      navigate('profile_setup');
    } else {
      showMessage('Please enter the 4-digit code (e.g. 1 2 3 4)');
    }
  };

  return (
    <AuthLayout badgeText="Security Verification">
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

        {/* Main Content (matching PDF Page 7) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-auto py-4 space-y-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              Check your email
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm mt-2 leading-relaxed">
              Enter the 4-digit verification code sent to your email. (Demo code: <strong className="text-black font-mono">1234</strong>)
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-3 max-w-xs mx-auto">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputsRef.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={idx === 0}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-14 sm:w-16 h-16 sm:h-20 bg-white border-2 border-zinc-200 rounded-2xl text-center text-xl sm:text-2xl font-bold text-zinc-900 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all font-mono shadow-sm"
                />
              ))}
            </div>

            <div className="text-center text-xs text-zinc-500">
              Didn't receive the email?{' '}
              <button
                type="button"
                onClick={() => showMessage('Resent verification code to email')}
                className="text-black font-bold hover:underline"
              >
                Resend it!
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-full bg-viora-neonLime text-black font-extrabold text-base hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(180,255,0,0.35)]"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>
        </motion.div>

        <div className="text-center text-zinc-400 text-xs pb-2">
          Protected by Viora Authentication
        </div>
      </div>
    </AuthLayout>
  );
}
