import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import router from './routes';

const app = express();

// ── CORS ──
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsers ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ──
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// ── Static (uploaded files) ──
app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));

// ── Swagger UI ──
app.use('/doc-assets', express.static(path.join(process.cwd(), 'node_modules', 'swagger-ui-dist')));
app.use('/doc', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'swagger-ui.html'));
});
app.use('/swagger-ui.html', express.static(path.join(process.cwd(), 'swagger-ui.html')));
app.get('/openapi.json', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'openapi.json'));
});
app.get('/openapi.yaml', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'openapi.yaml'));
});

// ── API Routes ──
app.use('/api', router);

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler (MUST be last) ──
app.use(errorHandler);

export default app;
