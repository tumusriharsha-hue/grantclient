import { createHash } from "node:crypto";

const STATE_CODES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS",
  kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD", massachusetts: "MA",
  michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO", montana: "MT",
  nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC",
  "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR",
  pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
  "district of columbia": "DC",
};

export function stripUnsafeHtml(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function parseDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const dateOnly = value.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  if (dateOnly) return dateOnly;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function scaleAmount(value: number, suffix: string | undefined) {
  const normalized = suffix?.toLowerCase();
  if (normalized === "k" || normalized === "thousand") return value * 1_000;
  if (normalized === "m" || normalized === "million") return value * 1_000_000;
  if (normalized === "b" || normalized === "billion") return value * 1_000_000_000;
  return value;
}

export function parseFundingRange(value: unknown): {
  minimum: number | null;
  maximum: number | null;
} {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return { minimum: value, maximum: value };
  }
  if (typeof value !== "string") return { minimum: null, maximum: null };

  const amounts = [...value.matchAll(/\$?([\d,.]+)\s*(thousand|million|billion|[kmb])?/gi)]
    .map((match) => scaleAmount(Number(match[1].replace(/,/g, "")), match[2]))
    .filter((amount) => Number.isFinite(amount) && amount >= 0);

  if (amounts.length === 0) return { minimum: null, maximum: null };
  return { minimum: Math.min(...amounts), maximum: Math.max(...amounts) };
}

export function normalizeStates(values: string[]): string[] {
  const states = new Set<string>();
  for (const value of values) {
    const normalized = value.trim().toLowerCase();
    if (STATE_CODES[normalized]) states.add(STATE_CODES[normalized]);
    else if (/^[a-z]{2}$/i.test(value.trim())) states.add(value.trim().toUpperCase());
  }
  return [...states].sort();
}

export function isRollingText(value: string): boolean {
  return /\b(rolling|ongoing|continuous|accepted anytime|year[- ]round)\b/i.test(value);
}

export function normalizeUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    url.hash = "";
    [...url.searchParams.keys()]
      .filter((key) => /^utm_|^(fbclid|gclid)$/i.test(key))
      .forEach((key) => url.searchParams.delete(key));
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function contentHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function canonicalText(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}
