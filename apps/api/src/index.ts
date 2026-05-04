import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { transcribeRouter } from "./routes/transcribe.route";
import { analyzeRouter } from "./routes/analyze.route";
import { pipelineRouter } from "./routes/pipeline.route";
import { errorHandler } from "./middleware/errorHandler";
import { verifyOpenAIConnection } from "./services/openai.service";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = process.env["PORT"] ?? 3001;

// -----------------------------------------------------------
// Middleware
// -----------------------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env["FRONTEND_URL"] ?? "http://localhost:3000",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
if (process.env["NODE_ENV"] !== "production") {
  app.use((req, _res, next) => {
    console.info(`→ ${req.method} ${req.path}`);
    next();
  });
}

// -----------------------------------------------------------
// Health check
// -----------------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env["NODE_ENV"] ?? "development",
  });
});

// -----------------------------------------------------------
// API Routes
// -----------------------------------------------------------
app.use("/api/transcribe", transcribeRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/pipeline", pipelineRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found", code: "NOT_FOUND" });
});

// Global error handler (must be last)
app.use(errorHandler);

// -----------------------------------------------------------
// Start
// -----------------------------------------------------------
async function start() {
  console.info("🔍 Verifying OpenAI connection...");
  const isConnected = await verifyOpenAIConnection().catch(() => false);

  if (!isConnected) {
    console.warn(
      "⚠️  OpenAI API key not verified — set OPENAI_API_KEY in apps/api/.env.local"
    );
  } else {
    console.info("✅ OpenAI connection verified");
  }

  app.listen(PORT, () => {
    console.info(`\n🚀 API server running at http://localhost:${PORT}`);
    console.info(`   Health: http://localhost:${PORT}/health`);
    console.info(`   Routes:`);
    console.info(`     POST /api/transcribe  — Whisper audio → text`);
    console.info(`     POST /api/analyze     — GPT-4o transcript → analysis`);
    console.info(`     POST /api/pipeline    — Full pipeline (SSE stream)\n`);
  });
}

start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

export { app };
