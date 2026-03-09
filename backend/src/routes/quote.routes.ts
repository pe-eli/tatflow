import { Router } from 'express';
import { createQuote, acceptQuote, getQuotesByArtist } from '../controllers/quote.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createQuote);
router.get('/', authenticate, getQuotesByArtist);
router.patch('/:id/accept', authenticate, acceptQuote);

export default router;
