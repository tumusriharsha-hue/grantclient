import "server-only";

import { generateText, healthCheck, type AIHealthResult, type GeneratedTextResult, type GenerationRequest } from "@/lib/ai/nvidia";

export interface StructuredGenerationRequest<T> extends GenerationRequest {
  schemaName: string;
  parse: (content: string) => T;
}

export interface AIProvider {
  generateStructured<T>(request: StructuredGenerationRequest<T>): Promise<T>;
  generateText(request: GenerationRequest): Promise<GeneratedTextResult>;
  healthCheck(): Promise<AIHealthResult>;
}

function selectedProvider() {
  const provider = (process.env.AI_PROVIDER?.trim() || "nvidia").toLowerCase();
  if (provider !== "nvidia") throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  return { generateText, healthCheck };
}

export const aiProvider: AIProvider = {
  async generateStructured<T>(request: StructuredGenerationRequest<T>) {
    const result = await selectedProvider().generateText({ ...request, responseFormat: "json_object" });
    return request.parse(result.content);
  },
  generateText: (request) => selectedProvider().generateText(request),
  healthCheck: () => selectedProvider().healthCheck(),
};
