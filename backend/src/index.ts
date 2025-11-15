import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import imageRoutes from "./routes/imageRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

const defaultOrigins = ["http://localhost:5175"];
const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];
const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
