import type { NextFunction, Request, Response } from "express";
import type { ApiErrorResponse } from "@answer-craft/types";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[Error]", err.message);

  // Multer errors
  if (err.message.includes("File too large")) {
    const response: ApiErrorResponse = {
      success: false,
      error: "Audio file is too large. Maximum size is 25MB.",
      code: "FILE_TOO_LARGE",
    };
    res.status(413).json(response);
    return;
  }

  if (err.message.includes("Unsupported audio format")) {
    const response: ApiErrorResponse = {
      success: false,
      error: err.message,
      code: "UNSUPPORTED_FORMAT",
    };
    res.status(415).json(response);
    return;
  }

  // OpenAI rate limit
  if (err.message.includes("rate limit") || err.message.includes("429")) {
    const response: ApiErrorResponse = {
      success: false,
      error: "AI service is rate limited. Please wait a moment and try again.",
      code: "RATE_LIMITED",
    };
    res.status(429).json(response);
    return;
  }

  // OpenAI auth error
  if (err.message.includes("API key") || err.message.includes("401")) {
    const response: ApiErrorResponse = {
      success: false,
      error: "AI service authentication failed. Check your API key configuration.",
      code: "AUTH_ERROR",
    };
    res.status(500).json(response);
    return;
  }

  // Generic
  const response: ApiErrorResponse = {
    success: false,
    error: process.env["NODE_ENV"] === "production"
      ? "An unexpected error occurred."
      : err.message,
    code: "INTERNAL_ERROR",
  };
  res.status(500).json(response);
}
