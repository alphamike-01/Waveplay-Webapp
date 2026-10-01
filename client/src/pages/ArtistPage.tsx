import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { playTrack } from '../store/slices/playerSlice.js';
import { api } from '../services/api.js';
import { IArtist, ITrack, IAlbum } from '../types/index.js';
import { TrackRow } from '../components/cards/TrackRow.js';
import { AlbumCard } from '../components/cards/AlbumCard.js';
import { addToast } from '../store/slices/uiSlice.js';
import { Play, CheckCircle2, UserPlus, UserCheck, Share2 } from 'lucide-react';

export const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [artist, setArtist] = useState<IArtist | null>(null);
  const [popularTracks, setPopularTracks] = useState<ITrack[]>([]);
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.artists.getById(id)
      .then((data) => {
        if (data.artist) {
          setArtist(data.artist);
          setIsFollowing(!!data.artist.isFollowing);
          setPopularTracks(data.popularTracks || []);
          setAlbums(data.albums || []);
        }
      })
      .catch((err) => console.error('Failed to load artist:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400 animate-pulse">Loading artist...</div>;
  }

  if (!artist) {
    return (
      <div className="py-20 text-center text-slate-400">
        <h3 className="text-lg font-bold text-white mb-2">Artist not found</h3>
        <button onClick={() => navigate('/')} className="text-xs text-violet-400 underline font-semibold">
          Return to Home
        </button>
      </div>
    );
  }

  const handlePlayArtist = () => {
    if (popularTracks.length > 0) {
      dispatch(playTrack({ track: popularTracks[0], queue: popularTracks, index: 0 }));
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      setIsFollowing(!isFollowing);
      dispatch(addToast({ message: isFollowing ? `Unfollowed ${artist.name}` : `Following ${artist.name}`, type: 'info' }));
      return;
    }
    try {
      const res = await api.library.toggleFollowArtist(artist.id);
      setIsFollowing(res.followed);
      dispatch(addToast({ message: res.followed ? `Now following ${artist.name}` : `Unfollowed ${artist.name}`, type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Action failed', type: 'error' }));
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${artist.name} on WavePlay`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      dispatch(addToast({ message: 'Artist link copied to clipboard!', type: 'success' }));
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Artist Hero Header */}
      <div className="relative rounded-3xl overflow-hidden min-h-[280px] sm:min-h-[340px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl bg-slate-900 border border-white/10">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full h-full object-cover object-center filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-[#0c0d12]/60 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {artist.verified && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Artist</span>
              </span>
            )}
            <span className="text-xs text-slate-300 font-medium">
              {artist.followers.toLocaleString()} followers
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            {artist.name}
          </h1>

          {artist.monthlyListeners && (
            <p className="text-xs sm:text-sm font-semibold text-slate-300">
              {artist.monthlyListeners.toLocaleString()} monthly listeners
            </p>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayArtist}
          disabled={popularTracks.length === 0}
          aria-label={`Play popular tracks by ${artist.name}`}
          className="w-13 h-13 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-violet-600/40 hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </button>

        <button
          onClick={handleToggleFollow}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition border cursor-pointer ${
            isFollowing
              ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300'
              : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Follow</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          aria-label="Share artist"
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Popular Tracks */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Popular</h2>
        <div className="flex flex-col gap-1">
          {popularTracks.slice(0, 5).map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              queueContext={popularTracks}
            />
          ))}
        </div>
      </section>

      {/* Discography / Albums */}
      {albums.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* About / Bio Card */}
      {artist.bio && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">About</h2>
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/5 max-w-3xl">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {artist.bio}
            </p>
            {artist.genres && artist.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                {artist.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-400"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
