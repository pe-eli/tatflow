import { Router } from 'express';
import {
  createAppointment,
  getArtistAppointments,
  updateAppointment,
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createAppointment);
router.get('/', authenticate, getArtistAppointments);
router.patch('/:id', authenticate, updateAppointment);

export default router;
