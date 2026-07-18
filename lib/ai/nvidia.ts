import "server-only";

import OpenAI from "openai";

let sharedClient: OpenAI | null = null;

export class NvidiaConfigurationError extends Error {
  constructor() {
    super("NVIDIA NIM is not configured.");
    this.name = "NvidiaConfigurationError";
  }
}

export function getNvidiaConfig() {
  const apiKey = process.env.NVIDIA_NIM_API_KEY?.trim();
  const model = process.env.NVIDIA_NIM_MODEL?.trim();
  const baseURL =
    process.env.NVIDIA_NIM_BASE_URL?.trim() || "https://integrate.api.nvidia.com/v1";
  if (!apiKey || !model) throw new NvidiaConfigurationError();
  return { apiKey, baseURL, model };
}

export function getNvidiaClient() {
  const config = getNvidiaConfig();
  if (!sharedClient) {
    sharedClient = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: 20_000,
      maxRetries: 1,
    });
  }
  return { client: sharedClient, model: config.model };
}

export function controlledAiError(error: unknown): {
  code: "not_configured" | "timeout" | "provider_error";
  message: string;
} {
  if (error instanceof NvidiaConfigurationError) {
    return { code: "not_configured", message: "AI generation is not configured." };
  }
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return { code: "timeout", message: "AI generation timed out. Your existing content is unchanged." };
  }
  return { code: "provider_error", message: "AI generation is temporarily unavailable." };
}
