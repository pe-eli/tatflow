import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import {
  setAvailabilitySchema,
  availableSlotsQuerySchema,
  artistIdParamSchema,
} from '../lib/validation';
import { ZodError } from 'zod';

interface DbAvailabilityRow {
  id: string;
  artistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  lunchStart: string | null;
  lunchEnd: string | null;
  slotDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DbAvailabilityBlockRow {
  id: string;
  artistId: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

    const artistId = paramParsed.data.artistId;
    const [schedule, blockedPeriods] = await prisma.$transaction([
      prisma.$queryRaw<DbAvailabilityRow[]>`
        SELECT *
        FROM "Availability"
        WHERE "artistId" = ${artistId}
        ORDER BY "dayOfWeek" ASC
      `,
      prisma.$queryRaw<DbAvailabilityBlockRow[]>`
        SELECT *
        FROM "AvailabilityBlock"
        WHERE "artistId" = ${artistId}
        ORDER BY "date" ASC, "startTime" ASC NULLS FIRST
      `,
    ]);

    res.json({ schedule, blockedPeriods });
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

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        DELETE FROM "AvailabilityBlock"
        WHERE "artistId" = ${artistId}
      `;

      await tx.$executeRaw`
        DELETE FROM "Availability"
        WHERE "artistId" = ${artistId}
      `;

      for (const entry of parsed.data.schedule) {
        await tx.$executeRaw`
          INSERT INTO "Availability" (
            "id", "artistId", "dayOfWeek", "startTime", "endTime", "lunchStart", "lunchEnd", "slotDuration", "createdAt", "updatedAt"
          ) VALUES (
            ${randomUUID()},
            ${artistId},
            ${entry.dayOfWeek},
            ${entry.startTime},
            ${entry.endTime},
            ${entry.lunchStart ?? null},
            ${entry.lunchEnd ?? null},
            ${entry.slotDuration},
            NOW(),
            NOW()
          )
        `;
      }

      for (const block of parsed.data.blockedPeriods) {
        await tx.$executeRaw`
          INSERT INTO "AvailabilityBlock" (
            "id", "artistId", "date", "startTime", "endTime", "createdAt", "updatedAt"
          ) VALUES (
            ${randomUUID()},
            ${artistId},
            ${block.date},
            ${block.startTime ?? null},
            ${block.endTime ?? null},
            NOW(),
            NOW()
          )
        `;
      }
    });

    const [schedule, blockedPeriods] = await prisma.$transaction([
      prisma.$queryRaw<DbAvailabilityRow[]>`
        SELECT *
        FROM "Availability"
        WHERE "artistId" = ${artistId}
        ORDER BY "dayOfWeek" ASC
      `,
      prisma.$queryRaw<DbAvailabilityBlockRow[]>`
        SELECT *
        FROM "AvailabilityBlock"
        WHERE "artistId" = ${artistId}
        ORDER BY "date" ASC, "startTime" ASC NULLS FIRST
      `,
    ]);

    res.json({ schedule, blockedPeriods });
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requestedDate = new Date(date + 'T12:00:00');
    requestedDate.setHours(0, 0, 0, 0);

    if (requestedDate <= today) {
      res.json({ date, slots: [] });
      return;
    }

    // Determine day of week (JS: 0=Sunday)
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();

    // Get availability for this day
    const [availabilityRows, blockedPeriods, appointments] = await prisma.$transaction([
      prisma.$queryRaw<DbAvailabilityRow[]>`
        SELECT *
        FROM "Availability"
        WHERE "artistId" = ${artistId} AND "dayOfWeek" = ${dayOfWeek}
        LIMIT 1
      `,
      prisma.$queryRaw<DbAvailabilityBlockRow[]>`
        SELECT *
        FROM "AvailabilityBlock"
        WHERE "artistId" = ${artistId} AND "date" = ${date}
      `,
      prisma.appointment.findMany({
        where: { artistId, date },
      }),
    ]);

    const availability = availabilityRows[0];

    if (!availability) {
      res.json({ date, slots: [] });
      return;
    }

    const hasFullDayBlock = blockedPeriods.some((block) => !block.startTime && !block.endTime);
    if (hasFullDayBlock) {
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
    const lunchStart = availability.lunchStart ? timeToMinutes(availability.lunchStart) : null;
    const lunchEnd = availability.lunchEnd ? timeToMinutes(availability.lunchEnd) : null;

    // Filter out slots that overlap with lunch break, blocked periods, or existing appointments
    const available = allSlots.filter((slot) => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);

      const overlapsLunch = lunchStart !== null && lunchEnd !== null && slotStart < lunchEnd && slotEnd > lunchStart;
      if (overlapsLunch) {
        return false;
      }

      const overlapsBlockedPeriod = blockedPeriods.some((block) => {
        if (!block.startTime || !block.endTime) {
          return false;
        }

        const blockStart = timeToMinutes(block.startTime);
        const blockEnd = timeToMinutes(block.endTime);
        return slotStart < blockEnd && slotEnd > blockStart;
      });

      if (overlapsBlockedPeriod) {
        return false;
      }

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
