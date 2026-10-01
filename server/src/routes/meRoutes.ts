import { Router } from 'express';
import {
  getLibrary,
  getLikedTracks,
  toggleLikeTrack,
  getSavedAlbums,
  toggleSaveAlbum,
  getFollowedArtists,
  toggleFollowArtist,
  getPlaybackHistory,
  recordPlayback
} from '../controllers/libraryController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Library
router.get('/library', authenticateToken, getLibrary);

// Likes
router.get('/liked', authenticateToken, getLikedTracks);
router.post('/liked/:trackId', authenticateToken, toggleLikeTrack);
router.delete('/liked/:trackId', authenticateToken, toggleLikeTrack);

// Saved albums & artists
router.post('/saved-albums/:albumId', authenticateToken, toggleSaveAlbum);
router.post('/followed-artists/:artistId', authenticateToken, toggleFollowArtist);

// History
router.get('/history', authenticateToken, getPlaybackHistory);
router.post('/history', optionalAuth, recordPlayback);

export default router;
