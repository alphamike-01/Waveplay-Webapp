import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getRecommendations);

export default router;
