import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { transcribeAudio, analyzeTranscript } from "../services/openai.service";
import type { StreamEvent } from "@answer-craft/types";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const PipelineQuerySchema = z.object({
  question: z.string().optional(),
  jobRole: z.string().optional(),
});

// Helper to write SSE events
function writeSSE<T>(res: Response, event: StreamEvent<T>) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

// POST /api/pipeline  — multipart/form-data with audio file
// Streams back SSE events: transcription_start → transcription_done → analysis_start → analysis_done
router.post(
  "/",
  upload.single("audio"),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No audio file" });
      return;
    }

    const query = PipelineQuerySchema.safeParse(req.query);
    const question = query.success ? query.data.question : undefined;
    const jobRole = query.success ? query.data.jobRole : undefined;

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    try {
      // --- Step 1: Transcription ---
      writeSSE(res, { type: "transcription_start", payload: { filename: req.file.originalname } });

      const transcription = await transcribeAudio(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname || "recording.webm"
      );

      writeSSE(res, { type: "transcription_done", payload: transcription });

      // --- Step 2: Analysis ---
      writeSSE(res, { type: "analysis_start", payload: {} });

      const analysis = await analyzeTranscript(
        { transcript: transcription.transcript, question, jobRole },
        transcription.durationSeconds
      );

      writeSSE(res, { type: "analysis_done", payload: analysis });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[Pipeline] Error:", message);
      writeSSE(res, { type: "error", payload: { message } });
    }

    res.end();
  }
);

export { router as pipelineRouter };
