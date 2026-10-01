import { ITrack, IArtist, IAlbum, IPlaylist, IUser, IPlaybackHistory } from '../types/index.js';

const API_BASE = '/api';

const getHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('waveplay_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      }).then((r) => handleResponse<{ success: boolean; token: string; user: IUser }>(r)),

    register: (userData: { name: string; email: string; password: string }) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      }).then((r) => handleResponse<{ success: boolean; token: string; user: IUser }>(r)),

    demoLogin: () =>
      fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; token: string; user: IUser }>(r)),

    getMe: (token?: string) =>
      fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(token),
      }).then((r) => handleResponse<{ success: boolean; user: IUser }>(r)),
  },

  tracks: {
    getAll: (params?: { page?: number; limit?: number; genre?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', params.page.toString());
      if (params?.limit) q.append('limit', params.limit.toString());
      if (params?.genre) q.append('genre', params.genre);
      return fetch(`${API_BASE}/tracks?${q.toString()}`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; tracks: ITrack[]; total: number }>(r)
      );
    },

    getPopular: (limit = 10) =>
      fetch(`${API_BASE}/tracks/popular?limit=${limit}`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; tracks: ITrack[] }>(r)
      ),

    getNewReleases: (limit = 10) =>
      fetch(`${API_BASE}/tracks/new-releases?limit=${limit}`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; tracks: ITrack[] }>(r)
      ),

    getById: (id: string) =>
      fetch(`${API_BASE}/tracks/${id}`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; track: ITrack }>(r)
      ),
  },

  artists: {
    getAll: () =>
      fetch(`${API_BASE}/artists`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; artists: IArtist[] }>(r)
      ),

    getById: (id: string) =>
      fetch(`${API_BASE}/artists/${id}`, { headers: getHeaders() }).then((r) =>
        handleResponse<{
          success: boolean;
          artist: IArtist;
          popularTracks: ITrack[];
          allTracks: ITrack[];
          albums: IAlbum[];
        }>(r)
      ),
  },

  albums: {
    getAll: () =>
      fetch(`${API_BASE}/albums`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; albums: IAlbum[] }>(r)
      ),

    getById: (id: string) =>
      fetch(`${API_BASE}/albums/${id}`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; album: IAlbum; tracks: ITrack[] }>(r)
      ),
  },

  playlists: {
    getAll: () =>
      fetch(`${API_BASE}/playlists`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; playlists: IPlaylist[] }>(r)
      ),

    getById: (id: string) =>
      fetch(`${API_BASE}/playlists/${id}`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; playlist: IPlaylist }>(r)
      ),

    create: (data: { name: string; description?: string; isPublic?: boolean }) =>
      fetch(`${API_BASE}/playlists`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then((r) => handleResponse<{ success: boolean; playlist: IPlaylist }>(r)),

    update: (id: string, data: Partial<IPlaylist>) =>
      fetch(`${API_BASE}/playlists/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then((r) => handleResponse<{ success: boolean; playlist: IPlaylist }>(r)),

    delete: (id: string) =>
      fetch(`${API_BASE}/playlists/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean }>(r)),

    addTrack: (playlistId: string, track: ITrack) =>
      fetch(`${API_BASE}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ track }),
      }).then((r) => handleResponse<{ success: boolean; playlist: IPlaylist }>(r)),

    removeTrack: (playlistId: string, trackId: string) =>
      fetch(`${API_BASE}/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; playlist: IPlaylist }>(r)),

    reorder: (playlistId: string, trackIds: string[]) =>
      fetch(`${API_BASE}/playlists/${playlistId}/tracks/reorder`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ trackIds }),
      }).then((r) => handleResponse<{ success: boolean; playlist: IPlaylist }>(r)),
  },

  library: {
    getLibrary: () =>
      fetch(`${API_BASE}/me/library`, { headers: getHeaders() }).then((r) =>
        handleResponse<{
          success: boolean;
          library: {
            likedTracks: ITrack[];
            savedAlbums: IAlbum[];
            followedArtists: IArtist[];
            playlists: IPlaylist[];
          };
        }>(r)
      ),

    getLiked: () =>
      fetch(`${API_BASE}/me/liked`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; tracks: ITrack[]; total: number }>(r)
      ),

    toggleLike: (trackId: string) =>
      fetch(`${API_BASE}/me/liked/${trackId}`, {
        method: 'POST',
        headers: getHeaders(),
      }).then((r) =>
        handleResponse<{ success: boolean; liked: boolean; trackId: string; likedTracks: string[] }>(r)
      ),

    toggleSaveAlbum: (albumId: string) =>
      fetch(`${API_BASE}/me/saved-albums/${albumId}`, {
        method: 'POST',
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; saved: boolean; albumId: string }>(r)),

    toggleFollowArtist: (artistId: string) =>
      fetch(`${API_BASE}/me/followed-artists/${artistId}`, {
        method: 'POST',
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; followed: boolean; artistId: string }>(r)),

    getHistory: () =>
      fetch(`${API_BASE}/me/history`, { headers: getHeaders() }).then((r) =>
        handleResponse<{ success: boolean; history: IPlaybackHistory[] }>(r)
      ),

    recordPlayback: (trackId: string, position = 0, completed = false) =>
      fetch(`${API_BASE}/me/history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ trackId, position, completed }),
      }).then((r) => handleResponse<{ success: boolean }>(r)),
  },

  search: {
    query: (q: string, category?: string) => {
      const params = new URLSearchParams({ q });
      if (category) params.append('category', category);
      return fetch(`${API_BASE}/search?${params.toString()}`, { headers: getHeaders() }).then((r) =>
        handleResponse<{
          success: boolean;
          tracks?: ITrack[];
          artists?: IArtist[];
          albums?: IAlbum[];
          playlists?: IPlaylist[];
        }>(r)
      );
    },
  },

  recommendations: {
    get: () =>
      fetch(`${API_BASE}/recommendations`, { headers: getHeaders() }).then((r) =>
        handleResponse<{
          success: boolean;
          recommendedTracks: ITrack[];
          madeForYou: ITrack[];
          featuredPlaylists: IPlaylist[];
          topArtists: IArtist[];
          newAlbums: IAlbum[];
        }>(r)
      ),
  },

  audio: {
    validateUrl: (url: string) =>
      fetch(`${API_BASE}/audio/validate-url`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ url }),
      }).then((r) =>
        handleResponse<{
          success: boolean;
          playable: boolean;
          contentType?: string;
          suggestedTitle?: string;
          suggestedArtist?: string;
          errorType?: string;
          message?: string;
          url: string;
        }>(r)
      ),
  },
};
