import type { APIRoute } from "astro";
import {
  type Contest,
  type ContestsPayload,
  fetchAtcoder,
  fetchCodeforces,
  type Judge,
  RECENT_LIMIT,
} from "../../lib/contests";

export const prerender = false;

async function loadJudge(
  judge: Judge,
  loader: () => Promise<Contest[]>,
  errors: Partial<Record<Judge, string>>,
): Promise<Contest[]> {
  try {
    return await loader();
  } catch (error) {
    errors[judge] = error instanceof Error ? error.message : "Unknown error";
    return [];
  }
}

export const GET: APIRoute = async () => {
  const errors: Partial<Record<Judge, string>> = {};

  const [codeforces, atcoder] = await Promise.all([
    loadJudge("codeforces", () => fetchCodeforces(RECENT_LIMIT), errors),
    loadJudge("atcoder", () => fetchAtcoder(RECENT_LIMIT), errors),
  ]);

  const payload: ContestsPayload = {
    fetchedAtMs: Date.now(),
    codeforces,
    atcoder,
    errors,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Cache at Vercel's edge: serve instantly for 5 min, refresh in the
      // background for up to an hour. Keeps us fast and polite to AtCoder.
      "Cache-Control":
        "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
};
