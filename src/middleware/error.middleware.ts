import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Known / operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Unknown / programmer errors
  console.error('UNEXPECTED ERROR:', err);

  return res.status(500).json({
    error: 'Internal Server Error',
  });
}
