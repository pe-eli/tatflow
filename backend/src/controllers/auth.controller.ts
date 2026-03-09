import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { getJwtSecret, AuthRequest } from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  updateSlugSchema,
  updateWhatsappMessageSchema,
  updateStudioNameSchema,
  slugParamSchema,
} from '../lib/validation';
import { ZodError } from 'zod';

const USER_SELECT = {
  id: true, name: true, email: true, role: true,
  studioName: true, city: true, instagram: true,
  slug: true, whatsappMessage: true,
} as const;

function formatZodError(err: ZodError) {
  return err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const { name, email, password, studioName, city, instagram } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Este e-mail já está em uso' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'ARTIST', studioName, city, instagram },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, studioName: user.studioName, slug: user.slug, whatsappMessage: user.whatsappMessage },
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'E-mail ou senha inválidos' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'E-mail ou senha inválidos' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, studioName: user.studioName, slug: user.slug, whatsappMessage: user.whatsappMessage },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: USER_SELECT,
    });
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkSlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = slugParamSchema.safeParse(req.params);
    if (!parsed.success) {
      res.json({ available: false, reason: 'Formato de link inválido' });
      return;
    }
    const { slug } = parsed.data;

    const reserved = ['admin', 'dashboard', 'login', 'register', 'request', 'requests', 'calendar', 'availability', 'api', 'settings'];
    if (reserved.includes(slug)) {
      res.json({ available: false, reason: 'Este nome é reservado pelo sistema' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { slug } });
    res.json({ available: !existing });
  } catch (err) {
    console.error('checkSlug error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = updateSlugSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const { slug } = parsed.data;

    const reserved = ['admin', 'dashboard', 'login', 'register', 'request', 'requests', 'calendar', 'availability', 'api', 'settings'];
    if (reserved.includes(slug)) {
      res.status(400).json({ error: 'Este nome é reservado pelo sistema' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { slug } });
    if (existing && existing.id !== req.user!.id) {
      res.status(409).json({ error: 'Este link já está em uso' });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { slug },
      select: USER_SELECT,
    });
    res.json(user);
  } catch (err) {
    console.error('updateSlug error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateWhatsappMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = updateWhatsappMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const { whatsappMessage } = parsed.data;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { whatsappMessage },
      select: USER_SELECT,
    });
    res.json(user);
  } catch (err) {
    console.error('updateWhatsappMessage error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStudioName = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = updateStudioNameSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZodError(parsed.error) });
      return;
    }
    const { studioName } = parsed.data;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { studioName },
      select: USER_SELECT,
    });
    res.json(user);
  } catch (err) {
    console.error('updateStudioName error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
