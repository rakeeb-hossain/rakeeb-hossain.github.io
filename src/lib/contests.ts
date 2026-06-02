// Server-side helpers for fetching and normalizing programming-contest data.
// Codeforces exposes a JSON API; AtCoder has no API, so we parse its public
// contests page. Both run server-side (in the /api/contests route), which
// sidesteps the browsers' same-origin policy entirely.

export type Judge = "codeforces" | "atcoder";

export interface Contest {
  /** Stable unique key, e.g. "codeforces-2233" or "atcoder-abc461". */
  id: string;
  judge: Judge;
  name: string;
  url: string;
  /** Start time as Unix epoch milliseconds (UTC). */
  startMs: number;
  /** Contest length in seconds, when known. */
  durationSeconds: number | null;
}

export interface ContestsPayload {
  /** When the server assembled this payload (epoch ms). */
  fetchedAtMs: number;
  /**
   * Per judge: all upcoming/running contests plus the most recent finished
   * ones. The client decides upcoming-vs-recent against the current time.
   */
  codeforces: Contest[];
  atcoder: Contest[];
  /** Human-readable error per judge when a source could not be loaded. */
  errors: Partial<Record<Judge, string>>;
}

/** Default number of most-recent finished contests to surface per judge. */
export const RECENT_LIMIT = 5;

const JUDGE_LABEL: Record<Judge, string> = {
  codeforces: "Codeforces",
  atcoder: "AtCoder",
};

export function judgeLabel(judge: Judge): string {
  return JUDGE_LABEL[judge];
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

// ---------------------------------------------------------------------------
// Codeforces
// ---------------------------------------------------------------------------

interface CodeforcesApiContest {
  id: number;
  name: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds?: number;
}

interface CodeforcesApiResponse {
  status: string;
  result?: CodeforcesApiContest[];
  comment?: string;
}

function isCodeforcesContest(value: unknown): value is CodeforcesApiContest {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.name === "string" &&
    typeof record.phase === "string" &&
    typeof record.durationSeconds === "number"
  );
}

function parseCodeforcesResponse(value: unknown): CodeforcesApiContest[] {
  if (typeof value !== "object" || value === null) {
    throw new Error("Unexpected Codeforces response");
  }
  const body = value as CodeforcesApiResponse;
  if (body.status !== "OK" || !Array.isArray(body.result)) {
    throw new Error(body.comment ?? "Codeforces API returned an error");
  }
  return body.result.filter(isCodeforcesContest);
}

function toContest(api: CodeforcesApiContest): Contest | null {
  if (typeof api.startTimeSeconds !== "number") return null;
  return {
    id: `codeforces-${api.id}`,
    judge: "codeforces",
    name: api.name,
    // The /contests/<id> page resolves both before and after a round starts.
    url: `https://codeforces.com/contests/${api.id}`,
    startMs: api.startTimeSeconds * 1000,
    durationSeconds: api.durationSeconds,
  };
}

export async function fetchCodeforces(
  recentLimit: number = RECENT_LIMIT,
  signal?: AbortSignal,
): Promise<Contest[]> {
  const response = await fetch(
    "https://codeforces.com/api/contest.list?gym=false",
    { signal, headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error(`Codeforces API responded ${response.status}`);
  }
  const contests = parseCodeforcesResponse(await response.json());

  const upcoming = contests
    .filter((c) => c.phase !== "FINISHED")
    .map(toContest)
    .filter((c): c is Contest => c !== null)
    .sort((a, b) => a.startMs - b.startMs);

  const recent = contests
    .filter((c) => c.phase === "FINISHED")
    .map(toContest)
    .filter((c): c is Contest => c !== null)
    .sort((a, b) => b.startMs - a.startMs)
    .slice(0, recentLimit);

  return [...upcoming, ...recent];
}

// ---------------------------------------------------------------------------
// AtCoder (HTML scrape of https://atcoder.jp/contests/)
// ---------------------------------------------------------------------------

const ATCODER_BASE = "https://atcoder.jp";

/** Parse "2026-06-06 21:00:00+0900" (AtCoder's fixtime format) into epoch ms. */
function parseAtcoderTime(raw: string): number | null {
  const value = raw.trim();
  const match = value.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})([+-]\d{2})(\d{2})$/,
  );
  const candidate = match
    ? `${match[1]}T${match[2]}${match[3]}:${match[4]}`
    : value;
  const parsed = Date.parse(candidate);
  return Number.isNaN(parsed) ? null : parsed;
}

/** Parse a "HH:MM" duration string into seconds. */
function parseAtcoderDuration(raw: string): number | null {
  const match = raw.match(/(\d{1,3}):(\d{2})/);
  if (!match) return null;
  return (Number(match[1]) * 60 + Number(match[2])) * 60;
}

function extractTbody(html: string, tableId: string): string | null {
  const anchor = html.indexOf(`id="${tableId}"`);
  if (anchor === -1) return null;
  const start = html.indexOf("<tbody>", anchor);
  if (start === -1) return null;
  const end = html.indexOf("</tbody>", start);
  if (end === -1) return null;
  return html.slice(start + "<tbody>".length, end);
}

function parseAtcoderRow(row: string): Contest | null {
  const timeMatch = row.match(/<time[^>]*>([^<]+)<\/time>/);
  const linkMatch = row.match(
    /href="\/contests\/([^"?]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/,
  );
  if (!timeMatch || !linkMatch) return null;

  const startMs = parseAtcoderTime(timeMatch[1]);
  if (startMs === null) return null;

  const slug = linkMatch[1];
  const name = decodeEntities(stripTags(linkMatch[2]))
    .replace(/\s+/g, " ")
    .trim();
  if (!name) return null;

  // Duration is the first bare "HH:MM" cell; the start-time cell wraps its
  // value in a <time> tag, so it won't be matched here.
  const durationMatch = row.match(
    /<td class="text-center">\s*(\d{1,3}:\d{2})\s*<\/td>/,
  );
  const durationSeconds = durationMatch
    ? parseAtcoderDuration(durationMatch[1])
    : null;

  return {
    id: `atcoder-${slug}`,
    judge: "atcoder",
    name,
    url: `${ATCODER_BASE}/contests/${slug}`,
    startMs,
    durationSeconds,
  };
}

export function parseAtcoderTable(html: string, tableId: string): Contest[] {
  const tbody = extractTbody(html, tableId);
  if (tbody === null) return [];
  const rows = tbody.match(/<tr>[\s\S]*?<\/tr>/g) ?? [];
  return rows.map(parseAtcoderRow).filter((c): c is Contest => c !== null);
}

export async function fetchAtcoder(
  recentLimit: number = RECENT_LIMIT,
  signal?: AbortSignal,
): Promise<Contest[]> {
  const response = await fetch(`${ATCODER_BASE}/contests/?lang=en`, {
    signal,
    headers: {
      // AtCoder rejects requests without a browser-like User-Agent.
      "User-Agent":
        "Mozilla/5.0 (compatible; append-only-contests/1.0; +https://github.com/)",
      "Accept-Language": "en",
    },
  });
  if (!response.ok) {
    throw new Error(`AtCoder responded ${response.status}`);
  }
  const html = await response.text();

  const upcoming = parseAtcoderTable(html, "contest-table-upcoming").sort(
    (a, b) => a.startMs - b.startMs,
  );
  const recent = parseAtcoderTable(html, "contest-table-recent")
    .sort((a, b) => b.startMs - a.startMs)
    .slice(0, recentLimit);

  return [...upcoming, ...recent];
}
