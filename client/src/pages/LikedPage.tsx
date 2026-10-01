import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { playTrack } from '../store/slices/playerSlice.js';
import { api } from '../services/api.js';
import { ITrack } from '../types/index.js';
import { TrackRow } from '../components/cards/TrackRow.js';
import { Heart, Play, Shuffle, Clock, Music } from 'lucide-react';

export const LikedPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { likedTracks: storeLikedTracks } = useAppSelector((state) => state.library);

  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        if (isAuthenticated) {
          const res = await api.library.getLiked();
          setTracks(res.tracks || []);
        } else {
          // If guest, fetch sample liked or use store
          const all = await api.tracks.getAll({ limit: 15 });
          setTracks(all.tracks.slice(0, 8).map((t) => ({ ...t, liked: true })));
        }
      } catch (err) {
        console.error('Failed to load liked songs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiked();
  }, [isAuthenticated, storeLikedTracks]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      dispatch(playTrack({ track: tracks[0], queue: tracks, index: 0 }));
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      dispatch(playTrack({ track: tracks[randomIndex], queue: tracks, index: randomIndex }));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-pink-600/90 via-rose-700/80 to-slate-900 border border-pink-500/20 shadow-2xl">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-2xl shadow-pink-600/40 shrink-0">
          <Heart className="w-20 h-20 text-white fill-white" />
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-xs uppercase font-extrabold tracking-wider text-pink-200">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Liked Songs
          </h1>
          <p className="text-xs sm:text-sm text-pink-100/90 mt-1">
            Your personal collection of favorite tracks across the WavePlay universe.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-pink-200 mt-2">
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {tracks.length > 0 && (
        <div className="flex items-center gap-4 py-2">
          <button
            onClick={handlePlayAll}
            aria-label="Play all liked songs"
            className="w-13 h-13 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/40 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>

          <button
            onClick={handleShufflePlay}
            aria-label="Shuffle liked songs"
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Table Header */}
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

      {/* Track List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
          Loading liked tracks...
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
          <Music className="w-12 h-12 mb-3 text-pink-400 opacity-40" />
          <h3 className="text-lg font-bold text-white mb-1">Songs you like will appear here</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Save songs by tapping the heart icon anywhere across the app.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              queueContext={tracks}
            />
          ))}
        </div>
      )}
    </div>
  );
};
