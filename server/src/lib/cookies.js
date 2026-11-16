import { config } from '../config.js';
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_MINUTES,
  MS_PER_DAY,
  MS_PER_MINUTE,
  REFRESH_COOKIE,
  REFRESH_TOKEN_DAYS,
} from './constants.js';

// Both cookies are httpOnly (JavaScript cannot read them) and Secure in production.
// The refresh cookie is Strict and only travels to /api/auth.
const accessOptions = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'lax',
  path: '/',
};
const refreshOptions = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'strict',
  path: '/api/auth',
};

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...accessOptions,
    maxAge: ACCESS_TOKEN_MINUTES * MS_PER_MINUTE,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...refreshOptions,
    maxAge: REFRESH_TOKEN_DAYS * MS_PER_DAY,
  });
}

// To delete a cookie the path must match the one it was set with.
export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, accessOptions);
  res.clearCookie(REFRESH_COOKIE, refreshOptions);
}