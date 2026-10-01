import { Response } from 'express';
import { DBStore } from '../storage/dbStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { ITrack } from '../types/index.js';

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const allTracks = await DBStore.getAllTracks();
    const allPlaylists = await DBStore.getPlaylists(req.user?.id);
    const allArtists = await DBStore.getAllArtists();
    const allAlbums = await DBStore.getAllAlbums();

    let favoriteGenres: string[] = ['Electronic', 'Lo-fi', 'Synthwave', 'Pop'];

    if (req.user) {
      const lib = await DBStore.getUserLibrary(req.user.id);
      const liked = allTracks.filter((t) => lib.likedTracks.includes(t.id));
      if (liked.length > 0) {
        favoriteGenres = Array.from(new Set(liked.map((t) => t.genre)));
      }
    }

    const recommendedTracks = allTracks
      .filter((t) => favoriteGenres.includes(t.genre))
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    const madeForYou = allTracks.slice().sort(() => 0.5 - Math.random()).slice(0, 8);

    res.json({
      success: true,
      recommendedTracks,
      madeForYou,
      featuredPlaylists: allPlaylists.slice(0, 6),
      topArtists: allArtists.slice(0, 6),
      newAlbums: allAlbums.slice(0, 6)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
