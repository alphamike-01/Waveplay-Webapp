import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ITrack, RepeatMode } from '../../types/index.js';

export interface PlayerState {
  currentTrack: ITrack | null;
  queue: ITrack[];
  originalQueue: ITrack[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  playbackRate: number;
  loading: boolean;
  error: string | null;
  seekTarget: number | null; // Trigger seek in AudioEngine
}

const savedVolume = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('waveplay_volume') : null;

const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: savedVolume ? parseFloat(savedVolume) : 0.8,
  isMuted: false,
  shuffle: false,
  repeatMode: 'NONE',
  playbackRate: 1.0,
  loading: false,
  error: null,
  seekTarget: null
};

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[], currentTrackId?: string): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  // Keep the current playing track first if specified
  if (currentTrackId) {
    const idx = result.findIndex((t: any) => t.id === currentTrackId);
    if (idx > -1) {
      const [current] = result.splice(idx, 1);
      result.unshift(current);
    }
  }
  return result;
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    playTrack: (
      state,
      action: PayloadAction<{ track: ITrack; queue?: ITrack[]; index?: number }>
    ) => {
      const { track, queue, index } = action.payload;
      state.currentTrack = track;
      state.currentTime = 0;
      state.duration = track.duration || 0;
      state.isPlaying = true;
      state.error = null;
      state.loading = true;

      if (queue && queue.length > 0) {
        state.originalQueue = [...queue];
        if (state.shuffle) {
          state.queue = shuffleArray(queue, track.id);
          state.currentIndex = 0;
        } else {
          state.queue = [...queue];
          state.currentIndex = index !== undefined && index >= 0 ? index : queue.findIndex((t) => t.id === track.id);
        }
      } else if (!state.queue.some((t) => t.id === track.id)) {
        state.queue = [track, ...state.queue];
        state.originalQueue = [track, ...state.originalQueue];
        state.currentIndex = 0;
      }
    },

    togglePlay: (state) => {
      if (!state.currentTrack) return;
      state.isPlaying = !state.isPlaying;
    },

    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },

    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },

    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },

    seekTo: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
      state.seekTarget = action.payload;
    },

    clearSeekTarget: (state) => {
      state.seekTarget = null;
    },

    playNext: (state) => {
      if (state.repeatMode === 'ONE' && state.currentTrack) {
        state.currentTime = 0;
        state.seekTarget = 0;
        state.isPlaying = true;
        return;
      }

      if (state.queue.length === 0) return;

      const nextIndex = state.currentIndex + 1;
      if (nextIndex < state.queue.length) {
        state.currentIndex = nextIndex;
        state.currentTrack = state.queue[nextIndex];
        state.currentTime = 0;
        state.duration = state.currentTrack.duration || 0;
        state.isPlaying = true;
        state.loading = true;
        state.error = null;
      } else if (state.repeatMode === 'ALL') {
        state.currentIndex = 0;
        state.currentTrack = state.queue[0];
        state.currentTime = 0;
        state.duration = state.currentTrack.duration || 0;
        state.isPlaying = true;
        state.loading = true;
        state.error = null;
      } else {
        state.isPlaying = false;
      }
    },

    playPrevious: (state) => {
      // If current track has played for more than 3 seconds, restart it
      if (state.currentTime > 3) {
        state.currentTime = 0;
        state.seekTarget = 0;
        return;
      }

      if (state.queue.length === 0) return;

      const prevIndex = state.currentIndex - 1;
      if (prevIndex >= 0) {
        state.currentIndex = prevIndex;
        state.currentTrack = state.queue[prevIndex];
        state.currentTime = 0;
        state.duration = state.currentTrack.duration || 0;
        state.isPlaying = true;
        state.loading = true;
        state.error = null;
      } else {
        state.currentTime = 0;
        state.seekTarget = 0;
      }
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
      state.isMuted = action.payload === 0;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('waveplay_volume', action.payload.toString());
      }
    },

    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },

    toggleShuffle: (state) => {
      const nextShuffle = !state.shuffle;
      state.shuffle = nextShuffle;

      if (nextShuffle) {
        state.queue = shuffleArray(state.queue, state.currentTrack?.id);
        state.currentIndex = 0;
      } else {
        state.queue = [...state.originalQueue];
        if (state.currentTrack) {
          state.currentIndex = state.queue.findIndex((t) => t.id === state.currentTrack?.id);
        }
      }
    },

    cycleRepeatMode: (state) => {
      if (state.repeatMode === 'NONE') state.repeatMode = 'ALL';
      else if (state.repeatMode === 'ALL') state.repeatMode = 'ONE';
      else state.repeatMode = 'NONE';
    },

    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },

    addToQueue: (state, action: PayloadAction<ITrack>) => {
      state.queue.push(action.payload);
      state.originalQueue.push(action.payload);
    },

    playNextInQueue: (state, action: PayloadAction<ITrack>) => {
      const insertIndex = state.currentIndex + 1;
      state.queue.splice(insertIndex, 0, action.payload);
      state.originalQueue.splice(insertIndex, 0, action.payload);
    },

    removeFromQueue: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index === state.currentIndex) {
        // If removing currently playing track, move to next
        if (state.queue.length > 1) {
          playerSlice.caseReducers.playNext(state);
        } else {
          state.currentTrack = null;
          state.isPlaying = false;
        }
      } else if (index < state.currentIndex) {
        state.currentIndex -= 1;
      }
      state.queue.splice(index, 1);
    },

    clearQueue: (state) => {
      if (state.currentTrack) {
        state.queue = [state.currentTrack];
        state.originalQueue = [state.currentTrack];
        state.currentIndex = 0;
      } else {
        state.queue = [];
        state.originalQueue = [];
        state.currentIndex = -1;
      }
    },

    reorderQueue: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [moved] = state.queue.splice(fromIndex, 1);
      state.queue.splice(toIndex, 0, moved);
      // Adjust currentIndex if affected
      if (state.currentTrack) {
        state.currentIndex = state.queue.findIndex((t) => t.id === state.currentTrack?.id);
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
      state.isPlaying = false;
    }
  }
});

export const {
  playTrack,
  togglePlay,
  setIsPlaying,
  setCurrentTime,
  setDuration,
  seekTo,
  clearSeekTarget,
  playNext,
  playPrevious,
  setVolume,
  toggleMute,
  toggleShuffle,
  cycleRepeatMode,
  setPlaybackRate,
  addToQueue,
  playNextInQueue,
  removeFromQueue,
  clearQueue,
  reorderQueue,
  setLoading,
  setError
} = playerSlice.actions;

export default playerSlice.reducer;
