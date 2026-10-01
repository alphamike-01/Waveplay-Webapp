import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode, AudioQuality } from '../../types/index.js';

interface SettingsState {
  theme: ThemeMode;
  crossfade: number; // 0 to 12 seconds
  audioQuality: AudioQuality;
  autoplay: boolean;
}

const savedTheme = (typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('waveplay_theme') : null) as ThemeMode || 'dark';
const savedCrossfade = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('waveplay_crossfade') : null;
const savedQuality = (typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('waveplay_quality') : null) as AudioQuality || 'high';
const savedAutoplay = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('waveplay_autoplay') : null;

const initialState: SettingsState = {
  theme: savedTheme,
  crossfade: savedCrossfade ? parseInt(savedCrossfade, 10) : 3,
  audioQuality: savedQuality,
  autoplay: savedAutoplay !== null ? savedAutoplay === 'true' : true
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('waveplay_theme', action.payload);
      }
      if (typeof document !== 'undefined') {
        if (action.payload === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      }
    },
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('waveplay_theme', nextTheme);
      }
      if (typeof document !== 'undefined') {
        if (nextTheme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      }
    },
    setCrossfade: (state, action: PayloadAction<number>) => {
      state.crossfade = Math.max(0, Math.min(12, action.payload));
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('waveplay_crossfade', state.crossfade.toString());
      }
    },
    setAudioQuality: (state, action: PayloadAction<AudioQuality>) => {
      state.audioQuality = action.payload;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('waveplay_quality', action.payload);
      }
    },
    setAutoplay: (state, action: PayloadAction<boolean>) => {
      state.autoplay = action.payload;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('waveplay_autoplay', action.payload.toString());
      }
    }
  }
});

export const { setTheme, toggleTheme, setCrossfade, setAudioQuality, setAutoplay } = settingsSlice.actions;
export default settingsSlice.reducer;
