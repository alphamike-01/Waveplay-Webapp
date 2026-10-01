import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { fetchLibrary } from '../store/slices/librarySlice.js';
import { setCreatePlaylistModalOpen, setAuthModalOpen } from '../store/slices/uiSlice.js';
import { PlaylistCard } from '../components/cards/PlaylistCard.js';
import { AlbumCard } from '../components/cards/AlbumCard.js';
import { ArtistCard } from '../components/cards/ArtistCard.js';
import { TrackRow } from '../components/cards/TrackRow.js';
import { Heart, Plus, Library, Sparkles, FileMusic } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    likedTracks,
    savedAlbums,
    followedArtists,
    userPlaylists,
    localTracks,
    isLoading
  } = useAppSelector((state) => state.library);

  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'liked' | 'albums' | 'artists' | 'local'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchLibrary());
    }
  }, [isAuthenticated, dispatch]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'liked', label: 'Liked Songs' },
    { id: 'albums', label: 'Albums' },
    { id: 'artists', label: 'Artists' },
    { id: 'local', label: 'Local Files' }
  ];

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            All your saved tracks, playlists, albums, and local songs in one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => dispatch(setCreatePlaylistModalOpen(true))}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-slate-950 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-900/40 via-indigo-900/20 to-cyan-900/40 border border-violet-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-violet-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Save your library permanently</h4>
              <p className="text-xs text-slate-300">
                Log in or launch instant demo mode to sync likes, playlists, and history across sessions.
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setAuthModalOpen(true))}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shrink-0 hover:scale-105 transition"
          >
            Sign In / Demo
          </button>
        </div>
      )}

      {/* Liked Songs Tile Banner (When All or Liked) */}
      {(activeTab === 'all' || activeTab === 'liked') && (
        <div
          onClick={() => navigate('/liked')}
          className="group relative flex items-center justify-between p-6 rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-indigo-800 text-white shadow-xl hover:shadow-pink-500/20 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.01]"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Liked Songs</h3>
              <p className="text-xs text-pink-100 font-medium mt-1">
                {likedTracks.length} favorite tracks
              </p>
            </div>
          </div>
          <span className="text-xs font-bold underline mr-2">Open Playlist</span>
        </div>
      )}

      {/* Playlists Grid */}
      {(activeTab === 'all' || activeTab === 'playlists') && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Your Playlists</h3>
          {userPlaylists.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-slate-500 text-xs">
              No custom playlists created yet. Click "New Playlist" to get started!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {userPlaylists.map((pl) => (
                <PlaylistCard key={pl.id} playlist={pl} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Albums */}
      {(activeTab === 'all' || activeTab === 'albums') && savedAlbums.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Saved Albums</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {savedAlbums.map((al) => (
              <AlbumCard key={al.id} album={al} />
            ))}
          </div>
        </div>
      )}

      {/* Followed Artists */}
      {(activeTab === 'all' || activeTab === 'artists') && followedArtists.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Followed Artists</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {followedArtists.map((ar) => (
              <ArtistCard key={ar.id} artist={ar} />
            ))}
          </div>
        </div>
      )}

      {/* Local Files Tab */}
      {(activeTab === 'all' || activeTab === 'local') && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Local Tracks ({localTracks.length})</h3>
            <button
              onClick={() => navigate('/local-music')}
              className="text-xs font-semibold text-violet-400 hover:underline flex items-center gap-1"
            >
              <FileMusic className="w-3.5 h-3.5" />
              <span>Manage local files</span>
            </button>
          </div>

          {localTracks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-slate-500 text-xs">
              No local music files loaded. Add your MP3s, WAVs, or FLACs in Local Music!
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {localTracks.slice(0, 5).map((track, i) => (
                <TrackRow key={track.id} track={track} index={i} queueContext={localTracks} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
