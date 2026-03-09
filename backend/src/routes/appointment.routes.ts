import { Router } from 'express';
import {
  createAppointment,
  createManualAppointment,
  getArtistAppointments,
  updateAppointment,
  cancelAppointment,
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createAppointment);
router.post('/manual', authenticate, createManualAppointment);
router.get('/', authenticate, getArtistAppointments);
router.patch('/:id', authenticate, updateAppointment);
router.delete('/:id', authenticate, cancelAppointment);

export default router;
