import { z } from 'zod';

// ─── Security Sanitizers ─────────────────────────────────────────

/** Strip HTML tags and dangerous chars from freetext input */
function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')       // strip HTML tags
    .replace(/[<>]/g, '')          // strip remaining angle brackets
    .trim();
}

/** Zod transform that sanitizes and trims text */
const safeText = (minLen: number, maxLen: number) =>
  z.string().min(minLen).max(maxLen).transform(sanitizeText);

// === Auth ===

export const registerSchema = z.object({
  name: safeText(2, 100),
  email: z.string().email('E-mail inválido').max(255).transform((v) => v.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128)
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  role: z.literal('ARTIST'),
  studioName: safeText(0, 100).optional(),
  state: safeText(0, 2).optional(),
  city: safeText(0, 100).optional(),
  instagram: z.string().max(100).regex(/^[a-zA-Z0-9._]*$/, 'Instagram inválido').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').max(255).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'Senha é obrigatória').max(128),
});

export const updateSlugSchema = z.object({
  slug: z.string().min(3, 'Link deve ter pelo menos 3 caracteres').max(50).regex(/^[a-z0-9_-]+$/, 'Link deve conter apenas letras minúsculas, números, hífens e sublinhados'),
});

export const updateWhatsappMessageSchema = z.object({
  whatsappMessage: z.string().max(500).optional().default('').transform(sanitizeText),
});

export const updateStudioNameSchema = z.object({
  studioName: safeText(2, 100),
});

export const updateRequireReferenceImagesSchema = z.object({
  requireReferenceImages: z.boolean(),
});

// === Tattoo Requests ===

export const createRequestSchema = z.object({
  clientName: safeText(2, 100),
  clientEmail: z.string().email().max(255).transform((v) => v.toLowerCase().trim()),
  clientPhone: z.string().min(8).max(30).regex(/^[\d() +-]+$/, 'Telefone inválido'),
  placement: safeText(1, 200),
  size: safeText(1, 50),
  style: safeText(1, 100),
  description: safeText(1, 2000),
  preferredDate: z.string().max(20).regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Data inválida').optional().default(''),
  preferredTime: z.string().max(20).regex(/^(\d{2}:\d{2})?$/, 'Horário inválido').optional().default(''),
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
  priceEstimate: z.union([
    z.number().positive().max(999999),
    z.string().transform((v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n <= 0 || n > 999999) throw new Error('priceEstimate must be a positive number (max 999999)');
      return n;
    }),
  ]),
  sessionTime: safeText(1, 50),
  message: safeText(1, 2000),
});

// === Appointments ===

const timeRegex = /^\d{2}:\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createAppointmentSchema = z.object({
  requestId: z.string().cuid(),
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  notes: z.string().max(1000).optional().transform((v) => v ? sanitizeText(v) : v),
});

export const createManualAppointmentSchema = z.object({
  clientName: safeText(1, 100),
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  notes: z.string().max(1000).optional().transform((v) => v ? sanitizeText(v) : v),
});

export const updateAppointmentSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD').optional(),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM').optional(),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM').optional(),
  notes: z.string().max(1000).optional().transform((v) => v ? sanitizeText(v) : v),
});

// === Availability ===

const scheduleEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM'),
  lunchStart: z.string().regex(timeRegex, 'Time must be HH:MM').optional(),
  lunchEnd: z.string().regex(timeRegex, 'Time must be HH:MM').optional(),
  slotDuration: z.number().int().min(15).max(480).optional().default(60),
}).superRefine((value, ctx) => {
  if ((value.lunchStart && !value.lunchEnd) || (!value.lunchStart && value.lunchEnd)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['lunchStart'],
      message: 'Lunch break requires both start and end times',
    });
  }

  if (value.startTime >= value.endTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['startTime'],
      message: 'startTime must be earlier than endTime',
    });
  }

  if (value.lunchStart && value.lunchEnd) {
    if (value.lunchStart >= value.lunchEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lunchStart'],
        message: 'lunchStart must be earlier than lunchEnd',
      });
    }

    if (value.lunchStart < value.startTime || value.lunchEnd > value.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lunchStart'],
        message: 'Lunch break must stay within the working hours',
      });
    }
  }
});

const availabilityBlockSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM').optional(),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM').optional(),
}).superRefine((value, ctx) => {
  const hasStart = !!value.startTime
  const hasEnd = !!value.endTime

  if (hasStart !== hasEnd) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['startTime'],
      message: 'Blocked time range requires both startTime and endTime',
    })
  }

  if (hasStart && hasEnd && value.startTime! >= value.endTime!) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['startTime'],
      message: 'startTime must be earlier than endTime',
    })
  }
});

export const setAvailabilitySchema = z.object({
  schedule: z.array(scheduleEntrySchema).min(0).max(21),
  blockedPeriods: z.array(availabilityBlockSchema).max(365).optional().default([]),
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
  identifier: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid identifier'),
});

// === Tattoo Styles ===

export const updateTattooStylesSchema = z.object({
  styles: z.array(z.string().min(1).max(60).transform(sanitizeText)).max(30),
});
