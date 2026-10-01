import { Router } from 'express';
import { getTracks, getTrackById, getPopularTracks, getNewReleases } from '../controllers/trackController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getTracks);
router.get('/popular', optionalAuth, getPopularTracks);
router.get('/new-releases', optionalAuth, getNewReleases);
router.get('/:id', optionalAuth, getTrackById);

export default router;
