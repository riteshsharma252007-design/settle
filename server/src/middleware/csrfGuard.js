import { forbidden } from '../lib/errors.js';

// Requests that only read data are safe from forgery; the others must prove
// they come from our own page. A form on another website cannot add this header.
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function csrfGuard(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }
  if (req.get('X-Requested-With') !== 'fetch') {
    return next(forbidden('Missing X-Requested-With header.'));
  }
  next();
}