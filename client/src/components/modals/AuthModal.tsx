import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { loginUser, registerUser, demoLoginUser, clearAuthError } from '../../store/slices/authSlice.js';
import { setAuthModalOpen, addToast } from '../../store/slices/uiSlice.js';
import { WavePlayLogo } from '../common/WavePlayLogo.js';
import { X, Sparkles, LogIn, UserPlus } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthModalOpen } = useAppSelector((state) => state.ui);
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    dispatch(setAuthModalOpen(false));
    dispatch(clearAuthError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        dispatch(addToast({ message: `Welcome back, ${result.payload.user.name}!`, type: 'success' }));
        handleClose();
      }
    } else {
      const result = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(result)) {
        dispatch(addToast({ message: `Account created! Welcome, ${result.payload.user.name}!`, type: 'success' }));
        handleClose();
      }
    }
  };

  const handleDemoLogin = async () => {
    const result = await dispatch(demoLoginUser());
    if (demoLoginUser.fulfilled.match(result)) {
      dispatch(addToast({ message: 'Signed in with Wave Explorer Demo account!', type: 'success' }));
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-white">
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <WavePlayLogo size="lg" showTagline />
          <h3 className="text-xl font-bold mt-4">
            {mode === 'login' ? 'Log in to WavePlay' : 'Create your free account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Stream high quality music, save favorites, and craft playlists.
          </p>
        </div>

        {/* Demo Login Banner */}
        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 mb-5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>One-Click Instant Demo Login</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-slate-800" />
          <span className="text-xs text-slate-500 uppercase tracking-wider">or with email</span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              dispatch(clearAuthError());
            }}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            {mode === 'login' ? (
              <span>
                Don't have an account? <strong className="text-violet-400 underline">Sign up free</strong>
              </span>
            ) : (
              <span>
                Already have an account? <strong className="text-violet-400 underline">Log in</strong>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
