/**
 * Types for the data.gov.in (OGD) "Current Daily Price of Various Commodities
 * from Various Markets (Mandi)" dataset, resource 9ef84268-d588-465a-a308-a864a43d0070,
 * as proxied by the `ogd-mandi` Supabase Edge Function.
 */
export interface MandiPriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade?: string;
  /** dd/mm/yyyy as published by Agmarknet */
  arrival_date: string;
  /** ₹ per quintal, numeric strings in the upstream feed */
  min_price: string | number;
  max_price: string | number;
  modal_price: string | number;
}

export interface OgdFieldDescriptor {
  id: string;
  name: string;
  type: string;
}

export interface OgdMandiResponse {
  records: MandiPriceRecord[];
  /** Column descriptors echoed from OGD, useful to confirm the schema. */
  fields: OgdFieldDescriptor[];
  /** Total rows upstream for the query (may exceed records.length). */
  total: number;
  /** ISO timestamp of when the proxy fetched from OGD. */
  fetchedAt: string;
  /** True when served from the proxy's in-memory cache. */
  cached?: boolean;
}

export interface MandiQuery {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
}
