import { Request, Response } from 'express';
import { DBStore } from '../storage/dbStore.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAlbums = async (_req: Request, res: Response) => {
  try {
    const albums = await DBStore.getAllAlbums();
    res.json({ success: true, albums });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlbumById = async (req: AuthRequest, res: Response) => {
  try {
    const album = await DBStore.getAlbumById(req.params.id);
    if (!album) {
      res.status(404).json({ success: false, message: 'Album not found' });
      return;
    }

    let isSaved = false;
    let likedTrackIds: string[] = [];
    if (req.user) {
      const lib = await DBStore.getUserLibrary(req.user.id);
      isSaved = lib.savedAlbums.includes(album.id);
      likedTrackIds = lib.likedTracks;
    }

    let tracks = await DBStore.getAlbumTracks(album.id);
    tracks = tracks.map((t) => ({
      ...t,
      liked: likedTrackIds.includes(t.id)
    }));

    res.json({
      success: true,
      album: { ...album, isSaved },
      tracks
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
