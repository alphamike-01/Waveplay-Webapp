import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
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
} from '../../store/slices/playerSlice.js';
import { toggleLikeTrackAsync } from '../../store/slices/librarySlice.js';
import { toggleQueue } from '../../store/slices/uiSlice.js';
import { formatDuration } from '../cards/TrackRow.js';
import {
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
  Maximize2,
  Heart,
  Gauge
} from 'lucide-react';

export const PlayerBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    playbackRate,
    loading
  } = useAppSelector((state) => state.player);

  const { isQueueOpen } = useAppSelector((state) => state.ui);

  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);

  if (!currentTrack) {
    return null;
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    dispatch(seekTo(val));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    dispatch(setVolume(val));
  };

  const currentVolume = isMuted ? 0 : volume;

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="hidden md:flex fixed bottom-0 left-0 right-0 z-40 h-24 bg-[#0e1017]/95 backdrop-blur-2xl border-t border-white/[0.08] px-6 items-center justify-between select-none">
      {/* 1. LEFT SECTION: Track Info & Like */}
      <div className="flex items-center gap-3.5 w-[30%] min-w-0">
        <div
          onClick={() => navigate('/now-playing')}
          className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer group shadow-md"
        >
          <img
            src={
              currentTrack.coverImage ||
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
            }
            alt={currentTrack.title}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="min-w-0 pr-2">
          <h4
            onClick={() => navigate('/now-playing')}
            className="text-sm font-semibold text-white truncate cursor-pointer hover:underline"
          >
            {currentTrack.title}
          </h4>
          <p
            onClick={() => {
              if (currentTrack.artistId) navigate(`/artist/${currentTrack.artistId}`);
            }}
            className="text-xs text-slate-400 truncate cursor-pointer hover:text-slate-200"
          >
            {currentTrack.artist}
          </p>
        </div>

        <button
          onClick={() => dispatch(toggleLikeTrackAsync(currentTrack))}
          aria-label={currentTrack.liked ? 'Remove from liked' : 'Save to liked'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 transition"
        >
          <Heart
            className={`w-5 h-5 ${
              currentTrack.liked ? 'text-violet-500 fill-violet-500' : 'hover:scale-110'
            }`}
          />
        </button>
      </div>

      {/* 2. CENTER SECTION: Controls & Progress Bar */}
      <div className="flex flex-col items-center gap-1.5 w-[42%] max-w-2xl">
        <div className="flex items-center gap-4">
          {/* Shuffle Toggle */}
          <button
            onClick={() => dispatch(toggleShuffle())}
            aria-label="Toggle shuffle"
            className={`p-1.5 rounded-full transition ${
              shuffle ? 'text-violet-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            onClick={() => dispatch(playPrevious())}
            aria-label="Previous track"
            className="p-1.5 rounded-full text-slate-300 hover:text-white transition hover:scale-105"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => dispatch(togglePlay())}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 text-slate-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={() => dispatch(playNext())}
            aria-label="Next track"
            className="p-1.5 rounded-full text-slate-300 hover:text-white transition hover:scale-105"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Cycle */}
          <button
            onClick={() => dispatch(cycleRepeatMode())}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`p-1.5 rounded-full transition ${
              repeatMode !== 'NONE' ? 'text-violet-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {repeatMode === 'ONE' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Timeline Scrub Slider */}
        <div
          className="flex items-center gap-2.5 w-full"
          onMouseEnter={() => setIsHoveringProgress(true)}
          onMouseLeave={() => setIsHoveringProgress(false)}
        >
          <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
            {formatDuration(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Seek playback position"
            className="flex-1 accent-violet-500"
          />

          <span className="text-[11px] font-mono text-slate-400 w-10">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* 3. RIGHT SECTION: Speed, Queue, Volume, Fullscreen */}
      <div className="flex items-center justify-end gap-3 w-[28%]">
        {/* Playback Speed Menu */}
        <div className="relative">
          <button
            onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
            aria-label="Playback speed"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              playbackRate !== 1.0 ? 'text-violet-400 bg-violet-600/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>{playbackRate}x</span>
          </button>

          {speedMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSpeedMenuOpen(false)} />
              <div className="absolute bottom-full mb-2 right-0 w-28 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-1 z-50 text-xs">
                {speeds.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      dispatch(setPlaybackRate(rate));
                      setSpeedMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      playbackRate === rate ? 'bg-violet-600 text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Queue Drawer Button */}
        <button
          onClick={() => dispatch(toggleQueue())}
          aria-label="Toggle queue"
          className={`p-2 rounded-xl transition ${
            isQueueOpen ? 'text-violet-400 bg-violet-600/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-5 h-5" />
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(toggleMute())}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            {currentVolume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : currentVolume < 0.5 ? (
              <Volume1 className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={currentVolume}
            onChange={handleVolumeChange}
            aria-label="Volume slider"
            className="w-20 lg:w-24 accent-violet-500"
          />
        </div>

        {/* Fullscreen Now Playing Button */}
        <button
          onClick={() => navigate('/now-playing')}
          aria-label="Full-screen now playing"
          className="p-2 rounded-xl text-slate-400 hover:text-white transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
