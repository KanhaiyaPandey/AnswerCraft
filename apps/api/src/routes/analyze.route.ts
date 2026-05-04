import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { analyzeTranscript } from "../services/openai.service";
import type { ApiResponse, AnalysisResponse } from "@answer-craft/types";

const router = Router();

const AnalyzeBodySchema = z.object({
  transcript: z
    .string()
    .min(10, "Transcript must be at least 10 characters")
    .max(10000, "Transcript is too long (max 10,000 characters)"),
  question: z.string().max(500).optional(),
  jobRole: z.string().max(100).optional(),
  durationSeconds: z.number().positive().optional(),
});

// POST /api/analyze
router.post("/", async (req: Request, res: Response) => {
  const parsed = AnalyzeBodySchema.safeParse(req.body);

  if (!parsed.success) {
    const response: ApiResponse<never> = {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join("; "),
      code: "VALIDATION_ERROR",
    };
    return res.status(400).json(response);
  }

  const { transcript, question, jobRole, durationSeconds } = parsed.data;

  console.info(
    `[Analyze] Analyzing ${transcript.split(" ").length}-word transcript` +
      (question ? ` for question: "${question.slice(0, 60)}..."` : "")
  );

  const analysis = await analyzeTranscript(
    { transcript, question, jobRole },
    durationSeconds
  );

  const response: ApiResponse<AnalysisResponse> = {
    success: true,
    data: analysis,
  };

  console.info(
    `[Analyze] Done — overall: ${analysis.overallScore}, filler words: ${analysis.fillerWords.length}`
  );

  return res.json(response);
});

export { router as analyzeRouter };
