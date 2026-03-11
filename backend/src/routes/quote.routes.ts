import { Router } from 'express';
import { createQuote, acceptQuote, getQuotesByArtist } from '../controllers/quote.controller';
import { authenticate } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', authenticate, writeLimiter, createQuote);
router.get('/', authenticate, getQuotesByArtist);
router.patch('/:id/accept', authenticate, writeLimiter, acceptQuote);

export default router;
