import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { playTrack } from '../store/slices/playerSlice.js';
import { api } from '../services/api.js';
import { IAlbum, ITrack } from '../types/index.js';
import { TrackRow } from '../components/cards/TrackRow.js';
import { addToast } from '../store/slices/uiSlice.js';
import { Play, Shuffle, Bookmark, BookmarkCheck, Clock, Share2, Disc } from 'lucide-react';

export const AlbumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [album, setAlbum] = useState<IAlbum | null>(null);
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.albums.getById(id)
      .then((data) => {
        if (data.album) {
          setAlbum(data.album);
          setIsSaved(!!data.album.isSaved);
          setTracks(data.tracks || []);
        }
      })
      .catch((err) => console.error('Failed to load album:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400 animate-pulse">Loading album...</div>;
  }

  if (!album) {
    return (
      <div className="py-20 text-center text-slate-400">
        <h3 className="text-lg font-bold text-white mb-2">Album not found</h3>
        <button onClick={() => navigate('/')} className="text-xs text-violet-400 underline font-semibold">
          Return to Home
        </button>
      </div>
    );
  }

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      dispatch(playTrack({ track: tracks[0], queue: tracks, index: 0 }));
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const rand = Math.floor(Math.random() * tracks.length);
      dispatch(playTrack({ track: tracks[rand], queue: tracks, index: rand }));
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      setIsSaved(!isSaved);
      dispatch(addToast({ message: isSaved ? 'Removed from library' : 'Saved to library', type: 'info' }));
      return;
    }
    try {
      const res = await api.library.toggleSaveAlbum(album.id);
      setIsSaved(res.saved);
      dispatch(addToast({ message: res.saved ? 'Saved album to your library' : 'Removed album from your library', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Action failed', type: 'error' }));
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${album.title} by ${album.artistName}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      dispatch(addToast({ message: 'Album link copied to clipboard!', type: 'success' }));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-violet-900/60 via-slate-900 to-black border border-white/10 shadow-2xl">
        <img
          src={album.coverImage}
          alt={album.title}
          className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl object-cover shadow-2xl shrink-0"
        />

        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400">
            Album • {album.genre}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {album.title}
          </h1>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mt-2">
            <span
              onClick={() => navigate(`/artist/${album.artistId}`)}
              className="text-white font-bold hover:underline cursor-pointer"
            >
              {album.artistName}
            </span>
            <span>•</span>
            <span>{album.releaseDate?.split('-')[0] || '2025'}</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
            {totalMinutes > 0 && (
              <>
                <span>•</span>
                <span>{totalMinutes} min</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-4 py-2">
        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          aria-label="Play album"
          className="w-13 h-13 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-violet-600/40 hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </button>

        <button
          onClick={handleShufflePlay}
          disabled={tracks.length === 0}
          aria-label="Shuffle album"
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={handleToggleSave}
          aria-label={isSaved ? 'Remove album from library' : 'Save album to library'}
          className={`p-3 rounded-full transition cursor-pointer ${
            isSaved ? 'bg-violet-600/20 text-violet-400' : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>

        <button
          onClick={handleShare}
          aria-label="Share album"
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Tracklist Table */}
      <div>
        <div className="hidden md:flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 select-none">
          <div className="flex items-center gap-4 flex-1">
            <span className="w-7 text-center">#</span>
            <span>Title</span>
          </div>
          <div className="flex items-center gap-8 shrink-0 pr-4">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-1">
          {tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              queueContext={tracks}
              showAlbum={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
