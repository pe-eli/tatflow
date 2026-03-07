import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createRequest,
  getArtistRequests,
  getRequestById,
  updateRequestStatus,
} from '../controllers/request.controller';
import { authenticate } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

const router = Router();

// Public route - clients submit without auth
router.post('/', upload.array('referenceImages', 5), createRequest);

// Protected routes - artist only
router.get('/', authenticate, getArtistRequests);
router.get('/:id', authenticate, getRequestById);
router.patch('/:id/status', authenticate, updateRequestStatus);

export default router;
