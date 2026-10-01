import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/index.js';
import { playTrack } from '../store/slices/playerSlice.js';
import { api } from '../services/api.js';
import { ITrack, IArtist, IAlbum, IPlaylist } from '../types/index.js';
import { TrackRow } from '../components/cards/TrackRow.js';
import { ArtistCard } from '../components/cards/ArtistCard.js';
import { AlbumCard } from '../components/cards/AlbumCard.js';
import { PlaylistCard } from '../components/cards/PlaylistCard.js';
import { Search, History, X, Play, Music, Sparkles } from 'lucide-react';

const GENRE_CARDS = [
  { name: 'Synthwave', color: 'from-violet-600 to-indigo-900', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80' },
  { name: 'Lo-fi', color: 'from-amber-600 to-rose-900', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80' },
  { name: 'Rock', color: 'from-red-600 to-orange-900', img: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&auto=format&fit=crop&q=80' },
  { name: 'Electronic', color: 'from-cyan-600 to-blue-900', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80' },
  { name: 'Classical', color: 'from-emerald-600 to-teal-900', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80' },
  { name: 'Jazz', color: 'from-amber-700 to-stone-900', img: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&auto=format&fit=crop&q=80' },
  { name: 'Pop', color: 'from-pink-600 to-purple-900', img: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400&auto=format&fit=crop&q=80' },
  { name: 'Indian & World', color: 'from-orange-600 to-amber-900', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop&q=80' },
  { name: 'Ambient', color: 'from-teal-600 to-slate-900', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80' }
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [isSearching, setIsSearching] = useState(false);

  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [artists, setArtists] = useState<IArtist[]>([]);
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('waveplay_recent_searches');
    return saved ? JSON.parse(saved) : ['Aetheria', 'Synthwave', 'Lo-fi', 'Jazz'];
  });

  // Sync state if queryParam changes via TopBar
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
      setPlaylists([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search.query(searchTerm.trim());
        setTracks(res.tracks || []);
        setArtists(res.artists || []);
        setAlbums(res.albums || []);
        setPlaylists(res.playlists || []);

        // Save to recent searches if new
        setRecentSearches((prev) => {
          const updated = [searchTerm.trim(), ...prev.filter((s) => s.toLowerCase() !== searchTerm.trim().toLowerCase())].slice(0, 8);
          localStorage.setItem('waveplay_recent_searches', JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('waveplay_recent_searches');
  };

  const hasResults = tracks.length > 0 || artists.length > 0 || albums.length > 0 || playlists.length > 0;
  const topResult = tracks[0] || artists[0] || albums[0];

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Search Input Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSearchParams(e.target.value ? { q: e.target.value } : {});
          }}
          placeholder="What do you want to play?"
          className="w-full pl-12 pr-10 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/10 focus:border-violet-500 text-base text-white placeholder-slate-400 outline-none transition"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSearchParams({});
            }}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* When NO query: Show Recent Searches & Browse All Genres */}
      {!searchTerm.trim() && (
        <>
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-white">Recent searches</h3>
                </div>
                <button
                  onClick={handleClearRecent}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchTerm(item);
                      setSearchParams({ q: item });
                    }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/5 transition"
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Browse Categories */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Browse all genres</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {GENRE_CARDS.map((g) => (
                <div
                  key={g.name}
                  onClick={() => {
                    setSearchTerm(g.name);
                    setSearchParams({ q: g.name });
                  }}
                  className={`group relative aspect-[4/3] rounded-2xl overflow-hidden p-4 bg-gradient-to-br ${g.color} shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all`}
                >
                  <h3 className="text-base sm:text-lg font-bold text-white z-10 relative">
                    {g.name}
                  </h3>
                  <img
                    src={g.img}
                    alt={g.name}
                    className="absolute -bottom-2 -right-3 w-20 h-20 rounded-lg object-cover rotate-[25deg] shadow-2xl group-hover:rotate-[15deg] group-hover:scale-110 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* When SEARCHING with results */}
      {searchTerm.trim() && (
        <>
          {isSearching ? (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
              Searching WavePlay catalog...
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <Music className="w-12 h-12 mb-3 text-violet-400 opacity-40" />
              <h3 className="text-lg font-bold text-white mb-1">No results found for "{searchTerm}"</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Please make sure your words are spelled correctly, or try searching for a different artist, track or genre.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Top Result + Songs Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Top Result Card */}
                {topResult && 'artist' in topResult && (
                  <div className="lg:col-span-5 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-3">Top result</h3>
                    <div
                      onClick={() => dispatch(playTrack({ track: topResult as ITrack }))}
                      className="group relative flex-1 flex flex-col justify-between p-6 rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all duration-300 cursor-pointer shadow-lg"
                    >
                      <div>
                        <img
                          src={(topResult as ITrack).coverImage}
                          alt={(topResult as ITrack).title}
                          className="w-24 h-24 rounded-2xl object-cover shadow-lg mb-4"
                        />
                        <h4 className="text-2xl font-black text-white group-hover:text-violet-400 transition">
                          {(topResult as ITrack).title}
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                          Song • {(topResult as ITrack).artist}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(playTrack({ track: topResult as ITrack }));
                        }}
                        aria-label={`Play ${(topResult as ITrack).title}`}
                        className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/40 opacity-0 group-hover:opacity-100 group-hover:scale-110 active:scale-95 transition self-end"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Top Songs */}
                {tracks.length > 0 && (
                  <div className="lg:col-span-7 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-3">Songs</h3>
                    <div className="flex flex-col gap-1">
                      {tracks.slice(0, 4).map((track, i) => (
                        <TrackRow key={track.id} track={track} index={i} queueContext={tracks} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Artists Section */}
              {artists.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Artists</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {artists.slice(0, 6).map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                </div>
              )}

              {/* Albums Section */}
              {albums.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Albums</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {albums.slice(0, 5).map((album) => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
                  </div>
                </div>
              )}

              {/* Playlists Section */}
              {playlists.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Playlists</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {playlists.slice(0, 5).map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
