import { Router } from 'express';
import { getAlbums, getAlbumById } from '../controllers/albumController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getAlbums);
router.get('/:id', optionalAuth, getAlbumById);

export default router;
