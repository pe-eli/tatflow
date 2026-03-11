import { Router } from 'express';
import {
  createAppointment,
  createManualAppointment,
  getArtistAppointments,
  updateAppointment,
  cancelAppointment,
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', authenticate, writeLimiter, createAppointment);
router.post('/manual', authenticate, writeLimiter, createManualAppointment);
router.get('/', authenticate, getArtistAppointments);
router.patch('/:id', authenticate, writeLimiter, updateAppointment);
router.delete('/:id', authenticate, writeLimiter, cancelAppointment);

export default router;
