import { Request, Response } from 'express';
import { DBStore } from '../storage/dbStore.js';
import { AuthRequest } from '../middleware/auth.js';

export const getTracks = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const genre = req.query.genre as string;

    let tracks = await DBStore.getAllTracks();

    if (genre && genre !== 'All') {
      tracks = tracks.filter((t) => t.genre.toLowerCase() === genre.toLowerCase());
    }

    // Attach like status if user is authenticated
    if (req.user) {
      const lib = await DBStore.getUserLibrary(req.user.id);
      tracks = tracks.map((t) => ({
        ...t,
        liked: lib.likedTracks.includes(t.id)
      }));
    }

    const startIndex = (page - 1) * limit;
    const paginated = tracks.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      total: tracks.length,
      page,
      limit,
      tracks: paginated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch tracks' });
  }
};

export const getTrackById = async (req: AuthRequest, res: Response) => {
  try {
    const track = await DBStore.getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ success: false, message: 'Track not found' });
      return;
    }

    let liked = false;
    if (req.user) {
      const lib = await DBStore.getUserLibrary(req.user.id);
      liked = lib.likedTracks.includes(track.id);
    }

    res.json({
      success: true,
      track: { ...track, liked }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch track' });
  }
};

export const getPopularTracks = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    let tracks = await DBStore.getPopularTracks(limit);

    if (req.user) {
      const lib = await DBStore.getUserLibrary(req.user.id);
      tracks = tracks.map((t) => ({
        ...t,
        liked: lib.likedTracks.includes(t.id)
      }));
    }

    res.json({ success: true, tracks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNewReleases = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    let tracks = await DBStore.getNewReleases(limit);

    if (req.user) {
      const lib = await DBStore.getUserLibrary(req.user.id);
      tracks = tracks.map((t) => ({
        ...t,
        liked: lib.likedTracks.includes(t.id)
      }));
    }

    res.json({ success: true, tracks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
