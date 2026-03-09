import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId, date, startTime, endTime, notes } = req.body;

    if (!requestId || !date || !startTime || !endTime) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const request = await prisma.tattooRequest.findFirst({
      where: { id: requestId, artistId: req.userId },
    });
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: { artistId: req.userId!, requestId, date, startTime, endTime, notes },
      include: { request: true },
    });

    await prisma.tattooRequest.update({
      where: { id: requestId },
      data: { status: 'SCHEDULED' },
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getArtistAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { artistId: req.userId },
      include: { request: true },
      orderBy: { date: 'asc' },
    });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, notes } = req.body;

    const appointment = await prisma.appointment.findFirst({
      where: { id, artistId: req.userId },
    });
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { date, startTime, endTime, notes },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, artistId: req.userId },
    });
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    await prisma.appointment.delete({ where: { id } });
    if (appointment.requestId) {
      await prisma.tattooRequest.update({
        where: { id: appointment.requestId },
        data: { status: 'CANCELLED' },
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createManualAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientName, date, startTime, endTime, notes } = req.body;

    if (!clientName || !date || !startTime || !endTime) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: { artistId: req.userId!, clientName, date, startTime, endTime, notes },
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
