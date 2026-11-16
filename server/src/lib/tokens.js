import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { ACCESS_TOKEN_MINUTES } from './constants.js';

// Access token: a signed note that says "this is user X" for 15 minutes.
export function signAccessToken({ userId, role }) {
  return jwt.sign({ role }, config.jwtAccessSecret, {
    algorithm: 'HS256',
    subject: userId, // becomes the "sub" claim
    expiresIn: ACCESS_TOKEN_MINUTES * 60, // a plain number means seconds
  });
}

// Returns { userId, role } for a good token, or null for anything else:
// forged, expired, wrong secret, malformed. The caller never sees the reason.
export function verifyAccessToken(token) {
  try {
    // Only HS256 is accepted, whatever the token's own header claims.
    const payload = jwt.verify(token, config.jwtAccessSecret, { algorithms: ['HS256'] });
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

// Refresh token: 32 random bytes written as URL-safe text (43 characters).
export function generateRefreshToken() {
  return randomBytes(32).toString('base64url');
}

// We store only this hash. A leaked database then holds no usable tokens.
export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}