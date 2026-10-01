import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ITrack, IAlbum, IArtist, IPlaylist, IPlaybackHistory } from '../../types/index.js';
import { api } from '../../services/api.js';

interface LibraryState {
  likedTracks: ITrack[];
  likedTrackIds: string[];
  savedAlbums: IAlbum[];
  followedArtists: IArtist[];
  userPlaylists: IPlaylist[];
  history: IPlaybackHistory[];
  localTracks: ITrack[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LibraryState = {
  likedTracks: [],
  likedTrackIds: ['track-1', 'track-6', 'track-11', 'track-31', 'track-46'],
  savedAlbums: [],
  followedArtists: [],
  userPlaylists: [],
  history: [],
  localTracks: [],
  isLoading: false,
  error: null
};

export const fetchLibrary = createAsyncThunk(
  'library/fetchLibrary',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.library.getLibrary();
      return data.library;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleLikeTrackAsync = createAsyncThunk(
  'library/toggleLikeTrack',
  async (track: ITrack, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { isAuthenticated: boolean } };
    if (!state.auth.isAuthenticated) {
      // Offline / guest optimistic like
      return { track, liked: !track.liked, isGuest: true };
    }
    try {
      const data = await api.library.toggleLike(track.id);
      return { track, liked: data.liked, isGuest: false };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPlaybackHistory = createAsyncThunk(
  'library/fetchPlaybackHistory',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.library.getHistory();
      return data.history;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    addLocalTracks: (state, action: PayloadAction<ITrack[]>) => {
      state.localTracks = [...action.payload, ...state.localTracks];
    },
    setLocalTracks: (state, action: PayloadAction<ITrack[]>) => {
      state.localTracks = action.payload;
    },
    removeLocalTrack: (state, action: PayloadAction<string>) => {
      state.localTracks = state.localTracks.filter((t) => t.id !== action.payload);
    },
    addUserPlaylist: (state, action: PayloadAction<IPlaylist>) => {
      state.userPlaylists.unshift(action.payload);
    },
    updateUserPlaylist: (state, action: PayloadAction<IPlaylist>) => {
      const index = state.userPlaylists.findIndex((p) => p.id === action.payload.id);
      if (index > -1) {
        state.userPlaylists[index] = action.payload;
      }
    },
    removeUserPlaylist: (state, action: PayloadAction<string>) => {
      state.userPlaylists = state.userPlaylists.filter((p) => p.id !== action.payload);
    },
    recordHistoryLocal: (state, action: PayloadAction<ITrack>) => {
      const newEntry: IPlaybackHistory = {
        id: `local-hist-${Date.now()}`,
        userId: 'guest',
        trackId: action.payload.id,
        track: action.payload,
        playedAt: new Date().toISOString(),
        position: 0,
        completed: true
      };
      state.history.unshift(newEntry);
    },
    clearHistory: (state) => {
      state.history = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Library
      .addCase(fetchLibrary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLibrary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.likedTracks = action.payload.likedTracks;
        state.likedTrackIds = action.payload.likedTracks.map((t) => t.id);
        state.savedAlbums = action.payload.savedAlbums;
        state.followedArtists = action.payload.followedArtists;
        state.userPlaylists = action.payload.playlists;
      })
      .addCase(fetchLibrary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle Like
      .addCase(toggleLikeTrackAsync.fulfilled, (state, action) => {
        const { track, liked } = action.payload;
        if (liked) {
          if (!state.likedTrackIds.includes(track.id)) {
            state.likedTrackIds.push(track.id);
            state.likedTracks.unshift({ ...track, liked: true });
          }
        } else {
          state.likedTrackIds = state.likedTrackIds.filter((id) => id !== track.id);
          state.likedTracks = state.likedTracks.filter((t) => t.id !== track.id);
        }
      })
      // Fetch History
      .addCase(fetchPlaybackHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  }
});

export const {
  addLocalTracks,
  setLocalTracks,
  removeLocalTrack,
  addUserPlaylist,
  updateUserPlaylist,
  removeUserPlaylist,
  recordHistoryLocal,
  clearHistory
} = librarySlice.actions;

export default librarySlice.reducer;
