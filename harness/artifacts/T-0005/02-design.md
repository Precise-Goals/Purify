---
status: complete
owner: designer
task: T-0005
inputs: ["harness/artifacts/T-0005/01-spec.md"]
acceptance_refs: ["AC-003-a", "AC-003-b", "AC-007-b"]
---

# 02-design: Gemini Client Contracts (T-0005)

```typescript
export interface GeminiPlanOutput {
  summary: string;
  actionIds: string[];
  dailyRoutineTips: string[];
  language?: "en" | "hi" | "mr";
}

export interface CallGeminiOptions {
  apiKey: string;
  model?: string; // defaults to gemini-1.5-flash
  fetchFn?: FetchLike;
  timeoutMs?: number; // defaults to 30,000 ms
}

export type GeminiErrorCode =
  | "NO_KEY"
  | "BAD_KEY"
  | "QUOTA"
  | "GEMINI_FAIL"
  | "MODEL_BLOCKED"
  | "MODEL_BAD_JSON"
  | "MODEL_EMPTY";

export class GeminiError extends Error {
  constructor(public readonly code: GeminiErrorCode, message: string) {
    super(message);
    this.name = "GeminiError";
  }
}
```
