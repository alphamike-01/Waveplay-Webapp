import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { logout } from '../store/slices/authSlice.js';
import { setAuthModalOpen } from '../store/slices/uiSlice.js';
import { User, Heart, ListMusic, History, LogOut, Sparkles } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { likedTracks, userPlaylists, history } = useAppSelector((state) => state.library);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <User className="w-16 h-16 text-slate-500 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">You are not logged in</h2>
        <p className="text-xs text-slate-400 mb-6 max-w-sm">
          Sign in or launch instant demo mode to access your personal profile and statistics.
        </p>
        <button
          onClick={() => dispatch(setAuthModalOpen(true))}
          className="px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg transition"
        >
          Sign In / Demo
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-3xl">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-violet-900/60 via-slate-900 to-black border border-white/10 shadow-2xl">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email}`}
          alt={user.name}
          className="w-28 h-28 rounded-full object-cover ring-4 ring-violet-500/30 shadow-2xl shrink-0"
        />

        <div className="flex flex-col text-center sm:text-left">
          <span className="text-xs uppercase font-extrabold tracking-wider text-violet-400">
            Profile
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            {user.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>

          <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-300 mt-4">
            <span>{likedTracks.length} Liked Songs</span>
            <span>•</span>
            <span>{userPlaylists.length} Playlists</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/liked')}
          className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition cursor-pointer flex flex-col gap-2"
        >
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 w-fit">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-black text-white">{likedTracks.length}</span>
          <span className="text-xs font-medium text-slate-400">Liked Songs Saved</span>
        </div>

        <div
          onClick={() => navigate('/library')}
          className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition cursor-pointer flex flex-col gap-2"
        >
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 w-fit">
            <ListMusic className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-white">{userPlaylists.length}</span>
          <span className="text-xs font-medium text-slate-400">Playlists Created</span>
        </div>

        <div
          onClick={() => navigate('/history')}
          className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition cursor-pointer flex flex-col gap-2"
        >
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit">
            <History className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-white">{history.length}</span>
          <span className="text-xs font-medium text-slate-400">Songs Played</span>
        </div>
      </div>

      {/* Account Settings & Sign Out */}
      <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Sign Out</h3>
          <p className="text-xs text-slate-400">End your active session on this device.</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
