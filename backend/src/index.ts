import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import imageRoutes from "./routes/imageRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

const defaultOrigins = ["http://localhost:5175", "http://localhost:5173"];
const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];
const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

// Simplified CORS middleware for unified Vercel deployment (develop branch)
// For same-domain deployment, most CORS headers are not needed
// For separate deployments (production: Cloudflare + Render), CORS is still configured
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Set CORS headers only when there's a different origin
  // (same-domain requests won't have CORS issues)
  if (origin) {
    let isAllowed = false;

    if (allowedOrigins.includes(origin)) {
      isAllowed = true;
    } else if (origin.endsWith('.vercel.app')) {
      isAllowed = true;
    } else if (origin.includes('cloudflare')) {
      isAllowed = true;
    }

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
      res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
    }
  }

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

app.get("/", (_req, res) => {
  res.send({ ok: true, service: "api", time: new Date().toISOString() });
});

app.get("/hello", (_req, res) => res.json({ message: "Hello from Render!" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running!" });
});

// Only start the server when not in Vercel serverless environment
// Vercel will handle the server lifecycle
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => {
    console.log(`API listening on :${PORT}`);
  });
}

// Export the Express app for Vercel serverless and testing
export default app;
