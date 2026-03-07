import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId, priceEstimate, sessionTime, message } = req.body;

    if (!requestId || !priceEstimate || !sessionTime || !message) {
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

    const quote = await prisma.quote.create({
      data: {
        requestId,
        artistId: req.userId!,
        priceEstimate: parseFloat(priceEstimate),
        sessionTime,
        message,
      },
    });

    await prisma.tattooRequest.update({
      where: { id: requestId },
      data: { status: 'QUOTED' },
    });

    res.status(201).json(quote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const acceptQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { request: true },
    });
    if (!quote) {
      res.status(404).json({ error: 'Quote not found' });
      return;
    }

    await prisma.quote.update({ where: { id }, data: { status: 'ACCEPTED' } });
    await prisma.tattooRequest.update({
      where: { id: quote.requestId },
      data: { status: 'APPROVED' },
    });

    res.json({ message: 'Quote accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getQuotesByArtist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { artistId: req.userId },
      include: { request: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(quotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
