import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken, getTokenCookieName } from '../utils/jwt';

/**
 * Authentication middleware
 * Verifies JWT token from HTTP-only cookie and attaches user to request
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from cookie
    const token = req.cookies[getTokenCookieName()];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. No token provided.',
      });
      return;
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token.',
      });
      return;
    }

    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed.',
    });
  }
}
