import { Request, Response, NextFunction } from 'express';
import { CsvParseError, AssignmentFailedError, InvalidInputError } from '../errors/SecretSantaErrors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err);

  if (err instanceof CsvParseError || err instanceof InvalidInputError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof AssignmentFailedError) {
    res.status(422).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}