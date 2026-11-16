import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

// Runs when a request matches no route under /api.
export function notFoundHandler(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', 'Not found.'));
}

// Some failures come from libraries, not from our own code. Turn the ones we
// understand into AppErrors, so every error leaves the server in the same shape.
function normalise(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') {
    return new AppError(400, 'VALIDATION_ERROR', 'Request body is not valid JSON.');
  }
  if (err.type === 'entity.too.large') {
    return new AppError(400, 'VALIDATION_ERROR', 'Request body is too large.');
  }
  return null;
}

// Express knows this is an error handler because it has FOUR parameters,
// so 'next' must stay in the list even though we never call it.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const known = normalise(err);

  if (known) {
    const body = { code: known.code, message: known.message };
    if (known.fields) body.fields = known.fields;
    return res.status(known.status).json({ error: body });
  }

  // A real bug. Log the details for us; tell the client nothing about them.
  // Only the message and stack are logged: never request bodies, cookies or emails.
  logger.error(
    { reqId: req.id, err: { name: err.name, message: err.message, stack: err.stack } },
    'Unhandled error',
  );
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong.' } });
}