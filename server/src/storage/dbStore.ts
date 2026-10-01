import bcrypt from 'bcryptjs';
import { IArtist, IAlbum, ITrack, IPlaylist, IUser, IPlaybackHistory, IUserLibrary } from '../types/index.js';
import { SEED_ARTISTS, SEED_ALBUMS, SEED_TRACKS, SEED_PLAYLISTS } from '../data/seedData.js';
import { UserModel } from '../models/User.js';
import { TrackModel } from '../models/Track.js';
import { ArtistModel } from '../models/Artist.js';
import { AlbumModel } from '../models/Album.js';
import { PlaylistModel } from '../models/Playlist.js';
import { UserLibraryModel } from '../models/UserLibrary.js';
import { PlaybackHistoryModel } from '../models/PlaybackHistory.js';
import { getDBStatus } from '../config/db.js';

// In-Memory store instances for fallback demo mode
class InMemoryDatabase {
  users: Map<string, IUser> = new Map();
  tracks: Map<string, ITrack> = new Map();
  artists: Map<string, IArtist> = new Map();
  albums: Map<string, IAlbum> = new Map();
  playlists: Map<string, IPlaylist> = new Map();
  libraries: Map<string, IUserLibrary> = new Map();
  history: IPlaybackHistory[] = [];

  constructor() {
    this.seedDemoData();
  }

