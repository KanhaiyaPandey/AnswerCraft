import type {
  ApiResponse,
  TranscriptionResponse,
  AnalysisResponse,
  AnalysisRequest,
  StreamEvent,
  StreamEventType,
} from "@answer-craft/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// -----------------------------------------------------------
// Generic fetch wrapper
// -----------------------------------------------------------
async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as ApiResponse<never>;
      if (!body.success) errorMessage = body.error;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}

// -----------------------------------------------------------
// Transcription
// -----------------------------------------------------------
export async function transcribeAudio(
  audioBlob: Blob,
  filename = "recording.webm"
): Promise<TranscriptionResponse> {
  const form = new FormData();
  form.append("audio", audioBlob, filename);

  const result = await apiFetch<ApiResponse<TranscriptionResponse>>(
    "/api/transcribe",
    { method: "POST", body: form }
  );

  if (!result.success) throw new Error(result.error);
  return result.data;
}

// -----------------------------------------------------------
// Analysis
// -----------------------------------------------------------
export async function analyzeTranscript(
  request: AnalysisRequest
): Promise<AnalysisResponse> {
  const result = await apiFetch<ApiResponse<AnalysisResponse>>(
    "/api/analyze",
    {
      method: "POST",
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!result.success) throw new Error(result.error);
  return result.data;
}

// -----------------------------------------------------------
// Pipeline (SSE streaming)
// -----------------------------------------------------------
export type PipelineCallbacks = {
  onTranscriptionStart?: () => void;
  onTranscriptionDone?: (data: TranscriptionResponse) => void;
  onAnalysisStart?: () => void;
  onAnalysisDone?: (data: AnalysisResponse) => void;
  onError?: (message: string) => void;
};

export async function runPipeline(
  audioBlob: Blob,
  params: { question?: string; jobRole?: string },
  callbacks: PipelineCallbacks
): Promise<void> {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");

  const queryParams = new URLSearchParams();
  if (params.question) queryParams.set("question", params.question);
  if (params.jobRole) queryParams.set("jobRole", params.jobRole);

  const url = `${API_BASE}/api/pipeline?${queryParams.toString()}`;

  const res = await fetch(url, { method: "POST", body: form });

  if (!res.ok || !res.body) {
    throw new Error(`Pipeline request failed: HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const chunk of lines) {
      const dataLine = chunk.replace(/^data:\s*/, "").trim();
      if (!dataLine) continue;

      try {
        const event = JSON.parse(dataLine) as StreamEvent;
        handleStreamEvent(event, callbacks);
      } catch {
        // malformed SSE line, skip
      }
    }
  }
}

function handleStreamEvent(event: StreamEvent, callbacks: PipelineCallbacks) {
  const type = event.type as StreamEventType;

  switch (type) {
    case "transcription_start":
      callbacks.onTranscriptionStart?.();
      break;
    case "transcription_done":
      callbacks.onTranscriptionDone?.(event.payload as TranscriptionResponse);
      break;
    case "analysis_start":
      callbacks.onAnalysisStart?.();
      break;
    case "analysis_done":
      callbacks.onAnalysisDone?.(event.payload as AnalysisResponse);
      break;
    case "error":
      callbacks.onError?.((event.payload as { message: string }).message);
      break;
  }
}

// -----------------------------------------------------------
// Health check
// -----------------------------------------------------------
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
