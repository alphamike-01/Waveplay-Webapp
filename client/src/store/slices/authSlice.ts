import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../types/index.js';
import { api } from '../../services/api.js';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const token = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('waveplay_token') : null;
const savedUser = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('waveplay_user') : null;

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: token || null,
  isAuthenticated: !!token,
  isLoading: false,
  error: null
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await api.auth.login(credentials);
      localStorage.setItem('waveplay_token', data.token);
      localStorage.setItem('waveplay_user', JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await api.auth.register(userData);
      localStorage.setItem('waveplay_token', data.token);
      localStorage.setItem('waveplay_user', JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const demoLoginUser = createAsyncThunk(
  'auth/demoLogin',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.auth.demoLogin();
      localStorage.setItem('waveplay_token', data.token);
      localStorage.setItem('waveplay_user', JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Demo login failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    if (!state.auth.token) return null;
    try {
      const data = await api.auth.getMe(state.auth.token);
      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('waveplay_token');
      localStorage.removeItem('waveplay_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: IUser }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Demo Login
      .addCase(demoLoginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(demoLoginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: IUser }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(demoLoginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ token: string; user: IUser }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
