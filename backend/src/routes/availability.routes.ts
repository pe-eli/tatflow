import { Router } from 'express';
import {
  getArtistAvailability,
  setArtistAvailability,
  getAvailableSlots,
} from '../controllers/availability.controller';
import { authenticate } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public
router.get('/:artistId', getArtistAvailability);
router.get('/:artistId/slots', getAvailableSlots);

// Protected
router.put('/', authenticate, writeLimiter, setArtistAvailability);

export default router;
