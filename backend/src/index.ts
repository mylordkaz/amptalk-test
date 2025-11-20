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

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments (*.vercel.app)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

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
