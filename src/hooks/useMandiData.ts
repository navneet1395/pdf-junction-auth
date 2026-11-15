import { useQuery } from "@tanstack/react-query";
import { DEFAULT_STATE, fetchMandiPrices } from "@/integrations/ogd/client";
import { MandiPriceRecord, OgdMandiResponse } from "@/integrations/ogd/types";

const SIX_HOURS = 6 * 60 * 60 * 1000;
const ONE_DAY = 24 * SIX_HOURS / 6;
const CACHE_KEY = "ogd_mandi_cache_v1";

interface CachedPayload {
  state: string;
  savedAt: string;
  data: OgdMandiResponse;
}

const readCache = (state: string): OgdMandiResponse | undefined => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (parsed.state !== state || !Array.isArray(parsed.data?.records)) return undefined;
    return parsed.data;
  } catch {
    return undefined;
  }
};

const writeCache = (state: string, data: OgdMandiResponse) => {
  try {
    const payload: CachedPayload = { state, savedAt: new Date().toISOString(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* quota exceeded or storage disabled: live data still works */
  }
};

export interface MandiData {
  records: MandiPriceRecord[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** When the rows were fetched from OGD (live or from the local cache). */
  fetchedAt: string | null;
  /** True when showing the previous visit's rows because the live call failed. */
  isStale: boolean;
  refetch: () => void;
}

/**
 * Today's Agmarknet mandi rows for one state via the OGD proxy, cached for 6h
 * in memory and persisted to localStorage so the dropdowns work offline.
 */
export function useMandiData(state: string = DEFAULT_STATE): MandiData {
  const cached = readCache(state);

  const query = useQuery({
    queryKey: ["ogd", "mandi", state],
    queryFn: async ({ signal }) => {
      const data = await fetchMandiPrices({ state }, signal);
      writeCache(state, data);
      return data;
    },
    staleTime: SIX_HOURS,
    gcTime: ONE_DAY,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: cached,
  });

  const data = query.data ?? cached;
  return {
    records: data?.records ?? [],
    isLoading: query.isLoading && !cached,
    isError: query.isError,
    error: (query.error as Error) ?? null,
    fetchedAt: data?.fetchedAt ?? null,
    isStale: query.isError && !!cached,
    refetch: () => void query.refetch(),
  };
}
