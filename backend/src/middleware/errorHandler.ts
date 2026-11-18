import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[ErrorHandler] Error caught:', err);

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: 'Uploaded audio exceeds the 100MB size limit.',
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message,
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred',
  });
}

