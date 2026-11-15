// Supabase Edge Function: proxy for the data.gov.in (OGD) Agmarknet dataset
// "Current Daily Price of Various Commodities from Various Markets (Mandi)".
//
// Keeps DATA_GOV_IN_API_KEY server-side, pages through the upstream results,
// caches per query for 6 hours and answers with permissive CORS so the Vite
// app can call it directly.
//
// data.gov.in refuses connections from outside India, so callers must pin the
// function to the Mumbai edge with the request header `x-region: ap-south-1`
// (the app's client does this). Other edge regions get "connection refused".
//
// GET /ogd-mandi?state=Madhya%20Pradesh&district=Gwalior&commodity=Wheat&limit=5000

const OGD_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const OGD_BASE = `https://api.data.gov.in/resource/${OGD_RESOURCE_ID}`;
const PAGE_SIZE = 1000;
const MAX_ROWS = 5000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-region",
};

interface OgdEnvelope {
  total?: number;
  count?: number;
  limit?: number | string;
  offset?: number | string;
  field?: { id: string; name: string; type: string }[];
  records?: Record<string, unknown>[];
  message?: string;
  status?: string;
}

interface ProxyPayload {
  records: Record<string, unknown>[];
  fields: { id: string; name: string; type: string }[];
  total: number;
  fetchedAt: string;
}

const cache = new Map<string, { expires: number; payload: ProxyPayload }>();

const sameText = (a: unknown, b: string) =>
  String(a ?? "").trim().toLowerCase() === b.trim().toLowerCase();

/** Short, key-free description of a fetch failure. */
const describeNetworkError = (err: unknown): string => {
  const msg = err instanceof Error ? err.message : String(err);
  if (/refused/i.test(msg)) return "connection refused";
  if (/reset/i.test(msg)) return "connection reset";
  if (/timed? ?out/i.test(msg)) return "timeout";
  if (/dns|resolve/i.test(msg)) return "dns failure";
  if (/tls|certificate/i.test(msg)) return "tls failure";
  return "unreachable";
};

/** Strip anything that looks like our API key from a message before returning it. */
const redact = (msg: string, apiKey: string): string =>
  apiKey ? msg.split(apiKey).join("[redacted]") : msg;

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS, ...extra },
  });

const clampLimit = (raw: string | null): number => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return MAX_ROWS;
  return Math.min(Math.floor(n), MAX_ROWS);
};

async function fetchAll(
  apiKey: string,
  filters: Record<string, string>,
  maxRows: number,
): Promise<ProxyPayload> {
  const records: Record<string, unknown>[] = [];
  let fields: ProxyPayload["fields"] = [];
  let total = 0;
  let offset = 0;

  while (records.length < maxRows) {
    const limit = Math.min(PAGE_SIZE, maxRows - records.length);
    // Build the query by hand: URLSearchParams encodes spaces as "+", which the
    // OGD filter parser does not decode, so "Madhya Pradesh" would match nothing.
    const query = [
      `api-key=${encodeURIComponent(apiKey)}`,
      "format=json",
      `limit=${limit}`,
      `offset=${offset}`,
      ...Object.entries(filters).map(([k, v]) => `filters[${k}]=${encodeURIComponent(v)}`),
    ].join("&");

    let res: Response;
    try {
      res = await fetch(`${OGD_BASE}?${query}`, { headers: { Accept: "application/json" } });
    } catch (err) {
      // Never surface the raw error: Deno includes the full URL (and the key) in it.
      throw new Error(`network error contacting data.gov.in (${describeNetworkError(err)})`);
    }
    if (!res.ok) {
      throw new Error(`data.gov.in responded ${res.status}`);
    }
    const body = (await res.json()) as OgdEnvelope;
    if (body.status && body.status !== "ok" && !body.records) {
      throw new Error(body.message || "data.gov.in returned an error");
    }
    const page = Array.isArray(body.records) ? body.records : [];
    if (Array.isArray(body.field) && body.field.length) fields = body.field;
    total = Number(body.total ?? total);
    records.push(...page);
    offset += page.length;
    if (page.length < limit || (total && offset >= total)) break;
  }

  // Safety net: keep only rows that really match the requested filters, in
  // case upstream ignores a filter (observed when a value was mis-encoded).
  const matches = (r: Record<string, unknown>) =>
    Object.entries(filters).every(([k, v]) => sameText(r[k], v));
  const kept = records.filter(matches);

  return { records: kept, fields, total: kept.length, fetchedAt: new Date().toISOString() };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("DATA_GOV_IN_API_KEY");
  if (!apiKey) {
    return json({ error: "DATA_GOV_IN_API_KEY is not configured on the edge function" }, 500);
  }

  const url = new URL(req.url);
  const filters: Record<string, string> = {};
  const state = url.searchParams.get("state")?.trim() || "Madhya Pradesh";
  filters.state = state;
  const district = url.searchParams.get("district")?.trim();
  if (district) filters.district = district;
  const commodity = url.searchParams.get("commodity")?.trim();
  if (commodity) filters.commodity = commodity;
  const maxRows = clampLimit(url.searchParams.get("limit"));

  const cacheKey = JSON.stringify({ filters, maxRows });
  const hit = cache.get(cacheKey);
  const now = Date.now();
  if (hit && hit.expires > now) {
    return json({ ...hit.payload, cached: true }, 200, { "Cache-Control": "public, max-age=21600" });
  }

  try {
    const payload = await fetchAll(apiKey, filters, maxRows);
    cache.set(cacheKey, { expires: now + CACHE_TTL_MS, payload });
    return json({ ...payload, cached: false }, 200, { "Cache-Control": "public, max-age=21600" });
  } catch (err) {
    // Serve stale data rather than nothing when upstream is down.
    if (hit) return json({ ...hit.payload, cached: true, stale: true }, 200);
    const message = redact(err instanceof Error ? err.message : "Upstream error", apiKey);
    return json({ error: `Could not reach data.gov.in: ${message}` }, 502);
  }
});
