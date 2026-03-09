import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import {
  createAppointmentSchema,
  createManualAppointmentSchema,
  updateAppointmentSchema,
  cuidParamSchema,
} from '../lib/validation';
import { ZodError } from 'zod';

function formatZodError(err: ZodError) {
  return err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
}

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const { requestId, date, startTime, endTime, notes } = parsed.data;

    // Tenant isolation: verify request belongs to this artist
    const request = await prisma.tattooRequest.findFirst({
      where: { id: requestId, artistId: req.user!.id },
    });
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: { artistId: req.user!.id, requestId, date, startTime, endTime, notes },
      include: { request: true },
    });

    await prisma.tattooRequest.updateMany({
      where: { id: requestId, artistId: req.user!.id },
      data: { status: 'SCHEDULED' },
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error('createAppointment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getArtistAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { artistId: req.user!.id },
      include: { request: true },
      orderBy: { date: 'asc' },
    });
    res.json(appointments);
  } catch (err) {
    console.error('getArtistAppointments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paramParsed = cuidParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      res.status(400).json({ error: 'Invalid appointment ID' });
      return;
    }

    const bodyParsed = updateAppointmentSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: formatZodError(bodyParsed.error) });
      return;
    }

    // Tenant isolation: verify appointment belongs to this artist
    const appointment = await prisma.appointment.findFirst({
      where: { id: paramParsed.data.id, artistId: req.user!.id },
    });
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id: paramParsed.data.id },
      data: bodyParsed.data,
    });
    res.json(updated);
  } catch (err) {
    console.error('updateAppointment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paramParsed = cuidParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      res.status(400).json({ error: 'Invalid appointment ID' });
      return;
    }

    // Tenant isolation: verify appointment belongs to this artist
    const appointment = await prisma.appointment.findFirst({
      where: { id: paramParsed.data.id, artistId: req.user!.id },
    });
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    await prisma.appointment.delete({ where: { id: paramParsed.data.id } });
    if (appointment.requestId) {
      await prisma.tattooRequest.updateMany({
        where: { id: appointment.requestId, artistId: req.user!.id },
        data: { status: 'CANCELLED' },
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('cancelAppointment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createManualAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createManualAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const { clientName, date, startTime, endTime, notes } = parsed.data;

    const appointment = await prisma.appointment.create({
      data: { artistId: req.user!.id, clientName, date, startTime, endTime, notes },
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error('createManualAppointment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
