import { Response } from 'express';
import { DBStore } from '../storage/dbStore.js';
import { AuthRequest } from '../middleware/auth.js';

export const search = async (req: AuthRequest, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const category = req.query.category as string | undefined;

    if (!q.trim()) {
      res.json({
        success: true,
        tracks: [],
        artists: [],
        albums: [],
        playlists: []
      });
      return;
    }

    const results = await DBStore.search(q, category);

    // If user is logged in, attach like flags
    if (req.user && results.tracks) {
      const lib = await DBStore.getUserLibrary(req.user.id);
      results.tracks = results.tracks.map((t: any) => ({
        ...t,
        liked: lib.likedTracks.includes(t.id)
      }));
    }

    res.json({
      success: true,
      query: q,
      category: category || 'all',
      ...results
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