  seedDemoData() {
    // Demo user
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('WavePlay123!', salt);
    const demoUser: IUser = {
      id: 'user-demo-1',
      name: 'Wave Explorer',
      email: 'demo@waveplay.io',
      passwordHash: demoPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(demoUser.id, demoUser);
    this.users.set(demoUser.email, demoUser);

    // Seed Artists
    SEED_ARTISTS.forEach((a) => this.artists.set(a.id, { ...a }));

    // Seed Albums
    SEED_ALBUMS.forEach((al) => this.albums.set(al.id, { ...al }));

    // Seed Tracks
    SEED_TRACKS.forEach((t) => this.tracks.set(t.id, { ...t }));

    // Seed Playlists
    SEED_PLAYLISTS.forEach((p) => this.playlists.set(p.id, { ...p }));

    // Demo user library
    const demoLib: IUserLibrary = {
      userId: demoUser.id,
      likedTracks: ['track-1', 'track-6', 'track-11', 'track-31', 'track-46'],
      savedAlbums: ['album-1', 'album-3', 'album-13'],
      followedArtists: ['artist-1', 'artist-2', 'artist-7', 'artist-10'],
      playlists: ['playlist-1', 'playlist-2']
    };
    this.libraries.set(demoUser.id, demoLib);

    // Initial listening history
    this.history.push(
      {
        id: 'hist-1',
        userId: demoUser.id,
        trackId: 'track-1',
        track: this.tracks.get('track-1'),
        playedAt: new Date(Date.now() - 3600000).toISOString(),
        position: 120,
        completed: true
      },
      {
        id: 'hist-2',
        userId: demoUser.id,
        trackId: 'track-6',
        track: this.tracks.get('track-6'),
        playedAt: new Date(Date.now() - 7200000).toISOString(),
        position: 180,
        completed: true
      },
      {
        id: 'hist-3',
        userId: demoUser.id,
        trackId: 'track-31',
        track: this.tracks.get('track-31'),
        playedAt: new Date(Date.now() - 86400000).toISOString(),
        position: 90,
        completed: true
      }
    );
  }
}

export const inMemoryDB = new InMemoryDatabase();

export class DBStore {
  // USER METHODS
  static async findUserByEmail(email: string): Promise<IUser | null> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      try {
        const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
        if (user) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            avatar: user.avatar,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
          };
        }
      } catch (err) {
        console.error('Mongo findUserByEmail error:', err);
      }
    }
    return inMemoryDB.users.get(email.toLowerCase()) || null;
  }

  static async findUserById(id: string): Promise<IUser | null> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      try {
        const user = await UserModel.findById(id).lean();
        if (user) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
          };
        }
      } catch (err) {
        console.error('Mongo findUserById error:', err);
      }
    }
    const user = inMemoryDB.users.get(id);
    if (user) {
      const { passwordHash, ...rest } = user;
      return rest as IUser;
    }
    return null;
  }

  static async createUser(userData: { name: string; email: string; passwordHash: string; avatar?: string }): Promise<IUser> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      try {
        const user = await UserModel.create({
          name: userData.name,
          email: userData.email.toLowerCase(),
          passwordHash: userData.passwordHash,
          avatar: userData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${userData.email}`
        });
        await UserLibraryModel.create({
          userId: user._id.toString(),
          likedTracks: [],
          savedAlbums: [],
          followedArtists: [],
          playlists: []
        });
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        };
      } catch (err) {
        console.error('Mongo createUser error:', err);
      }
    }

    const id = `user-${Date.now()}`;
    const newUser: IUser = {
      id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${userData.email}`,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryDB.users.set(id, newUser);
    inMemoryDB.users.set(newUser.email, newUser);
    inMemoryDB.libraries.set(id, {
      userId: id,
      likedTracks: [],
      savedAlbums: [],
      followedArtists: [],
      playlists: []
    });
    return newUser;
  }

  // TRACK METHODS
  static async getAllTracks(): Promise<ITrack[]> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      try {
        const tracks = await TrackModel.find().lean();
        if (tracks.length > 0) {
          return tracks.map((t: any) => ({
            id: t._id.toString(),
            title: t.title,
            artist: t.artist,
            artistId: t.artistId,
            album: t.album,
            albumId: t.albumId,
            duration: t.duration,
            coverImage: t.coverImage,
            audioUrl: t.audioUrl,
            sourceType: t.sourceType,
            genre: t.genre,
            releaseDate: t.releaseDate,
            playCount: t.playCount,
            createdAt: t.createdAt.toISOString()
          }));
        }
      } catch (err) {
        console.error('Mongo getAllTracks error:', err);
      }
    }
    return Array.from(inMemoryDB.tracks.values());
  }

  static async getTrackById(id: string): Promise<ITrack | null> {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      try {
        const t = await TrackModel.findById(id).lean();
        if (t) {
          return {
            id: t._id.toString(),
            title: t.title,
            artist: t.artist,
            artistId: t.artistId,
            album: t.album,
            albumId: t.albumId,
            duration: t.duration,
            coverImage: t.coverImage,
            audioUrl: t.audioUrl,
            sourceType: t.sourceType,
            genre: t.genre,
            releaseDate: t.releaseDate,
            playCount: t.playCount,
            createdAt: t.createdAt.toISOString()
          };
        }
      } catch (err) {
        console.error('Mongo getTrackById error:', err);
      }
    }
    return inMemoryDB.tracks.get(id) || null;
  }

  static async getPopularTracks(limit = 10): Promise<ITrack[]> {
    const tracks = await this.getAllTracks();
    return [...tracks].sort((a, b) => b.playCount - a.playCount).slice(0, limit);
  }

  static async getNewReleases(limit = 10): Promise<ITrack[]> {
    const tracks = await this.getAllTracks();
    return [...tracks].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()).slice(0, limit);
  }

  // ARTIST METHODS
  static async getAllArtists(): Promise<IArtist[]> {
    return Array.from(inMemoryDB.artists.values());
  }

  static async getArtistById(id: string): Promise<IArtist | null> {
    return inMemoryDB.artists.get(id) || null;
  }

  static async getArtistTracks(artistId: string): Promise<ITrack[]> {
    const tracks = await this.getAllTracks();
    return tracks.filter((t) => t.artistId === artistId);
  }

  static async getArtistAlbums(artistId: string): Promise<IAlbum[]> {
    const albums = Array.from(inMemoryDB.albums.values());
    return albums.filter((al) => al.artistId === artistId);
  }

  // ALBUM METHODS
  static async getAllAlbums(): Promise<IAlbum[]> {
    return Array.from(inMemoryDB.albums.values());
  }

  static async getAlbumById(id: string): Promise<IAlbum | null> {
    return inMemoryDB.albums.get(id) || null;
  }

  static async getAlbumTracks(albumId: string): Promise<ITrack[]> {
    const album = inMemoryDB.albums.get(albumId);
    if (!album) return [];
    const allTracks = await this.getAllTracks();
    return allTracks.filter((t) => t.albumId === albumId);
  }

  // PLAYLIST METHODS
  static async getPlaylists(userId?: string): Promise<IPlaylist[]> {
    const playlists = Array.from(inMemoryDB.playlists.values());
    if (!userId) {
      return playlists.filter((p) => p.isPublic);
    }
    return playlists.filter((p) => p.isPublic || p.ownerId === userId);
  }

  static async getPlaylistById(id: string): Promise<IPlaylist | null> {
    return inMemoryDB.playlists.get(id) || null;
  }

  static async createPlaylist(data: { name: string; description?: string; coverImage?: string; ownerId: string; ownerName: string; isPublic?: boolean }): Promise<IPlaylist> {
    const id = `playlist-${Date.now()}`;
    const newPlaylist: IPlaylist = {
      id,
      name: data.name,
      description: data.description || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      tracks: [],
      isPublic: data.isPublic ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryDB.playlists.set(id, newPlaylist);

    // Add to user library
    const lib = inMemoryDB.libraries.get(data.ownerId);
    if (lib && !lib.playlists.includes(id)) {
      lib.playlists.push(id);
    }

    return newPlaylist;
  }

  static async updatePlaylist(id: string, userId: string, updateData: Partial<IPlaylist>): Promise<IPlaylist | null> {
    const playlist = inMemoryDB.playlists.get(id);
    if (!playlist) return null;
    if (playlist.ownerId !== userId && playlist.ownerId !== 'waveplay-editorial') {
      throw new Error('Not authorized to edit this playlist');
    }
    const updated = {
      ...playlist,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    inMemoryDB.playlists.set(id, updated);
    return updated;
  }

  static async deletePlaylist(id: string, userId: string): Promise<boolean> {
    const playlist = inMemoryDB.playlists.get(id);
    if (!playlist) return false;
    if (playlist.ownerId !== userId && playlist.ownerId !== 'waveplay-editorial') {
      throw new Error('Not authorized to delete this playlist');
    }
    inMemoryDB.playlists.delete(id);
    const lib = inMemoryDB.libraries.get(userId);
    if (lib) {
      lib.playlists = lib.playlists.filter((pId) => pId !== id);
    }
    return true;
  }

  static async addTrackToPlaylist(playlistId: string, track: ITrack): Promise<IPlaylist | null> {
    const playlist = inMemoryDB.playlists.get(playlistId);
    if (!playlist) return null;
    if (!playlist.tracks.some((t) => t.id === track.id)) {
      playlist.tracks.push(track);
      playlist.updatedAt = new Date().toISOString();
    }
    return playlist;
  }

  static async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<IPlaylist | null> {
    const playlist = inMemoryDB.playlists.get(playlistId);
    if (!playlist) return null;
    playlist.tracks = playlist.tracks.filter((t) => t.id !== trackId);
    playlist.updatedAt = new Date().toISOString();
    return playlist;
  }

  static async reorderPlaylistTracks(playlistId: string, trackIds: string[]): Promise<IPlaylist | null> {
    const playlist = inMemoryDB.playlists.get(playlistId);
    if (!playlist) return null;
    const trackMap = new Map(playlist.tracks.map((t) => [t.id, t]));
    const reordered: ITrack[] = [];
    for (const tid of trackIds) {
      const trk = trackMap.get(tid);
      if (trk) reordered.push(trk);
    }
    playlist.tracks = reordered;
    playlist.updatedAt = new Date().toISOString();
    return playlist;
  }

  // USER LIBRARY METHODS
  static async getUserLibrary(userId: string): Promise<IUserLibrary> {
    let lib = inMemoryDB.libraries.get(userId);
    if (!lib) {
      lib = {
        userId,
        likedTracks: [],
        savedAlbums: [],
        followedArtists: [],
        playlists: []
      };
      inMemoryDB.libraries.set(userId, lib);
    }
    return lib;
  }

  static async toggleLikeTrack(userId: string, trackId: string): Promise<{ liked: boolean; likedTracks: string[] }> {
    const lib = await this.getUserLibrary(userId);
    const index = lib.likedTracks.indexOf(trackId);
    let liked = false;
    if (index > -1) {
      lib.likedTracks.splice(index, 1);
      liked = false;
    } else {
      lib.likedTracks.unshift(trackId);
      liked = true;
    }
    return { liked, likedTracks: lib.likedTracks };
  }

  static async toggleSaveAlbum(userId: string, albumId: string): Promise<{ saved: boolean; savedAlbums: string[] }> {
    const lib = await this.getUserLibrary(userId);
    const index = lib.savedAlbums.indexOf(albumId);
    let saved = false;
    if (index > -1) {
      lib.savedAlbums.splice(index, 1);
      saved = false;
    } else {
      lib.savedAlbums.unshift(albumId);
      saved = true;
    }
    return { saved, savedAlbums: lib.savedAlbums };
  }

  static async toggleFollowArtist(userId: string, artistId: string): Promise<{ followed: boolean; followedArtists: string[] }> {
    const lib = await this.getUserLibrary(userId);
    const index = lib.followedArtists.indexOf(artistId);
    let followed = false;
    if (index > -1) {
      lib.followedArtists.splice(index, 1);
      followed = false;
    } else {
      lib.followedArtists.unshift(artistId);
      followed = true;
    }
    return { followed, followedArtists: lib.followedArtists };
  }

  // PLAYBACK HISTORY
  static async getPlaybackHistory(userId: string, limit = 50): Promise<IPlaybackHistory[]> {
    return inMemoryDB.history
      .filter((h) => h.userId === userId)
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
      .slice(0, limit);
  }

  static async recordPlayback(userId: string, trackId: string, position = 0, completed = false): Promise<IPlaybackHistory> {
    const track = await this.getTrackById(trackId);
    if (track) {
      track.playCount = (track.playCount || 0) + 1;
    }
    const entry: IPlaybackHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      trackId,
      track: track || undefined,
      playedAt: new Date().toISOString(),
      position,
      completed
    };
    inMemoryDB.history.unshift(entry);
    return entry;
  }

  // SEARCH METHOD
  static async search(query: string, category?: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { tracks: [], artists: [], albums: [], playlists: [] };
    }

    const allTracks = await this.getAllTracks();
    const allArtists = Array.from(inMemoryDB.artists.values());
    const allAlbums = Array.from(inMemoryDB.albums.values());
    const allPlaylists = Array.from(inMemoryDB.playlists.values());

    const tracks = allTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
    );

    const artists = allArtists.filter(
      (a) => a.name.toLowerCase().includes(q) || a.genres.some((g) => g.toLowerCase().includes(q))
    );

    const albums = allAlbums.filter(
      (al) => al.title.toLowerCase().includes(q) || al.artistName.toLowerCase().includes(q) || al.genre.toLowerCase().includes(q)
    );

    const playlists = allPlaylists.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );

    if (category === 'tracks') return { tracks };
    if (category === 'artists') return { artists };
    if (category === 'albums') return { albums };
    if (category === 'playlists') return { playlists };

    return { tracks: tracks.slice(0, 20), artists: artists.slice(0, 10), albums: albums.slice(0, 10), playlists: playlists.slice(0, 10) };
  }
}
