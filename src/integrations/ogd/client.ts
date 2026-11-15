import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/integrations/supabase/client";
import { MandiQuery, OgdMandiResponse } from "./types";

export const DEFAULT_STATE = "Madhya Pradesh";

export const OGD_MANDI_URL: string =
  import.meta.env.VITE_OGD_MANDI_URL || `${SUPABASE_URL}/functions/v1/ogd-mandi`;

/**
 * data.gov.in only accepts connections from Indian IP ranges. Supabase runs an
 * edge function at the location nearest the caller unless pinned, so every
 * call asks for the Mumbai edge explicitly.
 */
export const OGD_EDGE_REGION: string = import.meta.env.VITE_OGD_EDGE_REGION || "ap-south-1";

export class OgdError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "OgdError";
    this.status = status;
  }
}

/** Fetch mandi price rows through the `ogd-mandi` Supabase Edge Function. */
export async function fetchMandiPrices(
  query: MandiQuery = {},
  signal?: AbortSignal,
): Promise<OgdMandiResponse> {
  const params = new URLSearchParams();
  params.set("state", query.state || DEFAULT_STATE);
  if (query.district) params.set("district", query.district);
  if (query.commodity) params.set("commodity", query.commodity);
  if (query.limit) params.set("limit", String(query.limit));

  const res = await fetch(`${OGD_MANDI_URL}?${params.toString()}`, {
    signal,
    headers: {
      Accept: "application/json",
      // Required by the Supabase gateway even when verify_jwt is off.
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "x-region": OGD_EDGE_REGION,
    },
  });

  if (!res.ok) {
    let message = `Mandi data request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = String(body.error);
    } catch {
      /* non-JSON error body */
    }
    throw new OgdError(message, res.status);
  }

  const body = (await res.json()) as Partial<OgdMandiResponse>;
  return {
    records: Array.isArray(body.records) ? body.records : [],
    fields: Array.isArray(body.fields) ? body.fields : [],
    total: Number(body.total ?? 0),
    fetchedAt: body.fetchedAt || new Date().toISOString(),
    cached: body.cached,
  };
}
