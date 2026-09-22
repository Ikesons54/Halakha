import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { DatabaseService } from '../../lib/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await DatabaseService.signInWithEmail(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your display name.');
        }
        await DatabaseService.registerWithEmail(email, password, name.trim());
      }
      onAuthSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check credentials.';
      setError(msg.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await DatabaseService.signInWithGoogle();
      onAuthSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in could not be completed.';
      setError(msg.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="auth-modal"
        className="w-full max-w-md bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8DDC8]/60 dark:border-[#2E3B33] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#263A32] text-[#E8DDC8] flex items-center justify-center font-scripture text-2xl font-bold border border-[#B39452]/40 shadow-xs">
              ה
            </div>
            <div>
              <h2 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                {mode === 'login' ? 'Sign In to HALAKHA' : 'Create Your Sanctuary'}
              </h2>
              <p className="text-xs text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
                Sync saved ideas, personal notes, and study paths across all devices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#69716B] hover:text-[#202421] dark:hover:text-white hover:bg-[#E8DDC8]/40 dark:hover:bg-[#2E3B33] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] bg-[#FAF8F5] dark:bg-[#19221E] hover:bg-[#F3EFE6] dark:hover:bg-[#24302A] text-xs font-semibold text-[#202421] dark:text-[#F3F0E8] flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E8DDC8] dark:border-[#2E3B33]" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#69716B] dark:text-[#AEB6AF]">
            or with email
          </span>
          <div className="flex-1 h-px bg-[#E8DDC8] dark:border-[#2E3B33]" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4E5651] dark:text-[#CAD3CC] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B39452]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Miriam Cohen"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] bg-[#FAF8F5] dark:bg-[#151D19] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B39452]/40"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#4E5651] dark:text-[#CAD3CC] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#B39452]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] bg-[#FAF8F5] dark:bg-[#151D19] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B39452]/40"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#4E5651] dark:text-[#CAD3CC] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#B39452]" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] bg-[#FAF8F5] dark:bg-[#151D19] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B39452]/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#263A32] text-[#F8F6F0] text-xs font-semibold hover:bg-[#1F2F29] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4 text-[#B39452]" />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-[#B39452]" />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="text-center pt-2 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33]">
          <p className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
            {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="ml-1.5 text-[#B39452] font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
