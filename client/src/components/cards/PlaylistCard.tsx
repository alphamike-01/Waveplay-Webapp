import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/index.js';
import { playTrack } from '../../store/slices/playerSlice.js';
import { IPlaylist } from '../../types/index.js';
import { Play } from 'lucide-react';

interface PlaylistCardProps {
  playlist: IPlaylist;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handlePlayPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.tracks && playlist.tracks.length > 0) {
      dispatch(playTrack({ track: playlist.tracks[0], queue: playlist.tracks, index: 0 }));
    } else {
      navigate(`/playlist/${playlist.id}`);
    }
  };

  return (
    <div
      onClick={() => navigate(`/playlist/${playlist.id}`)}
      className="group relative flex flex-col p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-violet-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-800">
        <img
          src={
            playlist.coverImage ||
            (playlist.tracks?.[0]?.coverImage) ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
          }
          alt={playlist.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        <button
          onClick={handlePlayPlaylist}
          aria-label={`Play ${playlist.name}`}
          className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-black/50 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 transition-all duration-200"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </button>
      </div>

      <h4 className="text-sm font-semibold truncate text-white group-hover:text-violet-400 transition">
        {playlist.name}
      </h4>
      <p className="text-xs text-slate-400 truncate mt-1 line-clamp-1">
        {playlist.description || `By ${playlist.ownerName}`}
      </p>
    </div>
  );
};
