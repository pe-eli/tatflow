import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { apiLimiter, authLimiter, slugCheckLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';
import requestRoutes from './routes/request.routes';
import quoteRoutes from './routes/quote.routes';
import appointmentRoutes from './routes/appointment.routes';
import availabilityRoutes from './routes/availability.routes';
import styleRoutes from './routes/style.routes';

dotenv.config();

// Validate required env vars at startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL must be set');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Disable X-Powered-By header (information leakage)
app.disable('x-powered-by');

// Trust proxy (required for rate limiting behind reverse proxy / Vercel)
app.set('trust proxy', 1);

// Security headers — hardened helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// ─── CORS ────────────────────────────────────────────────────────

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((o) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600, // Pre-flight cache 10 min
}));

// ─── Body Parsers ────────────────────────────────────────────────

// Tighter JSON limit (50kb is enough for all JSON payloads in this app)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// ─── Static Files ────────────────────────────────────────────────

// Serve uploaded files — only images, with security headers
app.use('/uploads', (req, res, next) => {
  // Block directory listing / traversal
  if (req.path.includes('..') || req.path.includes('\\')) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  // Only serve known image extensions
  const ext = path.extname(req.path).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  dotfiles: 'deny',
  index: false,
}));

// ─── Apply Rate Limiters ─────────────────────────────────────────

// Auth - tightest limits
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/check-slug', slugCheckLimiter);

// Global fallback
app.use(apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────

app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/quotes', quoteRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/availability', availabilityRoutes);
app.use('/styles', styleRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Global Error Handler ────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Log error but NEVER expose details to client
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled error:', err);
  } else {
    console.error('Unhandled error:', err.message);
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TatFlow backend running on port ${PORT}`);
});
