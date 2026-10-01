import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { playTrack, togglePlay } from '../../store/slices/playerSlice.js';
import { toggleLikeTrackAsync } from '../../store/slices/librarySlice.js';
import { ITrack } from '../../types/index.js';
import { ContextMenu } from '../common/ContextMenu.js';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';

interface TrackRowProps {
  track: ITrack;
  index: number;
  queueContext?: ITrack[];
  playlistId?: string;
  onRemoveFromPlaylist?: (trackId: string) => void;
  showAlbum?: boolean;
}

export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  queueContext,
  playlistId,
  onRemoveFromPlaylist,
  showAlbum = true
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentTrack, isPlaying } = useAppSelector((state) => state.player);
  const isCurrentTrack = currentTrack?.id === track.id;

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const handlePlayToggle = () => {
    if (isCurrentTrack) {
      dispatch(togglePlay());
    } else {
      dispatch(playTrack({ track, queue: queueContext, index }));
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLikeTrackAsync(track));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleThreeDotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuPos({ x: rect.left, y: rect.bottom + 5 });
  };

  return (
    <>
      <div
        onDoubleClick={handlePlayToggle}
        onContextMenu={handleContextMenu}
        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition duration-150 select-none ${
          isCurrentTrack ? 'bg-violet-500/10 text-violet-400' : 'text-slate-300'
        }`}
      >
        {/* Left: Index / Play Icon & Track Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-7 text-center shrink-0 flex items-center justify-center">
            {isCurrentTrack && isPlaying ? (
              <div className="flex items-end gap-[2px] h-3.5">
                <span className="sound-bar" />
                <span className="sound-bar" />
                <span className="sound-bar" />
              </div>
            ) : (
              <>
                <span className={`text-xs font-semibold text-slate-500 group-hover:hidden ${isCurrentTrack ? 'text-violet-400' : ''}`}>
                  {index + 1}
                </span>
                <button
                  onClick={handlePlayToggle}
                  aria-label={isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
                  className="hidden group-hover:flex items-center justify-center text-white hover:text-violet-400 transition"
                >
                  {isCurrentTrack && isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </>
            )}
          </div>

          {track.coverImage && (
            <img
              src={track.coverImage}
              alt={track.title}
              className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
            />
          )}

          <div className="min-w-0 flex-1 pr-2">
            <h4
              onClick={handlePlayToggle}
              className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                isCurrentTrack ? 'text-violet-400' : 'text-white'
              }`}
            >
              {track.title}
            </h4>
            <p
              onClick={(e) => {
                e.stopPropagation();
                if (track.artistId) navigate(`/artist/${track.artistId}`);
              }}
              className="text-xs text-slate-400 truncate hover:text-slate-200 cursor-pointer"
            >
              {track.artist}
            </p>
          </div>
        </div>

        {/* Middle: Album Name (Desktop) */}
        {showAlbum && (
          <div className="hidden md:block flex-1 min-w-0 px-4">
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (track.albumId) navigate(`/album/${track.albumId}`);
              }}
              className="text-xs text-slate-400 truncate hover:text-slate-200 cursor-pointer block"
            >
              {track.album || '—'}
            </span>
          </div>
        )}

        {/* Right: Like, Duration & 3-dot Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleLike}
            aria-label={track.liked ? 'Remove from liked' : 'Save to liked'}
            className="p-1 rounded-lg text-slate-400 hover:text-violet-400 transition"
          >
            <Heart
              className={`w-4 h-4 ${track.liked ? 'text-violet-500 fill-violet-500' : 'opacity-0 group-hover:opacity-100'}`}
            />
          </button>

          <span className="text-xs font-mono text-slate-400 w-10 text-right">
            {formatDuration(track.duration)}
          </span>

          <button
            onClick={handleThreeDotClick}
            aria-label="Track options"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {contextMenuPos && (
        <ContextMenu
          track={track}
          position={contextMenuPos}
          onClose={() => setContextMenuPos(null)}
          playlistId={playlistId}
          onRemoveFromPlaylist={onRemoveFromPlaylist}
        />
      )}
    </>
  );
};
