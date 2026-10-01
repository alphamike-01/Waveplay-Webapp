import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IArtist } from '../../types/index.js';
import { CheckCircle2 } from 'lucide-react';

interface ArtistCardProps {
  artist: IArtist;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/artist/${artist.id}`)}
      className="group relative flex flex-col items-center text-center p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-violet-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
    >
      <div className="relative aspect-square w-32 rounded-full overflow-hidden mb-3 bg-slate-800 shadow-md">
        <img
          src={artist.image}
          alt={artist.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>

      <div className="flex items-center gap-1.5 max-w-full">
        <h4 className="text-sm font-semibold truncate text-white group-hover:text-violet-400 transition">
          {artist.name}
        </h4>
        {artist.verified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
      </div>
      <p className="text-xs text-slate-400 truncate mt-1">Artist</p>
    </div>
  );
};
