import jwt from 'jsonwebtoken';
import { httpError } from './errorHandler.js';

const SECRET = () => process.env.JWT_SECRET || 'dev-secret-change-me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, SECRET(), {
    expiresIn: EXPIRES_IN
  });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET());
}

/**
 * requireAuth — Bearer-token guard for protected routes.
 * Attaches `req.user = { id, email }` on success.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next(httpError(401, 'Sign in to continue.'));

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    next(httpError(401, 'Your session expired. Please sign in again.'));
  }
}
