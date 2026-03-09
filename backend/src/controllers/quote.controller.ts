import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { createQuoteSchema, cuidParamSchema } from '../lib/validation';
import { ZodError } from 'zod';

function formatZodError(err: ZodError) {
  return err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
}

export const createQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createQuoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const { requestId, priceEstimate, sessionTime, message } = parsed.data;

    // Tenant isolation: verify request belongs to this artist
    const request = await prisma.tattooRequest.findFirst({
      where: { id: requestId, artistId: req.user!.id },
    });
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const quote = await prisma.quote.create({
      data: {
        requestId,
        artistId: req.user!.id,
        priceEstimate: typeof priceEstimate === 'number' ? priceEstimate : parseFloat(String(priceEstimate)),
        sessionTime,
        message,
      },
    });

    await prisma.tattooRequest.updateMany({
      where: { id: requestId, artistId: req.user!.id },
      data: { status: 'QUOTED' },
    });

    res.status(201).json(quote);
  } catch (err) {
    console.error('createQuote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paramParsed = cuidParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      res.status(400).json({ error: 'Invalid quote ID' });
      return;
    }

    // Tenant isolation: verify quote belongs to this artist
    const quote = await prisma.quote.findFirst({
      where: { id: paramParsed.data.id, artistId: req.user!.id },
      include: { request: true },
    });
    if (!quote) {
      res.status(404).json({ error: 'Quote not found' });
      return;
    }

    await prisma.quote.updateMany({
      where: { id: paramParsed.data.id, artistId: req.user!.id },
      data: { status: 'ACCEPTED' },
    });
    await prisma.tattooRequest.updateMany({
      where: { id: quote.requestId, artistId: req.user!.id },
      data: { status: 'APPROVED' },
    });

    res.json({ message: 'Quote accepted' });
  } catch (err) {
    console.error('acceptQuote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuotesByArtist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { artistId: req.user!.id },
      include: { request: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(quotes);
  } catch (err) {
    console.error('getQuotesByArtist error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
