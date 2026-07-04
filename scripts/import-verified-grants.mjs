/**
 * Parse verified grant source text and write data/grants.json.
 *
 * Run: node scripts/import-verified-grants.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(__dirname, "../data/verified-grants-source.txt");
const OUT = join(__dirname, "../data/grants.json");
const UPDATED_AT = "2026-07-03T00:00:00.000Z";

const CATEGORIES = [
  "Education",
  "Youth Programs",
  "Sports & Recreation",
  "STEM & Technology",
  "Community Development",
  "Arts & Culture",
  "Environment",
  "Healthcare",
  "Food Security",
  "Animal Welfare",
  "Capacity Building",
];

const CATEGORY_ALIASES = {
  "mental health": "Healthcare",
  health: "Healthcare",
  "economic mobility": "Community Development",
  "affordable housing": "Community Development",
  housing: "Community Development",
  "food systems": "Food Security",
  agriculture: "Food Security",
  journalism: "Arts & Culture",
  media: "Arts & Culture",
  "skilled trades": "STEM & Technology",
  workforce: "Community Development",
  "veteran services": "Community Development",
  "financial stability": "Community Development",
  "multi-sector": "Community Development",
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function normalizeUrl(url) {
  const trimmed = url.trim().replace(/[.,;)]+$/, "");
  if (!trimmed) return "https://example.org/grants/apply";
  if (trimmed.startsWith("http")) return trimmed;
  return `https://${trimmed}`;
}

function pickCategory(focusText) {
  const focus = focusText.toLowerCase();

  for (const category of CATEGORIES) {
    if (focus.includes(category.toLowerCase())) {
      return category;
    }
  }

  for (const [alias, category] of Object.entries(CATEGORY_ALIASES)) {
    if (focus.includes(alias)) {
      return category;
    }
  }

  return "Community Development";
}

function pickRegion(scopeText) {
  const scope = scopeText.toLowerCase();

  if (
    /\bnational\b/.test(scope) &&
    !/\bregional\b/.test(scope) &&
    !/\bstatewide\b/.test(scope)
  ) {
    return "National";
  }

  const texasPatterns = [
    "texas",
    "houston",
    "dallas",
    "austin",
    "san antonio",
    "fort worth",
    "el paso",
    "waco",
    "amarillo",
    "corpus christi",
    "bryan",
    "tyler",
    "midland",
    "odessa",
    "panhandle",
    "brazos valley",
    "coastal bend",
    "permian basin",
    "borderplex",
    "mclennan",
    "tarrant",
    "bexar",
    "travis",
    "harris county",
  ];

  if (texasPatterns.some((pattern) => scope.includes(pattern))) {
    return "Texas";
  }

  const southwestPatterns = [
    "arizona",
    "new mexico",
    "southwest",
    "inland empire",
    "riverside",
    "san bernardino",
    "flagstaff",
    "sedona",
    "yavapai",
    "southern arizona",
  ];

  if (southwestPatterns.some((pattern) => scope.includes(pattern))) {
    return "Southwest US";
  }

  const southeastPatterns = [
    "southeast",
    "atlanta",
    "florida",
    "tampa",
    "memphis",
    "new orleans",
    "louisiana",
    "alabama",
    "mississippi",
    "georgia",
    "north carolina",
    "triangle, nc",
    "durham",
    "miami",
  ];

  if (southeastPatterns.some((pattern) => scope.includes(pattern))) {
    return "Southeast US";
  }

  const midwestPatterns = [
    "midwest",
    "chicago",
    "cleveland",
    "detroit",
    "minnesota",
    "michigan",
    "ohio",
    "indiana",
    "missouri",
    "kansas city",
    "milwaukee",
    "wisconsin",
    "illinois",
  ];

  if (midwestPatterns.some((pattern) => scope.includes(pattern))) {
    return "Midwest US";
  }

  const northeastPatterns = [
    "northeast",
    "new york",
    "nyc",
    "boston",
    "philadelphia",
    "pittsburgh",
    "rochester",
    "buffalo",
    "long island",
    "westchester",
  ];

  if (northeastPatterns.some((pattern) => scope.includes(pattern))) {
    return "Northeast US";
  }

  const westernPatterns = [
    "western us",
    "california",
    "los angeles",
    "seattle",
    "oregon",
    "washington state",
    "colorado",
    "denver",
    "pacific northwest",
    "king county",
  ];

  if (westernPatterns.some((pattern) => scope.includes(pattern))) {
    return "Western US";
  }

  const southCentralPatterns = [
    "south central",
    "oklahoma",
    "arkansas",
    "louisiana",
    "alabama",
  ];

  if (southCentralPatterns.some((pattern) => scope.includes(pattern))) {
    return "South Central US";
  }

  if (/\bregional\b/.test(scope)) {
    return "National";
  }

  return "National";
}

function parseAmount(awardText) {
  const text = awardText.toLowerCase();
  if (/(varies|not standardized|project-based|fellowship|in-kind|donations driven)/.test(text)) {
    return undefined;
  }

  const upTo = text.match(/up to \$?([\d,.]+)\s*(m|million|k|b)?/i)
    || text.match(/up to \$?([\d,.]+)(m|million|k|b)\b/i);
  if (upTo) {
    return scaleNumber(upTo[1], upTo[2]);
  }

  const range =
    text.match(/\$?([\d,.]+)\s*[–-]\s*\$?([\d,.]+)\s*(m|million|k|b)?/i)
    || text.match(/\$?([\d,.]+)\s*[–-]\s*\$?([\d,.]+)(m|million|k|b)\b/i);
  if (range) {
    const low = scaleNumber(range[1], range[3]);
    const high = scaleNumber(range[2], range[3]);
    return Math.round((low + high) / 2);
  }

  const single =
    text.match(/\$?([\d,.]+)\s*(m|million|k|b)?/i)
    || text.match(/\$?([\d,.]+)(m|million|k|b)\b/i);
  if (single) {
    return scaleNumber(single[1], single[2]);
  }

  return undefined;
}

function scaleNumber(raw, suffix = "") {
  const value = Number.parseFloat(raw.replace(/,/g, ""));
  if (Number.isNaN(value)) return undefined;

  const unit = (suffix || "").toLowerCase();
  if (unit === "m" || unit === "million") return Math.round(value * 1_000_000);
  if (unit === "b") return Math.round(value * 1_000_000_000);
  if (unit === "k") return Math.round(value * 1_000);
  return Math.round(value);
}

function parseDeadline(deadlineText) {
  const text = deadlineText.trim();
  const explicit = extractExplicitDate(text);
  if (explicit) return explicit;

  const rollingPatterns = [
    /rolling/i,
    /invitation-only/i,
    /invitation-based/i,
    /year-round/i,
    /anytime/i,
    /open year-round/i,
    /cyclical/i,
    /periodic/i,
    /biannual/i,
    /quarterly/i,
    /annual/i,
    /store-level/i,
    /check .+ for/i,
    /watch .+ for/i,
    /expected (fall|spring|winter|summer)/i,
    /opens (january|february|march|april|may|june|july|august|september|october|november|december)/i,
  ];

  if (rollingPatterns.some((pattern) => pattern.test(text))) {
    return undefined;
  }

  return undefined;
}

function extractExplicitDate(text) {
  const monthMap = {
    january: "01",
    jan: "01",
    february: "02",
    feb: "02",
    march: "03",
    mar: "03",
    april: "04",
    apr: "04",
    may: "05",
    june: "06",
    jun: "06",
    july: "07",
    jul: "07",
    august: "08",
    aug: "08",
    september: "09",
    sept: "09",
    sep: "09",
    october: "10",
    oct: "10",
    november: "11",
    nov: "11",
    december: "12",
    dec: "12",
  };

  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const numeric = text.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);
  if (numeric) {
    return `${numeric[3]}-${numeric[1].padStart(2, "0")}-${numeric[2].padStart(2, "0")}`;
  }

  const named = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2}),?\s+(20\d{2})\b/i,
  );
  if (named) {
    const month = monthMap[named[1].toLowerCase().replace(".", "")];
    return `${named[3]}-${month}-${named[2].padStart(2, "0")}`;
  }

  const monthDayYear = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:[–-]\s*(\d{1,2}))?,?\s+(20\d{2})\b/i,
  );
  if (monthDayYear) {
    const month = monthMap[monthDayYear[1].toLowerCase().replace(".", "")];
    const day = (monthDayYear[3] || monthDayYear[2]).padStart(2, "0");
    return `${monthDayYear[4] || monthDayYear[3]}-${month}-${day}`;
  }

  return undefined;
}

function parseFunderMeta(raw) {
  const parts = raw.split("|").map((part) => part.trim());

  if (parts.length >= 3) {
    return {
      funder: parts[0],
      website: parts[1],
      applicationPath: parts[2],
    };
  }

  if (parts.length === 2) {
    return {
      funder: parts[0],
      website: parts[1],
      applicationPath: parts[1],
    };
  }

  return {
    funder: parts[0] || raw.trim(),
    website: "",
    applicationPath: parts[0] || raw.trim(),
  };
}

function parseEntryBlock(working) {
  const headerMatch = working.match(/^(\d+)\.\s+(?:\[REPLACED\]\s+)?([\s\S]+?)\s+Funder:\s*/);
  if (!headerMatch) {
    return null;
  }

  const rest = working.slice(headerMatch[0].length);
  const typeIndex = rest.indexOf(" Type: ");
  if (typeIndex === -1) {
    return null;
  }

  const funderMeta = parseFunderMeta(rest.slice(0, typeIndex));
  const tail = rest.slice(typeIndex + " Type: ".length);

  const tailMatch = tail.match(
    /^([^|]+)\|\s*Focus:\s*([^|]+)\|\s*Scope:\s*([^|]+)\s+Eligible:\s*([\s\S]+?)\|\s*Award:\s*([\s\S]+?)\s+Deadline:\s*([\s\S]+?)(?:\|\s*([\s\S]+))?$/,
  );

  if (!tailMatch) {
    return null;
  }

  return {
    number: Number.parseInt(headerMatch[1], 10),
    title: headerMatch[2].trim(),
    funder: funderMeta.funder,
    website: funderMeta.website,
    applicationPath: funderMeta.applicationPath,
    grantType: tailMatch[1].trim(),
    focus: tailMatch[2].trim(),
    scope: tailMatch[3].trim(),
    eligible: tailMatch[4].trim(),
    award: tailMatch[5].trim(),
    deadline: tailMatch[6].trim(),
    summary: (tailMatch[7] || "").trim(),
  };
}

