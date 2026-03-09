import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import requestRoutes from './routes/request.routes';
import quoteRoutes from './routes/quote.routes';
import appointmentRoutes from './routes/appointment.routes';
import availabilityRoutes from './routes/availability.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/quotes', quoteRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/availability', availabilityRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'TatFlow API' }));

app.listen(PORT, () => {
  console.log(`TatFlow backend running on http://localhost:${PORT}`);
});
