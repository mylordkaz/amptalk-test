/**
 * Vercel Serverless Function Entry Point
 *
 * This file serves as the entry point for Vercel's serverless deployment.
 * It imports the Express app and exports it for Vercel's serverless runtime.
 */

import app from '../src/index';

// Export the Express app for Vercel serverless
export default app;
