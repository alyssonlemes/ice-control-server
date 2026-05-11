import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

type ErrorLike = {
  code?: string;
  message?: string;
  status?: number;
  statusCode?: number;
};

function resolveStatus(err: ErrorLike): number {
  if (typeof err.status === 'number') return err.status;
  if (typeof err.statusCode === 'number') return err.statusCode;

  switch (err.code) {
    case 'INVALID_PAYLOAD':
    case 'INVALID_TENANT':
      return 400;
    case 'UNAUTHORIZED':
    case 'INVALID_CREDENTIALS':
    case 'INVALID_TOKEN':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    default:
      return 500;
  }
}

export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'INVALID_PAYLOAD',
      message: err.issues.map((issue) => issue.message).join('; '),
    });
  }

  const error = (err ?? {}) as ErrorLike;
  const status = resolveStatus(error);
  const message = error.message || (status === 500 ? 'Internal server error' : 'Error');

  return res.status(status).json({
    error: error.code || 'ERROR',
    message,
  });
}