import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { togglePlay, playNext } from '../../store/slices/playerSlice.js';
import { Play, Pause, SkipForward } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying, currentTime, duration } = useAppSelector((state) => state.player);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => navigate('/now-playing')}
      className="md:hidden fixed bottom-14 left-2 right-2 z-40 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 select-none overflow-hidden cursor-pointer"
    >
      {/* Top micro progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={
              currentTrack.coverImage ||
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
            }
            alt={currentTrack.title}
            className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-md"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
            <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => dispatch(togglePlay())}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md active:scale-90 transition"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => dispatch(playNext())}
            aria-label="Next track"
            className="p-2 text-slate-300 hover:text-white transition"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
