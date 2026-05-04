# 🎯 Answer Craft

An AI-powered mock interview coach built as a **production-grade Turborepo monorepo**.

Record your interview responses → get instant AI feedback on confidence, clarity, technical depth, filler words, and actionable improvements.

---

## 📁 Monorepo Structure

```
answer-craft/
├── apps/
│   ├── web/              → Next.js 14 (App Router) frontend
│   └── api/              → Node.js + Express backend
├── packages/
│   ├── types/            → Shared TypeScript types (single source of truth)
│   ├── lib/              → AI prompts, question bank, utilities
│   ├── ui/               → Shared React components (ScoreCard, Button, etc.)
│   └── config/           → Shared tsconfig + eslint base
├── turbo.json            → Turborepo pipeline
└── package.json          → Root workspace
```

---

## ⚙️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14 (App Router), Tailwind   |
| State       | Zustand (devtools middleware)        |
| Backend     | Node.js + Express + TypeScript      |
| AI Analysis | OpenAI GPT-4o                       |
| Transcription | OpenAI Whisper API                |
| Streaming   | Server-Sent Events (SSE)            |
| Monorepo    | Turborepo + npm workspaces          |
| Validation  | Zod                                 |

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js >= 18
- npm >= 10
- An **OpenAI API key** with access to Whisper and GPT-4o

### 2. Install dependencies

```bash
# From the root of the monorepo
npm install
```

### 3. Configure environment variables

```bash
# Create API env file
cp .env.example apps/api/.env.local
```

Edit `apps/api/.env.local`:

```env
OPENAI_API_KEY=sk-your-key-here
PORT=3001
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run in development

```bash
# Start both web + api in parallel (from root)
npm run dev
```

- Frontend: http://localhost:3000
- API:      http://localhost:3001
- API Docs: http://localhost:3001/health

---

## 🔄 Data Flow

```
User speaks
    ↓
MediaRecorder API (browser)
    ↓  audioBlob
POST /api/pipeline  (multipart/form-data)
    ↓
Express → Whisper API (OpenAI)
    ↓  SSE: transcription_done
GPT-4o Analysis
    ↓  SSE: analysis_done
Frontend renders:
  • Transcript + filler word highlights
  • Score rings (confidence, clarity, technical, overall)
  • Score bars
  • Strengths
  • Improvement cards
```

---

## 🔌 API Reference

### `POST /api/transcribe`
Transcribe audio to text via Whisper.

**Request:** `multipart/form-data` with field `audio` (Blob)

**Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "...",
    "durationSeconds": 45.2,
    "language": "en"
  }
}
```

---

### `POST /api/analyze`
Analyze a transcript with GPT-4o.

**Request Body:**
```json
{
  "transcript": "...",
  "question": "optional interview question",
  "jobRole": "optional job role",
  "durationSeconds": 45.2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "confidenceScore": 74,
    "clarityScore": 81,
    "technicalScore": 68,
    "overallScore": 74,
    "fillerWords": [{ "word": "um", "count": 5, "positions": [12, 45] }],
    "improvements": [{
      "category": "confidence",
      "priority": "high",
      "suggestion": "...",
      "example": "..."
    }],
    "strengths": ["..."],
    "wordCount": 312,
    "avgWordsPerSentence": 18.4,
    "estimatedSpeakingPaceWpm": 132
  }
}
```

---

### `POST /api/pipeline` (SSE Stream)
Full pipeline — transcribe + analyze in one streaming call.

**Request:** `multipart/form-data` with field `audio`

**Query Params:** `?question=...&jobRole=...`

**Response:** `text/event-stream` with events:
```
data: {"type":"transcription_start","payload":{}}
data: {"type":"transcription_done","payload":{...TranscriptionResponse}}
data: {"type":"analysis_start","payload":{}}
data: {"type":"analysis_done","payload":{...AnalysisResponse}}
```

---

## 📦 Packages

### `@answer-craft/types`
All shared TypeScript interfaces. Import from any app/package:
```ts
import type { AnalysisResponse, InterviewSession } from "@answer-craft/types";
```

### `@answer-craft/lib`
Shared logic — AI prompts, question bank, utilities:
```ts
import { buildAnalysisPrompt, highlightFillerWords, MOCK_QUESTIONS } from "@answer-craft/lib";
```

### `@answer-craft/ui`
Shared React components:
```ts
import { ScoreCard, ScoreRing, ImprovementCard, FillerWordBadge, Button } from "@answer-craft/ui";
```

### `@answer-craft/config`
Shared configs — extend in each app:
```json
{ "extends": "../../packages/config/tsconfig.base.json" }
```

---

## 🏗️ Build for Production

```bash
npm run build
```

**API:**
```bash
cd apps/api && npm start
```

**Web:**
```bash
cd apps/web && npm start
```

---

## 🧠 Mock Interview Questions

11 curated questions across 3 categories and 3 difficulty levels:

| Category    | Junior | Mid | Senior |
|-------------|--------|-----|--------|
| Behavioral  | 1      | 2   | 1      |
| Technical   | 1      | 2   | 1      |
| Situational | 1      | 1   | 1      |

Add more in `packages/lib/src/questions/index.ts`.

---

## 🔧 Turborepo Commands

```bash
npm run dev          # dev all apps in parallel
npm run build        # build all apps in dependency order
npm run lint         # lint all packages
npm run type-check   # typecheck all packages
npm run clean        # clean all build artifacts
```

---

## 📋 Environment Variables

| Variable              | Location         | Description                          |
|-----------------------|------------------|--------------------------------------|
| `OPENAI_API_KEY`      | `apps/api/.env.local` | OpenAI API key (required)        |
| `PORT`                | `apps/api/.env.local` | API server port (default: 3001)  |
| `NEXT_PUBLIC_API_URL` | `apps/web/.env.local` | Backend URL for frontend         |

---

## 🚦 Scoring Rubric

| Score | Grade     | Meaning                            |
|-------|-----------|------------------------------------|
| 80–100 | Excellent | Outstanding — production-ready     |
| 65–79  | Good      | Solid with minor gaps              |
| 45–64  | Fair      | Needs targeted practice            |
| 0–44   | Poor      | Significant improvement needed     |

**Weights for Overall Score:**
- Clarity: 35%
- Technical: 40%
- Confidence: 25%

---

## 🏛️ Architecture Decisions

- **SSE over WebSockets** — simpler for unidirectional streaming, no socket management
- **Multer memory storage** — audio never touches disk on the API server
- **Zod validation** — all API inputs validated at the boundary
- **express-async-errors** — automatic async error propagation, no try/catch in routes
- **Zustand devtools** — full Redux DevTools support in development
- **Turborepo caching** — packages built once, shared across apps
