import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { updateTattooStylesSchema, identifierParamSchema } from '../lib/validation';
import { ZodError } from 'zod';

function formatZodError(err: ZodError) {
  return err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
}

/** GET /styles/:identifier — public, returns artist's styles list */
export const getArtistStyles = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = identifierParamSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid identifier' });
      return;
    }
    const { identifier } = parsed.data;

    // Resolve artist by slug first, then by ID
    let artist = await prisma.user.findUnique({ where: { slug: identifier }, select: { id: true } });
    if (!artist) {
      artist = await prisma.user.findUnique({ where: { id: identifier }, select: { id: true } });
    }
    if (!artist) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }

    const styles = await prisma.tattooStyle.findMany({
      where: { artistId: artist.id },
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    });

    res.json(styles.map((s) => s.name));
  } catch (err) {
    console.error('getArtistStyles error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/** GET /styles — authenticated, returns own styles */
export const getMyStyles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const styles = await prisma.tattooStyle.findMany({
      where: { artistId: req.user!.id },
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    });
    res.json(styles.map((s) => s.name));
  } catch (err) {
    console.error('getMyStyles error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/** PUT /styles — authenticated, replaces entire list */
export const updateStyles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = updateTattooStylesSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const { styles } = parsed.data;

    // Deduplicate (case-insensitive), keep first occurrence
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const s of styles) {
      const key = s.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
    }

    // Replace all in a transaction
    await prisma.$transaction([
      prisma.tattooStyle.deleteMany({ where: { artistId: req.user!.id } }),
      ...unique.map((name, idx) =>
        prisma.tattooStyle.create({
          data: { name, artistId: req.user!.id, order: idx },
        })
      ),
    ]);

    res.json(unique);
  } catch (err) {
    console.error('updateStyles error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
