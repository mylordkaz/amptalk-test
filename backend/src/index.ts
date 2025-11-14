import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import imageRoutes from "./routes/imageRoutes";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));

app.use(express.json());

// API Routes
app.use("/api/images", imageRoutes);

app.get("/", (_req, res) => {
  res.send({ ok: true, service: "api", time: new Date().toISOString() });
});

app.get("/hello", (_req, res) => res.json({ message: "Hello from Render!" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running!" });
});

// Render sets PORT for you
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
