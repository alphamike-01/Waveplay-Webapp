import { Response } from 'express';
import { DBStore } from '../storage/dbStore.js';
import { AuthRequest } from '../middleware/auth.js';

export const getLibrary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const lib = await DBStore.getUserLibrary(req.user.id);
    const allTracks = await DBStore.getAllTracks();
    const allAlbums = await DBStore.getAllAlbums();
    const allArtists = await DBStore.getAllArtists();
    const allPlaylists = await DBStore.getPlaylists(req.user.id);

    const likedTracks = allTracks.filter((t) => lib.likedTracks.includes(t.id)).map((t) => ({ ...t, liked: true }));
    const savedAlbums = allAlbums.filter((a) => lib.savedAlbums.includes(a.id));
    const followedArtists = allArtists.filter((a) => lib.followedArtists.includes(a.id));
    const userPlaylists = allPlaylists.filter((p) => p.ownerId === req.user?.id);

    res.json({
      success: true,
      library: {
        likedTracks,
        savedAlbums,
        followedArtists,
        playlists: userPlaylists
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLikedTracks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const lib = await DBStore.getUserLibrary(req.user.id);
    const allTracks = await DBStore.getAllTracks();
    const likedTracks = allTracks.filter((t) => lib.likedTracks.includes(t.id)).map((t) => ({ ...t, liked: true }));

    res.json({
      success: true,
      tracks: likedTracks,
      total: likedTracks.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleLikeTrack = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { trackId } = req.params;
    const result = await DBStore.toggleLikeTrack(req.user.id, trackId);

    res.json({
      success: true,
      liked: result.liked,
      trackId,
      likedTracks: result.likedTracks
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleSaveAlbum = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { albumId } = req.params;
    const result = await DBStore.toggleSaveAlbum(req.user.id, albumId);

    res.json({
      success: true,
      saved: result.saved,
      albumId,
      savedAlbums: result.savedAlbums
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFollowArtist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { artistId } = req.params;
    const result = await DBStore.toggleFollowArtist(req.user.id, artistId);

    res.json({
      success: true,
      followed: result.followed,
      artistId,
      followedArtists: result.followedArtists
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlaybackHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const history = await DBStore.getPlaybackHistory(req.user.id);
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordPlayback = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      // In guest mode, playback recording is a no-op success
      res.json({ success: true, message: 'Playback noted for guest' });
      return;
    }

    const { trackId, position, completed } = req.body;
    if (!trackId) {
      res.status(400).json({ success: false, message: 'trackId is required' });
      return;
    }

    const entry = await DBStore.recordPlayback(req.user.id, trackId, position || 0, completed || false);
    res.json({ success: true, entry });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
