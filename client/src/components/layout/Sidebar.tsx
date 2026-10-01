import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { setCreatePlaylistModalOpen, setAddUrlModalOpen, setAuthModalOpen } from '../../store/slices/uiSlice.js';
import { WavePlayLogo } from '../common/WavePlayLogo.js';
import {
  Home,
  Search,
  Library,
  PlusSquare,
  Heart,
  FileMusic,
  Link,
  Settings,
  History,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { userPlaylists } = useAppSelector((state) => state.library);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 select-none ${
      isActive
        ? 'bg-violet-600/15 text-violet-400 font-semibold'
        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
    }`;

  const handleCreatePlaylist = () => {
    dispatch(setCreatePlaylistModalOpen(true));
  };

  const handleAddUrl = () => {
    dispatch(setAddUrlModalOpen(true));
  };

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen bg-[#0e1017] border-r border-white/[0.06] p-4 text-white z-20">
      {/* Brand Logo Header */}
      <div className="px-2 pt-2 pb-6">
        <NavLink to="/">
          <WavePlayLogo size="md" showTagline />
        </NavLink>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex flex-col gap-1 mb-6">
        <NavLink to="/" className={navLinkClasses} end>
          <Home className="w-5 h-5 shrink-0" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/search" className={navLinkClasses}>
          <Search className="w-5 h-5 shrink-0" />
          <span>Search</span>
        </NavLink>

        <NavLink to="/library" className={navLinkClasses}>
          <Library className="w-5 h-5 shrink-0" />
          <span>Your Library</span>
        </NavLink>
      </nav>

      {/* Secondary Actions & Shortcuts */}
      <div className="flex flex-col gap-1 pt-4 border-t border-white/[0.08]">
        <button
          onClick={handleCreatePlaylist}
          className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition text-left cursor-pointer group"
        >
          <div className="p-1 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 group-hover:scale-105 transition">
            <PlusSquare className="w-4 h-4 text-white" />
          </div>
          <span>Create Playlist</span>
        </button>

        <NavLink to="/liked" className={navLinkClasses}>
          <div className="p-1 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span>Liked Songs</span>
        </NavLink>

        <NavLink to="/local-music" className={navLinkClasses}>
          <div className="p-1 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <FileMusic className="w-4 h-4 text-white" />
          </div>
          <span>Local Music</span>
        </NavLink>

        <button
          onClick={handleAddUrl}
          className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition text-left cursor-pointer group"
        >
          <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 group-hover:scale-105 transition">
            <Link className="w-4 h-4 text-white" />
          </div>
          <span>Play from URL</span>
        </button>

        <NavLink to="/history" className={navLinkClasses}>
          <History className="w-5 h-5 shrink-0 text-slate-400" />
          <span>Listening History</span>
        </NavLink>
      </div>

      {/* Scrollable Playlist List */}
      <div className="flex-1 overflow-y-auto mt-4 pt-4 border-t border-white/[0.08] pr-1">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Your Playlists
        </h5>
        <div className="flex flex-col gap-0.5">
          {userPlaylists.length === 0 ? (
            <p className="text-xs text-slate-600 px-3 py-2 italic">
              Playlists you save or create will appear here.
            </p>
          ) : (
            userPlaylists.map((pl) => (
              <NavLink
                key={pl.id}
                to={`/playlist/${pl.id}`}
                className={({ isActive }) =>
                  `block px-3 py-1.5 text-xs truncate rounded-lg transition ${
                    isActive ? 'text-violet-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                {pl.name}
              </NavLink>
            ))
          )}
        </div>
      </div>

      {/* Bottom utility: Settings & Demo CTA */}
      <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-1">
        {!isAuthenticated && (
          <button
            onClick={() => dispatch(setAuthModalOpen(true))}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 transition mb-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sign In / Demo Mode</span>
          </button>
        )}

        <NavLink to="/settings" className={navLinkClasses}>
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
