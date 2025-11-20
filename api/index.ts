/**
 * Vercel Serverless Function Entry Point
 *
 * This file serves as the entry point for Vercel's serverless deployment.
 * It imports the Express app from the backend and exports it for Vercel's serverless runtime.
 *
 * Note: This is for the unified frontend+backend deployment on Vercel (develop branch).
 */

import app from '../backend/src/index';

// Export the Express app for Vercel serverless
export default app;
