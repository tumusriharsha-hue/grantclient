import { INGESTION_USER_AGENT } from "./config";

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  requestDelayMs?: number;
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchJson(
  url: string,
  options: FetchJsonOptions = {},
): Promise<unknown> {
  const {
    timeoutMs = 20_000,
    retries = 2,
    requestDelayMs = 0,
    headers,
    ...requestInit
  } = options;

  if (requestDelayMs > 0) await wait(requestDelayMs);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...requestInit,
        headers: {
          Accept: "application/json",
          "User-Agent": INGESTION_USER_AGENT,
          ...headers,
        },
        signal: controller.signal,
      });

      console.info(
        JSON.stringify({ event: "grant_source_http", url, status: response.status, attempt }),
      );

      if (response.ok) return response.json();

      if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === retries) {
        throw new Error(`Source request failed with HTTP ${response.status}`);
      }

      const retryAfter = Number(response.headers.get("retry-after"));
      await wait(Number.isFinite(retryAfter) ? retryAfter * 1_000 : 500 * 2 ** attempt);
    } catch (error) {
      if (attempt === retries) throw error;
      await wait(500 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error("Source request failed without a response");
}
