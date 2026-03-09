import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import {
  setAvailabilitySchema,
  availableSlotsQuerySchema,
  artistIdParamSchema,
} from '../lib/validation';
import { ZodError } from 'zod';

function formatZodError(err: ZodError) {
  return err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
}

// Public — get artist's weekly schedule
export const getArtistAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramParsed = artistIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      res.status(400).json({ error: 'Invalid artist ID' });
      return;
    }

    const availability = await prisma.availability.findMany({
      where: { artistId: paramParsed.data.artistId },
      orderBy: { dayOfWeek: 'asc' },
    });
    res.json(availability);
  } catch (err) {
    console.error('getArtistAvailability error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Protected — artist sets weekly availability (replaces all)
export const setArtistAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = setAvailabilitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }

    const artistId = req.user!.id;

    // Delete existing availability for THIS artist only
    await prisma.availability.deleteMany({ where: { artistId } });

    // Create new entries
    const entries = parsed.data.schedule.map((s) => ({
      artistId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      slotDuration: s.slotDuration,
    }));

    await prisma.availability.createMany({ data: entries });

    const result = await prisma.availability.findMany({
      where: { artistId },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json(result);
  } catch (err) {
    console.error('setArtistAvailability error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Public — get available time slots for a specific date
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramParsed = artistIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      res.status(400).json({ error: 'Invalid artist ID' });
      return;
    }

    const queryParsed = availableSlotsQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
      res.status(400).json({ error: formatZodError(queryParsed.error) });
      return;
    }

    const { artistId } = paramParsed.data;
    const { date } = queryParsed.data;

    // Determine day of week (JS: 0=Sunday)
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();

    // Get availability for this day
    const availability = await prisma.availability.findFirst({
      where: { artistId, dayOfWeek },
    });

    if (!availability) {
      res.json({ date, slots: [] });
      return;
    }

    // Generate all possible slots
    const slotDuration = availability.slotDuration;
    const [startH, startM] = availability.startTime.split(':').map(Number);
    const [endH, endM] = availability.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const allSlots: { startTime: string; endTime: string }[] = [];
    for (let m = startMinutes; m + slotDuration <= endMinutes; m += slotDuration) {
      const sh = Math.floor(m / 60).toString().padStart(2, '0');
      const sm = (m % 60).toString().padStart(2, '0');
      const eh = Math.floor((m + slotDuration) / 60).toString().padStart(2, '0');
      const em = ((m + slotDuration) % 60).toString().padStart(2, '0');
      allSlots.push({ startTime: `${sh}:${sm}`, endTime: `${eh}:${em}` });
    }

    // Get booked appointments for this date
    const appointments = await prisma.appointment.findMany({
      where: { artistId, date },
    });

    // Filter out slots that overlap with existing appointments
    const available = allSlots.filter((slot) => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);

      return !appointments.some((appt) => {
        const apptStart = timeToMinutes(appt.startTime);
        const apptEnd = timeToMinutes(appt.endTime);
        return slotStart < apptEnd && slotEnd > apptStart;
      });
    });

    res.json({ date, dayOfWeek, slots: available });
  } catch (err) {
    console.error('getAvailableSlots error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
