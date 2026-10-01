import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { toggleTheme } from '../../store/slices/settingsSlice.js';
import { setAuthModalOpen } from '../../store/slices/uiSlice.js';
import { logout } from '../../store/slices/authSlice.js';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { theme } = useAppSelector((state) => state.settings);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const isSearchPage = location.pathname.startsWith('/search');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3.5 bg-[#0c0d12]/80 backdrop-blur-xl border-b border-white/[0.05]">
      {/* Left: Navigation Arrows & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            aria-label="Go forward"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global / Inline Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (isSearchPage) {
                navigate(`/search?q=${encodeURIComponent(e.target.value)}`, { replace: true });
              }
            }}
            placeholder="What do you want to play?"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] border border-white/10 focus:border-violet-500 text-sm text-white placeholder-slate-400 outline-none transition"
          />
        </form>
      </div>

      {/* Right: Theme Toggle, Settings, User Profile / Auth */}
      <div className="flex items-center gap-2.5">
        {/* Dark / Light Mode Switcher */}
        <button
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle dark/light theme"
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[120px] truncate">
                {user.name}
              </span>
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email}`}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-violet-500/40"
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-700/70 shadow-2xl p-1.5 z-50 text-sm text-slate-200 animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition text-left cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      dispatch(logout());
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(setAuthModalOpen(true))}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              Sign Up
            </button>
            <button
              onClick={() => dispatch(setAuthModalOpen(true))}
              className="px-4 py-1.5 rounded-full bg-white text-slate-900 font-semibold text-xs hover:scale-105 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-violet-600 fill-violet-600" />
              <span>Log In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
