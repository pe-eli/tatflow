import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Public — get artist's weekly schedule
export const getArtistAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { artistId } = req.params;
    const availability = await prisma.availability.findMany({
      where: { artistId },
      orderBy: { dayOfWeek: 'asc' },
    });
    res.json(availability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Protected — artist sets weekly availability (replaces all)
export const setArtistAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { schedule } = req.body;
    // schedule: Array<{ dayOfWeek: number, startTime: string, endTime: string, slotDuration?: number }>

    if (!Array.isArray(schedule)) {
      res.status(400).json({ error: 'schedule must be an array' });
      return;
    }

    // Delete existing availability
    await prisma.availability.deleteMany({ where: { artistId: req.userId! } });

    // Create new entries
    const entries = schedule.map((s: { dayOfWeek: number; startTime: string; endTime: string; slotDuration?: number }) => ({
      artistId: req.userId!,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      slotDuration: s.slotDuration || 60,
    }));

    await prisma.availability.createMany({ data: entries });

    const result = await prisma.availability.findMany({
      where: { artistId: req.userId! },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Public — get available time slots for a specific date
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { artistId } = req.params;
    const { date } = req.query; // "YYYY-MM-DD"

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'date query param is required (YYYY-MM-DD)' });
      return;
    }

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
        // Overlap check
        return slotStart < apptEnd && slotEnd > apptStart;
      });
    });

    res.json({ date, dayOfWeek, slots: available });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
