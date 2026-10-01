import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { playTrack } from '../store/slices/playerSlice.js';
import { api } from '../services/api.js';
import { ITrack, IPlaylist, IArtist, IAlbum } from '../types/index.js';
import { TrackCard } from '../components/cards/TrackCard.js';
import { PlaylistCard } from '../components/cards/PlaylistCard.js';
import { ArtistCard } from '../components/cards/ArtistCard.js';
import { AlbumCard } from '../components/cards/AlbumCard.js';
import { TrackRow } from '../components/cards/TrackRow.js';
import { CardSkeleton } from '../components/common/SkeletonLoader.js';
import { Play, Sparkles, Flame, Radio, Disc } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [popularTracks, setPopularTracks] = useState<ITrack[]>([]);
  const [madeForYou, setMadeForYou] = useState<ITrack[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<IPlaylist[]>([]);
  const [topArtists, setTopArtists] = useState<IArtist[]>([]);
  const [newAlbums, setNewAlbums] = useState<IAlbum[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const loadData = async () => {
      try {
        const [recData, popData] = await Promise.all([
          api.recommendations.get(),
          api.tracks.getPopular(10)
        ]);

        if (recData.success) {
          setMadeForYou(recData.madeForYou || []);
          setFeaturedPlaylists(recData.featuredPlaylists || []);
          setTopArtists(recData.topArtists || []);
          setNewAlbums(recData.newAlbums || []);
        }

        if (popData.success) {
          setPopularTracks(popData.tracks || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Hero Welcome & Quick Shortcuts */}
      <section className="relative pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-5">
          {greeting}{user ? `, ${user.name}` : ''}
        </h1>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featuredPlaylists.slice(0, 6).map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="group flex items-center justify-between rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/5 transition-all duration-200 cursor-pointer overflow-hidden shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                <img
                  src={
                    playlist.coverImage ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={playlist.name}
                  className="w-16 h-16 object-cover shrink-0"
                />
                <span className="text-sm font-bold text-white truncate group-hover:text-violet-300 transition">
                  {playlist.name}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (playlist.tracks && playlist.tracks.length > 0) {
                    dispatch(playTrack({ track: playlist.tracks[0], queue: playlist.tracks }));
                  } else {
                    navigate(`/playlist/${playlist.id}`);
                  }
                }}
                aria-label={`Play ${playlist.name}`}
                className="w-10 h-10 mr-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-black/40 opacity-0 group-hover:opacity-100 group-hover:scale-105 active:scale-95 transition shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Made For You Carousel/Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Made For You</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Personalized daily mix</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {madeForYou.map((track) => (
              <TrackCard key={track.id} track={track} queueContext={madeForYou} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Tracks Table View */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Popular Tracks</h2>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="text-xs font-semibold text-violet-400 hover:underline"
          >
            Show all
          </button>
        </div>

        <div className="flex flex-col gap-1 rounded-2xl bg-white/[0.02] border border-white/5 p-2">
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

      {/* Featured Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Featured Playlists</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {featuredPlaylists.slice(0, 5).map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </section>

      {/* New Releases & Albums */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Recommended Albums</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {newAlbums.slice(0, 5).map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>

      {/* Top Artists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Top Artists</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>
    </div>
  );
};
