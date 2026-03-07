import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      clientName, clientEmail, clientPhone,
      placement, size, style, description,
      preferredDate, preferredTime, artistId,
    } = req.body;

    if (!clientName || !clientEmail || !clientPhone || !placement || !size || !style || !description || !artistId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const referenceImages = files ? files.map((f) => `/uploads/${f.filename}`) : [];

    const request = await prisma.tattooRequest.create({
      data: {
        clientName, clientEmail, clientPhone,
        placement, size, style, description,
        referenceImages,
        preferredDate: preferredDate || '',
        preferredTime: preferredTime || '',
        artistId,
      },
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getArtistRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = { artistId: req.userId };
    if (status) where.status = status;

    const requests = await prisma.tattooRequest.findMany({
      where,
      include: { quote: true, appointment: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await prisma.tattooRequest.findFirst({
      where: { id: req.params.id, artistId: req.userId },
      include: { quote: true, appointment: true },
    });
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const updated = await prisma.tattooRequest.updateMany({
      where: { id: req.params.id, artistId: req.userId },
      data: { status },
    });
    if (updated.count === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
