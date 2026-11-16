import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { config } from '../../src/config.js';
import {
  generateRefreshToken,
  hashToken,
  signAccessToken,
  verifyAccessToken,
} from '../../src/lib/tokens.js';

// Writes an object the way a JWT writes its header and payload.
const toBase64Url = (object) => Buffer.from(JSON.stringify(object)).toString('base64url');

describe('access tokens', () => {
  it('round-trips the user id and role', () => {
    const token = signAccessToken({ userId: 'user-1', role: 'user' });
    expect(verifyAccessToken(token)).toEqual({ userId: 'user-1', role: 'user' });
  });

  it('rejects a token whose payload was changed', () => {
    const token = signAccessToken({ userId: 'user-1', role: 'user' });
    const [header, , signature] = token.split('.');
    // Keep the real header and signature but swap in a forged payload.
    const forged = `${header}.${toBase64Url({ sub: 'user-2', role: 'admin' })}.${signature}`;
    expect(verifyAccessToken(forged)).toBeNull();
  });

  it('rejects a token signed with a different secret', () => {
    const token = jwt.sign({ role: 'user' }, 'some-other-secret-that-is-long-enough-123456', {
      algorithm: 'HS256',
      subject: 'user-1',
      expiresIn: 60,
    });
    expect(verifyAccessToken(token)).toBeNull();
  });

  it('rejects an expired token', () => {
    const token = jwt.sign(
      { role: 'user', exp: Math.floor(Date.now() / 1000) - 10 }, // expired 10 seconds ago
      config.jwtAccessSecret,
      { algorithm: 'HS256', subject: 'user-1' },
    );
    expect(verifyAccessToken(token)).toBeNull();
  });

  it('rejects a token that claims it needs no signature', () => {
    const unsigned = `${toBase64Url({ alg: 'none', typ: 'JWT' })}.${toBase64Url({ sub: 'user-1', role: 'admin' })}.`;
    expect(verifyAccessToken(unsigned)).toBeNull();
  });
});

describe('refresh tokens', () => {
  it('are long, random and different every time', () => {
    const first = generateRefreshToken();
    const second = generateRefreshToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(43);
  });

  it('are stored as a stable SHA-256 hash, never as the token itself', () => {
    const token = generateRefreshToken();
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });
});