import { Response } from 'express';
import { DBStore } from '../storage/dbStore.js';
import { AuthRequest } from '../middleware/auth.js';

export const getPlaylists = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const playlists = await DBStore.getPlaylists(userId);
    res.json({ success: true, playlists });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlaylistById = async (req: AuthRequest, res: Response) => {
  try {
    const playlist = await DBStore.getPlaylistById(req.params.id);
    if (!playlist) {
      res.status(404).json({ success: false, message: 'Playlist not found' });
      return;
    }

    let likedTrackIds: string[] = [];
    if (req.user) {
      const lib = await DBStore.getUserLibrary(req.user.id);
      likedTrackIds = lib.likedTracks;
    }

    const tracks = playlist.tracks.map((t) => ({
      ...t,
      liked: likedTrackIds.includes(t.id)
    }));

    res.json({
      success: true,
      playlist: {
        ...playlist,
        tracks
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { name, description, isPublic } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Playlist name is required' });
      return;
    }

    const user = await DBStore.findUserById(req.user.id);
    const newPlaylist = await DBStore.createPlaylist({
      name: name.trim(),
      description: description?.trim() || '',
      ownerId: req.user.id,
      ownerName: user?.name || 'WavePlay User',
      isPublic: isPublic ?? true
    });

    res.status(201).json({
      success: true,
      message: 'Playlist created',
      playlist: newPlaylist
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlaylist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { name, description, isPublic, coverImage } = req.body;
    const updated = await DBStore.updatePlaylist(req.params.id, req.user.id, {
      ...(name ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(isPublic !== undefined ? { isPublic } : {}),
      ...(coverImage ? { coverImage } : {})
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Playlist not found or not editable' });
      return;
    }

    res.json({ success: true, message: 'Playlist updated', playlist: updated });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};

export const deletePlaylist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const deleted = await DBStore.deletePlaylist(req.params.id, req.user.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Playlist not found or not authorized' });
      return;
    }

    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};

export const addTrackToPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { trackId, track } = req.body;
    let trackToAdd = track;

    if (!trackToAdd && trackId) {
      trackToAdd = await DBStore.getTrackById(trackId);
    }

    if (!trackToAdd) {
      res.status(400).json({ success: false, message: 'Valid track is required' });
      return;
    }

    const updated = await DBStore.addTrackToPlaylist(req.params.id, trackToAdd);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Playlist not found' });
      return;
    }

    res.json({ success: true, message: 'Track added to playlist', playlist: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeTrackFromPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { trackId } = req.params;
    const updated = await DBStore.removeTrackFromPlaylist(req.params.id, trackId);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Playlist or track not found' });
      return;
    }

    res.json({ success: true, message: 'Track removed from playlist', playlist: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderPlaylistTracks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { trackIds } = req.body;
    if (!Array.isArray(trackIds)) {
      res.status(400).json({ success: false, message: 'trackIds array is required' });
      return;
    }

    const updated = await DBStore.reorderPlaylistTracks(req.params.id, trackIds);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Playlist not found' });
      return;
    }

    res.json({ success: true, message: 'Playlist reordered', playlist: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
