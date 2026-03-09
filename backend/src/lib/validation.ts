import { z } from 'zod';

// === Auth ===

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.literal('ARTIST'),
  studioName: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  instagram: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export const updateSlugSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9_-]+$/, 'Slug must contain only lowercase letters, numbers, hyphens and underscores'),
});

export const updateWhatsappMessageSchema = z.object({
  whatsappMessage: z.string().max(500).optional().default(''),
});

export const updateStudioNameSchema = z.object({
  studioName: z.string().min(2).max(100).transform((v) => v.trim()),
});

// === Tattoo Requests ===

export const createRequestSchema = z.object({
  clientName: z.string().min(2).max(100),
  clientEmail: z.string().email().max(255),
  clientPhone: z.string().min(8).max(30),
  placement: z.string().min(1).max(100),
  size: z.string().min(1).max(50),
  style: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  preferredDate: z.string().max(20).optional().default(''),
  preferredTime: z.string().max(20).optional().default(''),
  artistId: z.string().cuid(),
});

const requestStatusEnum = z.enum(['PENDING', 'QUOTED', 'APPROVED', 'REJECTED', 'SCHEDULED', 'CANCELLED']);

export const updateRequestStatusSchema = z.object({
  status: requestStatusEnum,
});

export const artistRequestsQuerySchema = z.object({
  status: requestStatusEnum.optional(),
});

// === Quotes ===

export const createQuoteSchema = z.object({
  requestId: z.string().cuid(),
  priceEstimate: z.union([z.number().positive(), z.string().transform((v) => {
    const n = parseFloat(v);
    if (isNaN(n) || n <= 0) throw new Error('priceEstimate must be a positive number');
    return n;
  })]),
  sessionTime: z.string().min(1).max(50),
  message: z.string().min(1).max(2000),
});

// === Appointments ===

const timeRegex = /^\d{2}:\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createAppointmentSchema = z.object({
  requestId: z.string().cuid(),
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  notes: z.string().max(1000).optional(),
});

export const createManualAppointmentSchema = z.object({
  clientName: z.string().min(1).max(100),
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  notes: z.string().max(1000).optional(),
});

export const updateAppointmentSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD').optional(),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM').optional(),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM').optional(),
  notes: z.string().max(1000).optional(),
});

// === Availability ===

const scheduleEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  slotDuration: z.number().int().min(15).max(480).optional().default(60),
});

export const setAvailabilitySchema = z.object({
  schedule: z.array(scheduleEntrySchema).min(0).max(21),
});

export const availableSlotsQuerySchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
});

// === Param schemas ===

export const cuidParamSchema = z.object({
  id: z.string().cuid(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9_-]+$/),
});

export const artistIdParamSchema = z.object({
  artistId: z.string().cuid(),
});

export const identifierParamSchema = z.object({
  identifier: z.string().min(1).max(100),
});
