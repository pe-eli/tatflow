import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  /** @deprecated Use req.user.id */
  userId?: string;
  /** @deprecated Use req.user.role */
  userRole?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
  }
  return secret;
}

export { getJwtSecret };

// Allowed JWT algorithms — prevent algorithm confusion attacks
const JWT_ALGORITHMS: jwt.Algorithm[] = ['HS256'];

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7); // safer than split
  if (!token || token.length > 2048) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: JWT_ALGORITHMS,
      maxAge: '7d',
    }) as {
      userId: string;
      role: string;
    };

    // Validate payload shape
    if (!payload.userId || typeof payload.userId !== 'string' || !payload.role || typeof payload.role !== 'string') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.user = { id: payload.userId, role: payload.role };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
