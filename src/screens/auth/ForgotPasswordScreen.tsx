import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useViora } from '../../context/VioraContext';
import { AuthLayout } from '../../components/auth/AuthLayout';

export function ForgotPasswordScreen() {
  const { navigate, goBack, showMessage, logApiCall } = useViora();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      showMessage('Please enter a valid email address', true);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      logApiCall(
        'POST',
        '/api/v1/auth/forgot-password',
        200,
        95,
        { email },
        { message: 'Reset email dispatched' }
      );
      setIsLoading(false);
      setIsSubmitted(true);
      showMessage('Password reset link sent to your email');
    }, 500);
  };

  return (
    <AuthLayout badgeText="Account Recovery">
      <div className="flex flex-col justify-between h-full space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            id="btn-forgot-back"
            onClick={goBack}
            className="w-10 h-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-auto py-2 space-y-6"
        >
          {!isSubmitted ? (
            <>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                  Reset your password
                </h1>
                <p className="text-zinc-500 text-xs sm:text-sm mt-2 leading-relaxed">
                  Enter your registered email address and we'll send you instructions to reset your account password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-zinc-600 text-xs font-bold uppercase tracking-wider block mb-1.5 px-1">
                    Your email
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-forgot-email"
                      type="email"
                      required
                      autoFocus
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-zinc-300 rounded-2xl pl-12 pr-4 py-3.5 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-viora-neonLime focus:ring-4 focus:ring-viora-neonLime/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-forgot"
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-full bg-viora-neonLime text-black font-extrabold text-base hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(180,255,0,0.35)] mt-4 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Sending Link...</span>
                  ) : (
                    <>
                      <span>Send Reset Instructions</span>
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-viora-neonLime/20 text-black flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-950">Check your inbox</h2>
              <p className="text-zinc-600 text-sm max-w-xs mx-auto">
                We have sent password reset instructions to{' '}
                <strong className="text-black">{email}</strong>.
              </p>
              <button
                id="btn-return-login"
                onClick={() => navigate('login')}
                className="w-full h-14 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-sm transition-colors mt-6"
              >
                Return to Sign In
              </button>
            </div>
          )}
        </motion.div>

        <div className="text-center text-zinc-400 text-xs pb-2">
          Need assistance? Contact support@viora.app
        </div>
      </div>
    </AuthLayout>
  );
}
