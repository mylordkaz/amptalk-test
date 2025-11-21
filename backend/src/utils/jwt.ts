import "dotenv/config";
import jwt from "jsonwebtoken";
import ms from "ms";
import { Response } from "express";

// Validate and assign JWT_SECRET
const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error('JWT_SECRET environment variable is required.');
}
const JWT_SECRET: string = rawSecret;

// Validate and assign JWT_EXPIRES_IN
const rawExpiresIn = process.env.JWT_EXPIRES_IN;
if (!rawExpiresIn) {
  throw new Error('JWT_EXPIRES_IN environment variable is required.');
}
const JWT_EXPIRES_IN: string = rawExpiresIn;

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";

// Cookie name for JWT token
const TOKEN_COOKIE_NAME = "auth_token";

// Parse JWT_EXPIRES_IN to milliseconds
const parsedExpires = ms(JWT_EXPIRES_IN as ms.StringValue);
if (typeof parsedExpires !== 'number' || parsedExpires <= 0) {
  throw new Error(
    `Invalid JWT_EXPIRES_IN format: "${JWT_EXPIRES_IN}". ` +
    'Expected formats: "7d", "24h", "30m", "3600", "1y", etc.'
  );
}
const JWT_EXPIRES_IN_MS: number = parsedExpires;
const JWT_EXPIRES_IN_SECONDS = Math.floor(JWT_EXPIRES_IN_MS / 1000);

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generate a JWT token for a user
 * @param userId - User ID
 * @param email - User email
 * @returns JWT token string
 */
export function generateToken(userId: string, email: string): string {
  const payload: JwtPayload = { userId, email };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN_SECONDS,
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded JWT payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Set JWT token as HTTP-only cookie
 * @param res - Express response object
 * @param token - JWT token string
 */
export function createTokenCookie(res: Response, token: string): void {
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: JWT_EXPIRES_IN_MS,
  });
}

/**
 * Clear the JWT token cookie (logout)
 * @param res - Express response object
 */
export function clearTokenCookie(res: Response): void {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
}

/**
 * Get the token cookie name
 */
export function getTokenCookieName(): string {
  return TOKEN_COOKIE_NAME;
}
