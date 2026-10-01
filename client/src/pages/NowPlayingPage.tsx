import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import {
  togglePlay,
  playNext,
  playPrevious,
  seekTo,
  setVolume,
  toggleMute,
  toggleShuffle,
  cycleRepeatMode,
  setPlaybackRate
} from '../store/slices/playerSlice.js';
import { toggleLikeTrackAsync } from '../store/slices/librarySlice.js';
import { toggleQueue, openAddToPlaylistModal } from '../store/slices/uiSlice.js';
import { formatDuration } from '../components/cards/TrackRow.js';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  Heart,
  PlusCircle,
  Gauge,
  Sparkles,
  Info
} from 'lucide-react';

export const NowPlayingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    playbackRate
  } = useAppSelector((state) => state.player);

  const [activeTab, setActiveTab] = useState<'visualizer' | 'about'>('visualizer');

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 text-slate-400">
        <Sparkles className="w-12 h-12 mb-3 text-violet-400 opacity-40" />
        <h3 className="text-xl font-bold text-white mb-2">No song currently playing</h3>
        <p className="text-xs text-slate-500 mb-4">Choose a track from Home or Search to begin.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg transition"
        >
          Explore Music
        </button>
      </div>
    );
  }

  const currentVolume = isMuted ? 0 : volume;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(seekTo(parseFloat(e.target.value)));
  };

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-between p-4 sm:p-8 max-w-4xl mx-auto select-none">
      {/* Background ambient lighting blur */}
      <div
        className="absolute inset-0 -z-10 opacity-30 blur-3xl pointer-events-none rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(139, 92, 246, 0.5) 0%, rgba(6, 182, 212, 0.3) 50%, transparent 70%)`
        }}
      />

      {/* Top Header: Collapse button and Track/Album badge */}
      <div className="flex items-center justify-between w-full mb-6">
        <button
          onClick={() => navigate(-1)}
          aria-label="Minimize full player"
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-violet-400">
            Playing From
          </span>
          <p className="text-xs font-semibold text-slate-300 truncate max-w-[200px] sm:max-w-xs">
            {currentTrack.album || 'WavePlay Catalog'}
          </p>
        </div>

        <button
          onClick={() => dispatch(toggleQueue())}
          aria-label="Toggle queue"
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>

      {/* Centerpiece Artwork or Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        {activeTab === 'visualizer' ? (
          <div className="relative flex flex-col items-center">
            {/* Vinyl record sleeve effect */}
            <div
              className={`relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-violet-950/50 border border-white/10 ${
                isPlaying ? 'ring-4 ring-violet-500/20' : ''
              }`}
            >
              <img
                src={
                  currentTrack.coverImage ||
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
                }
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Audio Wave Visualizer Bars */}
            <div className="flex items-end gap-1.5 h-12 mt-6">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-violet-500 to-cyan-400'
                      : 'bg-white/20'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(8, Math.sin(i * 0.5 + Date.now() * 0.001) * 20 + 24)}px` : '6px',
                    animation: isPlaying ? `wave-pulse 1.${(i % 5) + 1}s infinite ease-in-out` : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900/80 border border-white/10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">{currentTrack.title}</h3>
            <p className="text-sm text-violet-400 mb-4">{currentTrack.artist}</p>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-300 text-left pt-4 border-t border-white/10">
              <div>
                <span className="text-slate-500 block">Album</span>
                <strong>{currentTrack.album || 'WavePlay Single'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Genre</span>
                <strong>{currentTrack.genre || 'Electronic'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Source</span>
                <strong className="text-cyan-400">{currentTrack.sourceType || 'STREAM'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Play Count</span>
                <strong>{(currentTrack.playCount || 0).toLocaleString()} streams</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Audio Controller Panel */}
      <div className="w-full flex flex-col gap-4">
        {/* Track Title, Artist, & Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white truncate">
              {currentTrack.title}
            </h2>
            <p
              onClick={() => {
                if (currentTrack.artistId) navigate(`/artist/${currentTrack.artistId}`);
              }}
              className="text-base text-slate-300 font-semibold truncate hover:text-white cursor-pointer mt-0.5"
            >
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => dispatch(toggleLikeTrackAsync(currentTrack))}
              aria-label={currentTrack.liked ? 'Remove from liked' : 'Save to liked'}
              className="p-2 rounded-full hover:bg-white/10 transition"
            >
              <Heart
                className={`w-7 h-7 ${
                  currentTrack.liked ? 'text-violet-500 fill-violet-500' : 'text-slate-400 hover:text-white'
                }`}
              />
            </button>

            <button
              onClick={() => dispatch(openAddToPlaylistModal(currentTrack))}
              aria-label="Add to playlist"
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <PlusCircle className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Scrubbing Timeline */}
        <div className="flex flex-col gap-1.5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Seek playback position"
            className="w-full h-1.5 accent-violet-500"
          />
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-between pt-2">
          {/* Shuffle */}
          <button
            onClick={() => dispatch(toggleShuffle())}
            aria-label="Toggle shuffle"
            className={`p-3 rounded-full transition ${
              shuffle ? 'text-violet-400 bg-violet-600/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={() => dispatch(playPrevious())}
            aria-label="Previous track"
            className="p-3 rounded-full text-slate-200 hover:text-white hover:scale-110 active:scale-95 transition"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          {/* Large Play/Pause */}
          <button
            onClick={() => dispatch(togglePlay())}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 text-slate-900 flex items-center justify-center shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={() => dispatch(playNext())}
            aria-label="Next track"
            className="p-3 rounded-full text-slate-200 hover:text-white hover:scale-110 active:scale-95 transition"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={() => dispatch(cycleRepeatMode())}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`p-3 rounded-full transition ${
              repeatMode !== 'NONE' ? 'text-violet-400 bg-violet-600/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            {repeatMode === 'ONE' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Secondary Utility Controls: Volume & Speed */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleMute())}
              aria-label="Mute / Unmute"
              className="p-1 text-slate-400 hover:text-white"
            >
              {currentVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={currentVolume}
              onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
              className="w-24 accent-violet-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {speeds.map((rate) => (
              <button
                key={rate}
                onClick={() => dispatch(setPlaybackRate(rate))}
                className={`px-2 py-0.5 rounded-md font-semibold transition ${
                  playbackRate === rate ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
