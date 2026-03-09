import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import requestRoutes from './routes/request.routes';
import quoteRoutes from './routes/quote.routes';
import appointmentRoutes from './routes/appointment.routes';
import availabilityRoutes from './routes/availability.routes';

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

// Security headers
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

// CORS — restrict to frontend origin
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
}));

app.use(express.json({ limit: '1mb' }));

// Serve uploaded files with cache headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  immutable: true,
}));

// Rate limiters
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/quotes', quoteRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/availability', availabilityRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler — never expose stack traces
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TatFlow backend running on port ${PORT}`);
});
