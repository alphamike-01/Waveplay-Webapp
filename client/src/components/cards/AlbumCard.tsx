import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IAlbum } from '../../types/index.js';
import { Disc } from 'lucide-react';

interface AlbumCardProps {
  album: IAlbum;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/album/${album.id}`)}
      className="group relative flex flex-col p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-violet-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-800">
        <img
          src={album.coverImage}
          alt={album.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-slate-300 flex items-center gap-1">
          <Disc className="w-3 h-3 text-cyan-400" />
          <span>{album.genre}</span>
        </div>
      </div>

      <h4 className="text-sm font-semibold truncate text-white group-hover:text-violet-400 transition">
        {album.title}
      </h4>
      <p className="text-xs text-slate-400 truncate mt-1">{album.artistName}</p>
    </div>
  );
};
