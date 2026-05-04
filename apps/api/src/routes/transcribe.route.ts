import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { transcribeAudio } from "../services/openai.service";
import type { ApiResponse, TranscriptionResponse } from "@answer-craft/types";

const router = Router();

// Multer: store audio in memory (max 25MB — Whisper limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "audio/webm",
      "audio/mp4",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp3",
      "video/webm", // Chrome MediaRecorder uses video/webm for audio-only
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`));
    }
  },
});

const TranscribeQuerySchema = z.object({
  language: z.string().optional(),
});

// POST /api/transcribe
router.post(
  "/",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      const response: ApiResponse<never> = {
        success: false,
        error: "No audio file provided. Send a file with field name 'audio'.",
        code: "MISSING_FILE",
      };
      return res.status(400).json(response);
    }

    const query = TranscribeQuerySchema.safeParse(req.query);
    const language = query.success ? query.data.language : undefined;

    console.info(
      `[Transcribe] Received ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB, ${req.file.mimetype})`
    );

    const result = await transcribeAudio(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname || `recording.${req.file.mimetype.split("/")[1]}`
    );

    const response: ApiResponse<TranscriptionResponse> = {
      success: true,
      data: {
        ...result,
        language: language ?? result.language,
      },
    };

    console.info(
      `[Transcribe] Done — ${result.transcript.split(" ").length} words in ${result.durationSeconds.toFixed(1)}s`
    );

    return res.json(response);
  }
);

export { router as transcribeRouter };
