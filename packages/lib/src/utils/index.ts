// -----------------------------------------------------------
// Text utilities
// -----------------------------------------------------------

/**
 * Highlight filler words in a transcript by wrapping them in a marker.
 * Returns an array of segments: { text, isFiller }
 */
export interface TranscriptSegment {
  text: string;
  isFiller: boolean;
  word?: string;
}

export function highlightFillerWords(
  transcript: string,
  fillerWords: string[]
): TranscriptSegment[] {
  if (!fillerWords.length || !transcript) {
    return [{ text: transcript, isFiller: false }];
  }

  // Build regex from filler words list
  const escaped = fillerWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");

  const segments: TranscriptSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(transcript)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: transcript.slice(lastIndex, match.index), isFiller: false });
    }
    segments.push({ text: match[0], isFiller: true, word: match[0].toLowerCase() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < transcript.length) {
    segments.push({ text: transcript.slice(lastIndex), isFiller: false });
  }

  return segments;
}

/**
 * Format a duration in milliseconds to MM:SS
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Get score color class based on value
 */
export function getScoreGrade(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 45) return "fair";
  return "poor";
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Sleep utility for async/await
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a promise-returning function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxAttempts) {
        await sleep(baseDelayMs * Math.pow(2, attempt - 1));
      }
    }
  }

  throw lastError ?? new Error("Max retries exceeded");
}
