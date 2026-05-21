import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import router from './routes';

const app = express();

// ── Body Parsers ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ──
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// ── Static (uploaded files) ──
app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));

// ── API Routes ──
app.use('/api', router);

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler (MUST be last) ──
app.use(errorHandler);

export default app;
