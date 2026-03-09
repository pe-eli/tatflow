import { Router } from 'express';
import {
  getArtistAvailability,
  setArtistAvailability,
  getAvailableSlots,
} from '../controllers/availability.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public
router.get('/:artistId', getArtistAvailability);
router.get('/:artistId/slots', getAvailableSlots);

// Protected
router.put('/', authenticate, setArtistAvailability);

export default router;
