import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import {
  createRequestSchema,
  updateRequestStatusSchema,
  artistRequestsQuerySchema,
  cuidParamSchema,
  identifierParamSchema,
} from '../lib/validation';
import { ZodError } from 'zod';

function formatZodError(err: ZodError) {
  return err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
}

export const resolveArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = identifierParamSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid identifier' });
      return;
    }
    const { identifier } = parsed.data;

    let user = await prisma.user.findUnique({ where: { slug: identifier }, select: { id: true, name: true, studioName: true } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { id: identifier }, select: { id: true, name: true, studioName: true } });
    }
    if (!user) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error('resolveArtist error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const data = parsed.data;

    // Verify artist exists
    const artist = await prisma.user.findUnique({ where: { id: data.artistId }, select: { id: true } });
    if (!artist) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const referenceImages = files ? files.map((f) => `/uploads/${f.filename}`) : [];

    const request = await prisma.tattooRequest.create({
      data: {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        placement: data.placement,
        size: data.size,
        style: data.style,
        description: data.description,
        referenceImages,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        artistId: data.artistId,
      },
    });

    res.status(201).json(request);
  } catch (err) {
    console.error('createRequest error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getArtistRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const queryParsed = artistRequestsQuerySchema.safeParse(req.query);
    const where: Record<string, unknown> = { artistId: req.user!.id };
    if (queryParsed.success && queryParsed.data.status) {
      where.status = queryParsed.data.status;
    }

    const requests = await prisma.tattooRequest.findMany({
      where,
      include: { quote: true, appointment: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    console.error('getArtistRequests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paramParsed = cuidParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      res.status(400).json({ error: 'Invalid request ID' });
      return;
    }

    const request = await prisma.tattooRequest.findFirst({
      where: { id: paramParsed.data.id, artistId: req.user!.id },
      include: { quote: true, appointment: true },
    });
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    res.json(request);
  } catch (err) {
    console.error('getRequestById error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paramParsed = cuidParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      res.status(400).json({ error: 'Invalid request ID' });
      return;
    }

    const bodyParsed = updateRequestStatusSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: formatZodError(bodyParsed.error) });
      return;
    }

    const updated = await prisma.tattooRequest.updateMany({
      where: { id: paramParsed.data.id, artistId: req.user!.id },
      data: { status: bodyParsed.data.status },
    });
    if (updated.count === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error('updateRequestStatus error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
