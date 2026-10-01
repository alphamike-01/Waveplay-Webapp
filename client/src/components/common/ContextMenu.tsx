import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/index.js';
import { playTrack, playNextInQueue, addToQueue } from '../../store/slices/playerSlice.js';
import { toggleLikeTrackAsync } from '../../store/slices/librarySlice.js';
import { openAddToPlaylistModal, addToast } from '../../store/slices/uiSlice.js';
import { ITrack } from '../../types/index.js';
import {
  Play,
  ListPlus,
  Radio,
  Heart,
  User,
  Disc,
  Share2,
  Trash2
} from 'lucide-react';

interface ContextMenuProps {
  track: ITrack;
  position: { x: number; y: number };
  onClose: () => void;
  playlistId?: string;
  onRemoveFromPlaylist?: (trackId: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  track,
  position,
  onClose,
  playlistId,
  onRemoveFromPlaylist
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust position so menu never goes outside viewport
  const style: React.CSSProperties = {
    top: Math.min(position.y, window.innerHeight - 340),
    left: Math.min(position.x, window.innerWidth - 240)
  };

  const handlePlay = () => {
    dispatch(playTrack({ track }));
    onClose();
  };

  const handlePlayNext = () => {
    dispatch(playNextInQueue(track));
    dispatch(addToast({ message: `"${track.title}" will play next`, type: 'info' }));
    onClose();
  };

  const handleAddToQueue = () => {
    dispatch(addToQueue(track));
    dispatch(addToast({ message: `Added "${track.title}" to queue`, type: 'success' }));
    onClose();
  };

  const handleLike = () => {
    dispatch(toggleLikeTrackAsync(track));
    onClose();
  };

  const handleAddToPlaylist = () => {
    dispatch(openAddToPlaylistModal(track));
    onClose();
  };

  const handleGoToArtist = () => {
    if (track.artistId) {
      navigate(`/artist/${track.artistId}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(track.artist)}`);
    }
    onClose();
  };

  const handleGoToAlbum = () => {
    if (track.albumId) {
      navigate(`/album/${track.albumId}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(track.album || track.title)}`);
    }
    onClose();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/track/${track.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${track.title} - ${track.artist} | WavePlay`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      dispatch(addToast({ message: 'Share link copied to clipboard!', type: 'success' }));
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={style}
      className="fixed z-50 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 shadow-2xl p-1.5 text-sm text-slate-200 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <button
        onClick={handlePlay}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-violet-600/20 hover:text-white transition group"
      >
        <Play className="w-4 h-4 text-violet-400 group-hover:scale-110 transition shrink-0" />
        <span>Play now</span>
      </button>

      <button
        onClick={handlePlayNext}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition group"
      >
        <Radio className="w-4 h-4 text-slate-400 group-hover:text-white transition shrink-0" />
        <span>Play next</span>
      </button>

      <button
        onClick={handleAddToQueue}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition group"
      >
        <ListPlus className="w-4 h-4 text-slate-400 group-hover:text-white transition shrink-0" />
        <span>Add to queue</span>
      </button>

      <div className="my-1 border-t border-slate-800" />

      <button
        onClick={handleLike}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition group"
      >
        <Heart className={`w-4 h-4 ${track.liked ? 'text-violet-500 fill-violet-500' : 'text-slate-400'} group-hover:scale-110 transition shrink-0`} />
        <span>{track.liked ? 'Remove from Liked' : 'Save to Liked Songs'}</span>
      </button>

      <button
        onClick={handleAddToPlaylist}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition group"
      >
        <ListPlus className="w-4 h-4 text-slate-400 group-hover:text-white transition shrink-0" />
        <span>Add to playlist</span>
      </button>

      <div className="my-1 border-t border-slate-800" />

      <button
        onClick={handleGoToArtist}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition group"
      >
        <User className="w-4 h-4 text-slate-400 group-hover:text-white transition shrink-0" />
        <span>Go to artist</span>
      </button>

      {track.album && (
        <button
          onClick={handleGoToAlbum}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition group"
        >
          <Disc className="w-4 h-4 text-slate-400 group-hover:text-white transition shrink-0" />
          <span>Go to album</span>
        </button>
      )}

      <button
        onClick={handleShare}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition group"
      >
        <Share2 className="w-4 h-4 text-slate-400 group-hover:text-white transition shrink-0" />
        <span>Share track</span>
      </button>

      {playlistId && onRemoveFromPlaylist && (
        <>
          <div className="my-1 border-t border-slate-800" />
          <button
            onClick={() => {
              onRemoveFromPlaylist(track.id);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition group"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition shrink-0" />
            <span>Remove from playlist</span>
          </button>
        </>
      )}
    </div>
  );
};
