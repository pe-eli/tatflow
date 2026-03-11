import { Router } from 'express';
import { getArtistStyles, getMyStyles, updateStyles } from '../controllers/style.controller';
import { authenticate } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public: get styles for a specific artist (by slug or ID)
router.get('/:identifier', getArtistStyles);

// Authenticated: get own styles
router.get('/', authenticate, getMyStyles);

// Authenticated: replace entire styles list
router.put('/', authenticate, writeLimiter, updateStyles);

export default router;
