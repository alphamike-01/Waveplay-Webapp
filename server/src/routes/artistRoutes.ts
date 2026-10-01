import { Router } from 'express';
import { getArtists, getArtistById } from '../controllers/artistController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getArtists);
router.get('/:id', optionalAuth, getArtistById);

export default router;
