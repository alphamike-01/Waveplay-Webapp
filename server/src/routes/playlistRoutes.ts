import { Router } from 'express';
import {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks
} from '../controllers/playlistController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getPlaylists);
router.get('/:id', optionalAuth, getPlaylistById);
router.post('/', authenticateToken, createPlaylist);
router.put('/:id', authenticateToken, updatePlaylist);
router.delete('/:id', authenticateToken, deletePlaylist);

router.post('/:id/tracks', authenticateToken, addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', authenticateToken, removeTrackFromPlaylist);
router.put('/:id/tracks/reorder', authenticateToken, reorderPlaylistTracks);

export default router;
