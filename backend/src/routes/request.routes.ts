import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import {
  createRequest,
  getArtistRequests,
  getRequestById,
  updateRequestStatus,
  resolveArtist,
} from '../controllers/request.controller';
import { authenticate } from '../middleware/auth';
import { publicCreateLimiter, writeLimiter } from '../middleware/rateLimiter';

// ─── Secure File Upload ──────────────────────────────────────────

// Strict whitelist of allowed image extensions
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    // Use crypto random bytes instead of Math.random for unpredictable filenames
    const unique = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
    const ext = path.extname(file.originalname).toLowerCase();
    // Only use whitelisted extensions
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error('Invalid file extension'), '');
      return;
    }
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5 MB per file
    files: 5,                      // max 5 files
    fieldSize: 1024 * 100,         // max 100kb per field value
    fields: 20,                    // max 20 non-file fields
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIMES.has(file.mimetype)) {
      cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
      return;
    }
    // Block filenames with null bytes or path traversal
    if (file.originalname.includes('\0') || file.originalname.includes('..')) {
      cb(new Error('Invalid filename'));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

// Public routes — aggressive rate limiting for unauthenticated endpoints
router.post('/', publicCreateLimiter, upload.array('referenceImages', 5), createRequest);
router.get('/artist/:identifier', resolveArtist);

// Protected routes — artist only
router.get('/', authenticate, getArtistRequests);
router.get('/:id', authenticate, getRequestById);
router.patch('/:id/status', authenticate, writeLimiter, updateRequestStatus);

export default router;
