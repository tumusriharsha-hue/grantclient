import "server-only";

import OpenAI from "openai";

export type NvidiaErrorCode =
  | "not_configured"
  | "unauthorized"
  | "forbidden"
  | "model_not_found"
  | "rate_limited"
  | "timeout"
  | "provider_error"
  | "network_error"
  | "malformed_response"
  | "empty_response";

export class NvidiaError extends Error {
  constructor(public readonly code: NvidiaErrorCode, message: string, public readonly status?: number) {
    super(message);
    this.name = "NvidiaError";
  }
}

export class NvidiaConfigurationError extends NvidiaError {
  constructor(message = "NVIDIA NIM is not configured.") {
    super("not_configured", message);
    this.name = "NvidiaConfigurationError";
  }
}

export interface ChatMessage { role: "system" | "user" | "assistant"; content: string; }
export interface GenerationRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "json_object";
}
export interface GeneratedTextResult { content: string; usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }; latencyMs: number; }
export interface AIHealthResult { ok: boolean; provider: "nvidia"; configured: boolean; modelConfigured: boolean; latencyMs?: number; code?: NvidiaErrorCode; }

export function getNvidiaConfig() {
  const provider = (process.env.AI_PROVIDER?.trim() || "nvidia").toLowerCase();
  if (provider !== "nvidia") throw new NvidiaConfigurationError(`Unsupported AI_PROVIDER: ${provider}.`);
  const apiKey = (process.env.NVIDIA_API_KEY ?? process.env.NVIDIA_NIM_API_KEY)?.trim();
  const model = process.env.NVIDIA_NIM_MODEL?.trim();
  const baseURL = (process.env.NVIDIA_NIM_BASE_URL?.trim() || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
  const timeoutMs = readPositiveInt(process.env.NVIDIA_NIM_TIMEOUT_MS, 25_000);
  const maxRetries = readPositiveInt(process.env.NVIDIA_NIM_MAX_RETRIES, 2);
  if (!apiKey) throw new NvidiaConfigurationError("NVIDIA_API_KEY is missing.");
  if (!model) throw new NvidiaConfigurationError("NVIDIA_NIM_MODEL is missing.");
  return { apiKey, model, baseURL, timeoutMs, maxRetries };
}

function readPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

let sharedClient: OpenAI | null = null;
let sharedClientKey = "";

/** Compatibility accessor for existing server-only drafting/explanation code. */
export function getNvidiaClient() {
  const config = getNvidiaConfig();
  const key = `${config.apiKey}|${config.baseURL}|${config.timeoutMs}|${config.maxRetries}`;
  if (!sharedClient || sharedClientKey !== key) {
    sharedClient = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL, timeout: config.timeoutMs, maxRetries: config.maxRetries });
    sharedClientKey = key;
  }
  return { client: sharedClient, model: config.model };
}

function classifyStatus(status: number): NvidiaErrorCode {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "model_not_found";
  if (status === 429) return "rate_limited";
  return status >= 500 ? "provider_error" : "malformed_response";
}

function isTransient(error: unknown) {
  return error instanceof NvidiaError && ["rate_limited", "provider_error", "timeout", "network_error"].includes(error.code);
}

function jitteredDelay(attempt: number) {
  return Math.min(2_000, 250 * 2 ** attempt) + Math.floor(Math.random() * 100);
}

export async function generateText(request: GenerationRequest): Promise<GeneratedTextResult> {
  const config = getNvidiaConfig();
  const body = {
    model: config.model,
    messages: request.messages,
    temperature: request.temperature ?? 0.1,
    max_tokens: request.maxTokens ?? 800,
    ...(request.responseFormat ? { response_format: { type: request.responseFormat } } : {}),
  };
  for (let attempt = 0; ; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
    const started = Date.now();
    try {
      let response: Response;
      try {
        response = await fetch(`${config.baseURL}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
          cache: "no-store",
        });
      } catch (error) {
        if (controller.signal.aborted) throw new NvidiaError("timeout", "NVIDIA NIM request timed out.");
        throw new NvidiaError("network_error", error instanceof Error ? error.message : "NVIDIA NIM network request failed.");
      }
      if (!response.ok) {
        throw new NvidiaError(classifyStatus(response.status), "NVIDIA NIM request failed.", response.status);
      }
      const payload = await response.json().catch(() => { throw new NvidiaError("malformed_response", "NVIDIA NIM returned invalid JSON."); });
      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) throw new NvidiaError("empty_response", "NVIDIA NIM returned empty content.");
      const usage = payload?.usage;
      return { content, latencyMs: Date.now() - started, usage: usage ? { promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens, totalTokens: usage.total_tokens } : undefined };
    } catch (error) {
      if (attempt >= config.maxRetries || !isTransient(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, jitteredDelay(attempt)));
    } finally {
      clearTimeout(timeout);
    }
  }
}

export async function healthCheck(): Promise<AIHealthResult> {
  let config: ReturnType<typeof getNvidiaConfig>;
  try { config = getNvidiaConfig(); } catch (error) {
    const code = error instanceof NvidiaError ? error.code : "not_configured";
    return { ok: false, provider: "nvidia", configured: false, modelConfigured: false, code };
  }
  try {
    const result = await generateText({ messages: [{ role: "system", content: "Return JSON only." }, { role: "user", content: "Reply with {\"ok\":true}." }], maxTokens: 20, responseFormat: "json_object" });
    return { ok: true, provider: "nvidia", configured: true, modelConfigured: Boolean(config.model), latencyMs: result.latencyMs };
  } catch (error) {
    return { ok: false, provider: "nvidia", configured: true, modelConfigured: Boolean(config.model), code: error instanceof NvidiaError ? error.code : "provider_error" };
  }
}

export function controlledAiError(error: unknown): { code: NvidiaErrorCode; message: string } {
  if (error instanceof NvidiaError) {
    const messages: Partial<Record<NvidiaErrorCode, string>> = {
      not_configured: "AI generation is not configured.", unauthorized: "AI generation credentials were rejected.", forbidden: "AI generation is not permitted for this model.", model_not_found: "The configured NVIDIA NIM model was not found.", rate_limited: "AI generation is temporarily rate limited.", timeout: "AI generation timed out. Your existing content is unchanged.", network_error: "AI generation could not reach NVIDIA NIM.", malformed_response: "AI generation returned an invalid response.", empty_response: "AI generation returned no content.", provider_error: "AI generation is temporarily unavailable.",
    };
    return { code: error.code, message: messages[error.code] ?? "AI generation is temporarily unavailable." };
  }
  if (error instanceof OpenAI.APIConnectionTimeoutError) return { code: "timeout", message: "AI generation timed out. Your existing content is unchanged." };
  return { code: "provider_error", message: "AI generation is temporarily unavailable." };
}
