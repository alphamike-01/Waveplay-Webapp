import { idb, STORE_LOCAL_TRACKS } from './indexedDB.js';
import { ITrack } from '../types/index.js';

export interface StoredLocalTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  blob?: Blob;
  addedAt: string;
}

const activeObjectURLs = new Map<string, string>();
const activeFiles = new Map<string, File>();

export const getAudioDuration = (blob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      audio.preload = 'metadata';
      const url = URL.createObjectURL(blob);
      audio.src = url;

      // Safety timeout: never hang if browser metadata probe doesn't fire
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(0);
      }, 1500);

      audio.onloadedmetadata = () => {
        clearTimeout(timeout);
        const dur = Math.round(audio.duration);
        URL.revokeObjectURL(url);
        resolve(isNaN(dur) ? 0 : dur);
      };

      audio.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        resolve(0);
      };

      audio.load();
    } catch {
      resolve(0);
    }
  });
};

export const parseFileMetadata = (file: File): { title: string; artist: string; album: string } => {
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  // Parse common "Artist - Title" format
  if (baseName.includes(' - ')) {
    const parts = baseName.split(' - ');
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
      album: 'Local Album'
    };
  }
  return {
    title: baseName.replace(/[-_]/g, ' '),
    artist: 'Local Artist',
    album: 'Local Music'
  };
};

export class LocalMusicStore {
  static async addLocalFiles(files: FileList | File[]): Promise<ITrack[]> {
    const fileList = Array.from(files);
    const audioFiles = fileList.filter((file) =>
      file.type.startsWith('audio/') ||
      file.type.startsWith('video/mp4') ||
      /\.(mp3|wav|ogg|m4a|flac|aac|weba|wma|opus)$/i.test(file.name)
    );

    const processPromises = audioFiles.map(async (file) => {
      const id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const { title, artist, album } = parseFileMetadata(file);
      const duration = await getAudioDuration(file);

      // Create live object URL for current session
      const audioUrl = URL.createObjectURL(file);
      activeObjectURLs.set(id, audioUrl);
      activeFiles.set(id, file);

      const stored: StoredLocalTrack = {
        id,
        title,
        artist,
        album,
        duration,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'audio/mpeg',
        blob: file,
        addedAt: new Date().toISOString()
      };

      try {
        await idb.put(STORE_LOCAL_TRACKS, stored);
      } catch (err) {
        console.warn('Could not store audio blob in IndexedDB, continuing with session URL:', err);
      }

      const track: ITrack = {
        id,
        title,
        artist,
        album,
        duration,
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        audioUrl,
        sourceType: 'LOCAL',
        genre: 'Local Audio',
        releaseDate: new Date().toISOString().split('T')[0],
        playCount: 0,
        localFile: file
      };

      return track;
    });

    const results = await Promise.all(processPromises);
    return results;
  }

  static async loadStoredLocalTracks(): Promise<ITrack[]> {
    try {
      const stored = await idb.getAll<StoredLocalTrack>(STORE_LOCAL_TRACKS);
      const tracks: ITrack[] = [];

      for (const item of stored) {
        let audioUrl = activeObjectURLs.get(item.id);
        let file = activeFiles.get(item.id);

        if (!audioUrl && item.blob) {
          try {
            audioUrl = URL.createObjectURL(item.blob);
            activeObjectURLs.set(item.id, audioUrl);
            if (item.blob instanceof File) {
              file = item.blob;
              activeFiles.set(item.id, file);
            }
          } catch (e) {
            console.warn('Failed to regenerate object URL for track:', item.title, e);
          }
        }

        if (audioUrl) {
          tracks.push({
            id: item.id,
            title: item.title,
            artist: item.artist,
            album: item.album,
            duration: item.duration,
            coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
            audioUrl,
            sourceType: 'LOCAL',
            genre: 'Local Audio',
            releaseDate: item.addedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            playCount: 0,
            localFile: file
          });
        }
      }

      return tracks;
    } catch (err) {
      console.error('Error loading stored local tracks from IndexedDB:', err);
      return [];
    }
  }

  static async removeTrack(id: string): Promise<void> {
    const existingUrl = activeObjectURLs.get(id);
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      activeObjectURLs.delete(id);
    }
    activeFiles.delete(id);
    await idb.delete(STORE_LOCAL_TRACKS, id);
  }

  static async clearAll(): Promise<void> {
    for (const [, url] of activeObjectURLs) {
      URL.revokeObjectURL(url);
    }
    activeObjectURLs.clear();
    activeFiles.clear();
    await idb.clear(STORE_LOCAL_TRACKS);
  }
}
