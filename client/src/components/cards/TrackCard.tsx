import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { playTrack, togglePlay } from '../../store/slices/playerSlice.js';
import { ITrack } from '../../types/index.js';
import { Play, Pause } from 'lucide-react';

interface TrackCardProps {
  track: ITrack;
  queueContext?: ITrack[];
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, queueContext }) => {
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying } = useAppSelector((state) => state.player);
  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      dispatch(togglePlay());
    } else {
      dispatch(playTrack({ track, queue: queueContext }));
    }
  };

  return (
    <div
      onClick={handlePlayToggle}
      className="group relative flex flex-col p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-violet-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-800">
        <img
          src={track.coverImage}
          alt={track.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Floating play button on hover */}
        <button
          onClick={handlePlayToggle}
          aria-label={isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
          className={`absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-black/50 transition-all duration-200 ${
            isCurrentTrack && isPlaying
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110'
          }`}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      <h4 className={`text-sm font-semibold truncate ${isCurrentTrack ? 'text-violet-400' : 'text-white'}`}>
        {track.title}
      </h4>
      <p className="text-xs text-slate-400 truncate mt-1">{track.artist}</p>
    </div>
  );
};
