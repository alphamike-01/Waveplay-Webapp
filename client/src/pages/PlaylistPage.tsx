import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { playTrack } from '../store/slices/playerSlice.js';
import { removeUserPlaylist } from '../store/slices/librarySlice.js';
import { addToast } from '../store/slices/uiSlice.js';
import { api } from '../services/api.js';
import { IPlaylist, ITrack } from '../types/index.js';
import { TrackRow } from '../components/cards/TrackRow.js';
import { Play, Shuffle, Trash2, ListMusic, Clock, Share2 } from 'lucide-react';

export const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [playlist, setPlaylist] = useState<IPlaylist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.playlists.getById(id)
      .then((data) => {
        if (data.playlist) {
          setPlaylist(data.playlist);
        }
      })
      .catch((err) => {
        console.error('Error fetching playlist:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400 animate-pulse">Loading playlist...</div>;
  }

  if (!playlist) {
    return (
      <div className="py-20 text-center text-slate-400">
        <h3 className="text-lg font-bold text-white mb-2">Playlist not found</h3>
        <button
          onClick={() => navigate('/library')}
          className="text-xs text-violet-400 underline font-semibold"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const isOwner = user?.id === playlist.ownerId || playlist.ownerId === 'guest';
  const totalDuration = playlist.tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      dispatch(playTrack({ track: playlist.tracks[0], queue: playlist.tracks, index: 0 }));
    }
  };

  const handleShufflePlay = () => {
    if (playlist.tracks.length > 0) {
      const rand = Math.floor(Math.random() * playlist.tracks.length);
      dispatch(playTrack({ track: playlist.tracks[rand], queue: playlist.tracks, index: rand }));
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    try {
      await api.playlists.removeTrack(playlist.id, trackId);
      setPlaylist({
        ...playlist,
        tracks: playlist.tracks.filter((t) => t.id !== trackId)
      });
      dispatch(addToast({ message: 'Track removed from playlist', type: 'info' }));
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Failed to remove track', type: 'error' }));
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) return;
    try {
      await api.playlists.delete(playlist.id);
      dispatch(removeUserPlaylist(playlist.id));
      dispatch(addToast({ message: 'Playlist deleted', type: 'info' }));
      navigate('/library');
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Failed to delete playlist', type: 'error' }));
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${playlist.name} on WavePlay`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      dispatch(addToast({ message: 'Playlist link copied to clipboard!', type: 'success' }));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900/80 via-slate-900 to-black border border-white/10 shadow-2xl">
        <img
          src={
            playlist.coverImage ||
            (playlist.tracks?.[0]?.coverImage) ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
          }
          alt={playlist.name}
          className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl object-cover shadow-2xl shrink-0"
        />

        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-xs uppercase font-extrabold tracking-wider text-violet-400">
            {playlist.isPublic ? 'Public Playlist' : 'Private Playlist'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {playlist.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-2">
            <span className="text-white font-bold">{playlist.ownerName}</span>
            <span>•</span>
            <span>{playlist.tracks.length} songs</span>
            {totalMinutes > 0 && (
              <>
                <span>•</span>
                <span>about {totalMinutes} min</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            aria-label="Play all songs in playlist"
            className="w-13 h-13 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-violet-600/40 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>

          <button
            onClick={handleShufflePlay}
            disabled={playlist.tracks.length === 0}
            aria-label="Shuffle playlist"
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            aria-label="Share playlist"
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {isOwner && (
          <button
            onClick={handleDeletePlaylist}
            aria-label="Delete playlist"
            className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete Playlist</span>
          </button>
        )}
      </div>

      {/* Tracklist Table */}
      {playlist.tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 rounded-2xl bg-white/[0.02] border border-white/5">
          <ListMusic className="w-12 h-12 mb-3 text-violet-400 opacity-40" />
          <h3 className="text-base font-bold text-white mb-1">This playlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Explore music and add songs via the three-dot context menu.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
          >
            Find songs
          </button>
        </div>
      ) : (
        <div>
          <div className="hidden md:flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 select-none">
            <div className="flex items-center gap-4 flex-1">
              <span className="w-7 text-center">#</span>
              <span>Title</span>
            </div>
            <div className="flex-1 px-4">Album</div>
            <div className="flex items-center gap-8 shrink-0 pr-4">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            {playlist.tracks.map((track, i) => (
              <TrackRow
                key={`${track.id}-${i}`}
                track={track}
                index={i}
                queueContext={playlist.tracks}
                playlistId={playlist.id}
                onRemoveFromPlaylist={isOwner ? handleRemoveTrack : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
