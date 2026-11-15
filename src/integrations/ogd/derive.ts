import { MandiPriceRecord } from "./types";

type Rec = Partial<MandiPriceRecord> | Record<string, unknown>;

const text = (r: Rec, key: string): string => {
  const v = (r as Record<string, unknown>)[key];
  return v === null || v === undefined ? "" : String(v).trim();
};

const eq = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;

/** Distinct, trimmed, case-insensitively de-duplicated, sorted values of one column. */
function distinct(records: Rec[], key: string, filter?: (r: Rec) => boolean): string[] {
  const seen = new Map<string, string>();
  for (const r of records) {
    if (filter && !filter(r)) continue;
    const v = text(r, key);
    if (!v) continue;
    const k = v.toLowerCase();
    if (!seen.has(k)) seen.set(k, v);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export function districts(records: Rec[]): string[] {
  return distinct(records, "district");
}

export function markets(records: Rec[], district?: string): string[] {
  return distinct(records, "market", district ? (r) => eq(text(r, "district"), district) : undefined);
}

export function commodities(records: Rec[], market?: string): string[] {
  const inMarket = market ? distinct(records, "commodity", (r) => eq(text(r, "market"), market)) : [];
  // Fall back to every commodity when the chosen mandi has no rows (custom / not reporting today).
  return inMarket.length ? inMarket : distinct(records, "commodity");
}

/**
 * Varieties of a commodity. When a market is given and it reported that
 * commodity today, only its varieties are listed; otherwise all markets'.
 */
export function varieties(records: Rec[], commodity?: string, market?: string): string[] {
  if (!commodity) return [];
  if (market) {
    const local = distinct(
      records,
      "variety",
      (r) => eq(text(r, "commodity"), commodity) && eq(text(r, "market"), market),
    );
    if (local.length) return local;
  }
  return distinct(records, "variety", (r) => eq(text(r, "commodity"), commodity));
}

export interface PriceSummary {
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  min: number;
  max: number;
  modal: number;
}

const toNum = (v: unknown): number => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

/** dd/mm/yyyy → sortable yyyymmdd number; unparsable dates sort first. */
const dateKey = (s: string): number => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  return m ? Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]) : 0;
};

/**
 * Latest price row for a market + commodity (+ optional variety). When the
 * variety is not given or has no row, the most recent row for the commodity in
 * that market is returned.
 */
export function latestPrice(
  records: Rec[],
  sel: { market?: string; commodity?: string; variety?: string },
): PriceSummary | null {
  if (!sel.market || !sel.commodity) return null;
  const rows = records.filter(
    (r) => eq(text(r, "market"), sel.market!) && eq(text(r, "commodity"), sel.commodity!),
  );
  if (!rows.length) return null;
  const withVariety = sel.variety ? rows.filter((r) => eq(text(r, "variety"), sel.variety!)) : [];
  const pool = withVariety.length ? withVariety : rows;
  const best = pool.reduce((a, b) => (dateKey(text(b, "arrival_date")) > dateKey(text(a, "arrival_date")) ? b : a));
  return {
    market: text(best, "market"),
    commodity: text(best, "commodity"),
    variety: text(best, "variety"),
    arrivalDate: text(best, "arrival_date"),
    min: toNum(text(best, "min_price")),
    max: toNum(text(best, "max_price")),
    modal: toNum(text(best, "modal_price")),
  };
}
