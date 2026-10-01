import { Request, Response } from 'express';
import { DBStore } from '../storage/dbStore.js';
import { AuthRequest } from '../middleware/auth.js';

export const getArtists = async (_req: Request, res: Response) => {
  try {
    const artists = await DBStore.getAllArtists();
    res.json({ success: true, artists });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getArtistById = async (req: AuthRequest, res: Response) => {
  try {
    const artist = await DBStore.getArtistById(req.params.id);
    if (!artist) {
      res.status(404).json({ success: false, message: 'Artist not found' });
      return;
    }

    let isFollowing = false;
    if (req.user) {
      const lib = await DBStore.getUserLibrary(req.user.id);
      isFollowing = lib.followedArtists.includes(artist.id);
    }

    const tracks = await DBStore.getArtistTracks(artist.id);
    const albums = await DBStore.getArtistAlbums(artist.id);

    res.json({
      success: true,
      artist: { ...artist, isFollowing },
      popularTracks: tracks.slice(0, 5),
      allTracks: tracks,
      albums
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
