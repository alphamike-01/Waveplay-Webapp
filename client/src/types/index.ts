export type AudioSourceType = 'LOCAL' | 'REMOTE' | 'STREAM' | 'UPLOADED';

export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface ITrack {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  duration: number; // in seconds
  coverImage?: string;
  audioUrl: string;
  sourceType?: AudioSourceType;
  genre?: string;
  releaseDate?: string;
  playCount?: number;
  liked?: boolean;
  localFile?: File;
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
  isFollowing?: boolean;
}

export interface IAlbum {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverImage: string;
  releaseDate: string;
  genre: string;
  tracks: string[] | ITrack[];
  isSaved?: boolean;
}

export interface IPlaylist {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  ownerId: string;
  ownerName: string;
  tracks: ITrack[];
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export type RepeatMode = 'NONE' | 'ALL' | 'ONE';
export type ThemeMode = 'dark' | 'light';
export type AudioQuality = 'standard' | 'high' | 'lossless';
