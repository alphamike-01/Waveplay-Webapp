export type AudioSourceType = 'LOCAL' | 'REMOTE' | 'STREAM' | 'UPLOADED';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatar?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IArtist {
  id: string;
  name: string;
  image: string;
  bio: string;
  genres: string[];
  followers: number;
  monthlyListeners?: number;
  verified?: boolean;
}

export interface IAlbum {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverImage: string;
  releaseDate: string;
  genre: string;
  tracks: string[]; // track IDs
}

export interface ITrack {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number; // in seconds
  coverImage: string;
  audioUrl: string;
  sourceType: AudioSourceType;
  genre: string;
  releaseDate: string;
  playCount: number;
  liked?: boolean;
  createdAt: string;
}

export interface IPlaylist {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  ownerId: string;
  ownerName: string;
  tracks: ITrack[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPlaybackHistory {
  id: string;
  userId: string;
  trackId: string;
  track?: ITrack;
  playedAt: string;
  position: number;
  completed: boolean;
}

export interface IUserLibrary {
  userId: string;
  likedTracks: string[]; // track IDs
  savedAlbums: string[]; // album IDs
  followedArtists: string[]; // artist IDs
  playlists: string[]; // playlist IDs
}
