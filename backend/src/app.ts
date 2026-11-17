import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import recordingsRoutes from './routes/recordingsRoutes';
import jobsRoutes from './routes/jobsRoutes';
import foldersRoutes from './routes/foldersRoutes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

export function createApp(): Application {
  const app = express();

  // CORS setup
  app.use(
    cors({
      origin: '*', // Allow development frontend requests
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads serving (for previewing raw and cleaned audio)
  app.use('/uploads', express.static(env.UPLOADS_DIR));

  // Health checks
  const healthHandler = (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'notewise-backend',
      timestamp: new Date().toISOString(),
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // API Routes
  app.use('/api/recordings', recordingsRoutes);
  app.use('/api/jobs', jobsRoutes);
  app.use('/api/folders', foldersRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Centralized Error handling
  app.use(errorHandler);

  return app;
}

