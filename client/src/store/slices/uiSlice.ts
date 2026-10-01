import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ITrack } from '../../types/index.js';

interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error';
}

interface UIState {
  isQueueOpen: boolean;
  isNowPlayingOpen: boolean;
  isAuthModalOpen: boolean;
  isAddUrlModalOpen: boolean;
  isAddToPlaylistModalOpen: boolean;
  isCreatePlaylistModalOpen: boolean;
  selectedTrackForPlaylist: ITrack | null;
  toasts: Toast[];
}

const initialState: UIState = {
  isQueueOpen: false,
  isNowPlayingOpen: false,
  isAuthModalOpen: false,
  isAddUrlModalOpen: false,
  isAddToPlaylistModalOpen: false,
  isCreatePlaylistModalOpen: false,
  selectedTrackForPlaylist: null,
  toasts: []
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleQueue: (state) => {
      state.isQueueOpen = !state.isQueueOpen;
    },
    setQueueOpen: (state, action: PayloadAction<boolean>) => {
      state.isQueueOpen = action.payload;
    },
    toggleNowPlaying: (state) => {
      state.isNowPlayingOpen = !state.isNowPlayingOpen;
    },
    setNowPlayingOpen: (state, action: PayloadAction<boolean>) => {
      state.isNowPlayingOpen = action.payload;
    },
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
    setAddUrlModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddUrlModalOpen = action.payload;
    },
    openAddToPlaylistModal: (state, action: PayloadAction<ITrack>) => {
      state.selectedTrackForPlaylist = action.payload;
      state.isAddToPlaylistModalOpen = true;
    },
    closeAddToPlaylistModal: (state) => {
      state.isAddToPlaylistModalOpen = false;
      state.selectedTrackForPlaylist = null;
    },
    setCreatePlaylistModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreatePlaylistModalOpen = action.payload;
    },
    addToast: (state, action: PayloadAction<{ message: string; type?: 'info' | 'success' | 'error' }>) => {
      const id = `${Date.now()}-${Math.random()}`;
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  }
});

export const {
  toggleQueue,
  setQueueOpen,
  toggleNowPlaying,
  setNowPlayingOpen,
  setAuthModalOpen,
  setAddUrlModalOpen,
  openAddToPlaylistModal,
  closeAddToPlaylistModal,
  setCreatePlaylistModalOpen,
  addToast,
  removeToast
} = uiSlice.actions;

export default uiSlice.reducer;
