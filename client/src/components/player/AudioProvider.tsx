import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { AudioEngine } from '../../features/player/AudioEngine.js';
import {
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setLoading,
  setError,
  playNext,
  playPrevious,
  clearSeekTarget,
  togglePlay,
  toggleMute,
  seekTo
} from '../../store/slices/playerSlice.js';
import { toggleLikeTrackAsync, recordHistoryLocal } from '../../store/slices/librarySlice.js';
import { api } from '../../services/api.js';

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const engineRef = useRef<AudioEngine | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    seekTarget,
    currentTime
  } = useAppSelector((state) => state.player);

  const { crossfade, autoplay } = useAppSelector((state) => state.settings);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Initialize AudioEngine once at root
  useEffect(() => {
    const engine = new AudioEngine({
      onTimeUpdate: (time) => {
        dispatch(setCurrentTime(time));
      },
      onDurationChange: (dur) => {
        dispatch(setDuration(dur));
      },
      onPlayStateChange: (playing) => {
        dispatch(setIsPlaying(playing));
      },
      onLoadingChange: (loading) => {
        dispatch(setLoading(loading));
      },
      onTrackEnded: () => {
        if (autoplay) {
          dispatch(playNext());
        } else {
          dispatch(setIsPlaying(false));
        }
      },
      onError: (errMsg) => {
        dispatch(setError(errMsg));
      }
    });

    engine.setCrossfadeDuration(crossfade);
    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  // Update crossfade duration
  useEffect(() => {
    engineRef.current?.setCrossfadeDuration(crossfade);
  }, [crossfade]);

  // Load new track when currentTrack changes
  const prevTrackIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentTrack && currentTrack.id !== prevTrackIdRef.current) {
      prevTrackIdRef.current = currentTrack.id;
      engineRef.current?.loadTrack(currentTrack, isPlaying);

      // Record playback to backend & local history
      dispatch(recordHistoryLocal(currentTrack));
      if (isAuthenticated) {
        api.library.recordPlayback(currentTrack.id, 0, false).catch(() => {});
      }
    }
  }, [currentTrack, isAuthenticated]);

  // Sync play / pause state
  useEffect(() => {
    if (!engineRef.current || !currentTrack) return;
    if (isPlaying) {
      engineRef.current.play();
    } else {
      engineRef.current.pause();
    }
  }, [isPlaying]);

  // Sync seekTarget
  useEffect(() => {
    if (seekTarget !== null && engineRef.current) {
      engineRef.current.seek(seekTarget);
      dispatch(clearSeekTarget());
    }
  }, [seekTarget]);

  // Sync volume & mute
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setVolume(volume);
      engineRef.current.setMuted(isMuted);
    }
  }, [volume, isMuted]);

  // Sync playback speed
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  // Setup MediaSession next/prev action handlers
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setMediaSessionAction('nexttrack', () => dispatch(playNext()));
      engineRef.current.setMediaSessionAction('previoustrack', () => dispatch(playPrevious()));
    }
  }, []);

  // Global Keyboard Shortcuts (Requirement #32)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        dispatch(togglePlay());
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        dispatch(seekTo(Math.max(0, currentTime - 5)));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        dispatch(seekTo(currentTime + 5));
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        dispatch(toggleMute());
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        dispatch(playNext());
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        dispatch(playPrevious());
      } else if (e.key.toLowerCase() === 'l' && currentTrack) {
        e.preventDefault();
        dispatch(toggleLikeTrackAsync(currentTrack));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, currentTrack]);

  return <>{children}</>;
};