function splitEntries(source) {
  const cleaned = source
    .replace(/^COMPLETE VERIFIED GRANT DATABASE[^\n]*\n/i, "")
    .replace(/^Updated July 3, 2026[^\n]*\n/i, "")
    .trim();

  const blocks = cleaned
    .split(/\n(?=\d+\.\s)/)
    .map((block) => block.trim())
    .filter(Boolean);

  const entries = [];

  for (const block of blocks) {
    const duplicateNote = block.match(/^\d+\.\s+[^\n]+\[Entry \d+ was a repeat[^\n]*\]\s*$/m);
    if (duplicateNote && !block.includes(" Funder:")) {
      continue;
    }

    const working = duplicateNote
      ? block.replace(/^\d+\.\s+[^\n]+\[Entry \d+ was a repeat[^\n]*\]\s*\n?/m, "").trim()
      : block;

    if (!working.includes(" Funder:")) {
      continue;
    }

    const entry = parseEntryBlock(working);
    if (!entry) {
      throw new Error(`Failed to parse entry block starting with: ${working.slice(0, 120)}`);
    }

    entries.push(entry);
  }

  return entries;
}

function buildGrant(entry, index) {
  const id = slugify(entry.title);
  const category = pickCategory(entry.focus);
  const region = pickRegion(entry.scope);
  const amount = parseAmount(entry.award);
  const deadline = parseDeadline(entry.deadline);
  const applicationUrl = normalizeUrl(entry.applicationPath);
  const createdAt = new Date(Date.UTC(2025, 0, 1 + index)).toISOString();

  const descriptionParts = [
    entry.summary,
    `Funder type: ${entry.grantType}.`,
    `Focus areas: ${entry.focus}.`,
    `Geographic scope: ${entry.scope}.`,
    `Eligibility: ${entry.eligible}.`,
    `Award: ${entry.award}.`,
    `Deadline: ${entry.deadline}.`,
  ].filter(Boolean);

  return {
    id,
    title: entry.title,
    description: descriptionParts.join(" "),
    funder: entry.funder,
    category,
    region,
    status: "open",
    ...(amount ? { amount } : {}),
    ...(deadline ? { deadline } : {}),
    applicationUrl,
    createdAt,
    updatedAt: UPDATED_AT,
  };
}

function uniqueGrantId(title, usedIds) {
  let id = slugify(title);
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${slugify(title).slice(0, 64)}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

const source = readFileSync(SOURCE, "utf8");
const entries = splitEntries(source);

if (entries.length !== 202) {
  throw new Error(`Expected 202 parsed entries, found ${entries.length}`);
}

const usedIds = new Set();
const grants = entries.map((entry, index) => {
  const grant = buildGrant(entry, index);
  grant.id = uniqueGrantId(entry.title, usedIds);
  grant.applicationUrl = normalizeUrl(entry.applicationPath);
  return grant;
});

writeFileSync(OUT, `${JSON.stringify(grants, null, 2)}\n`);

console.log(`Wrote ${grants.length} grants to ${OUT}`);

const categoryCounts = {};
const regionCounts = {};
for (const grant of grants) {
  categoryCounts[grant.category] = (categoryCounts[grant.category] || 0) + 1;
  regionCounts[grant.region] = (regionCounts[grant.region] || 0) + 1;
}

console.log("Categories:", categoryCounts);
console.log("Regions:", regionCounts);
