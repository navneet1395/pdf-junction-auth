import { PriceSummary } from "@/integrations/ogd/derive";

interface Props {
  price: PriceSummary | null;
  loading: boolean;
  isError: boolean;
  isStale: boolean;
  fetchedAt: string | null;
  hasSelection: boolean;
}

const inr = (n: number) => (Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : "—");

/** Read-only line showing today's Agmarknet price for the chosen mandi + crop. */
export function MandiPriceHint({ price, loading, isError, isStale, fetchedAt, hasSelection }: Props) {
  if (isError && !isStale) {
    return (
      <p className="text-xs text-muted-foreground md:col-span-3">
        Live mandi list unavailable (data.gov.in). You can still type values manually.
      </p>
    );
  }
  if (loading) {
    return <p className="text-xs text-muted-foreground md:col-span-3">Loading today's mandi data from data.gov.in…</p>;
  }
  if (!hasSelection) return null;

  const when = fetchedAt ? new Date(fetchedAt).toLocaleString("en-IN") : null;

  return (
    <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm md:col-span-3">
      {price ? (
        <>
          <span className="font-medium">Agmarknet, {price.market}:</span> {price.commodity}
          {price.variety ? ` (${price.variety})` : ""} — modal <b>{inr(price.modal)}</b>/qtl, range{" "}
          {inr(price.min)}–{inr(price.max)}, arrival {price.arrivalDate || "—"}.
        </>
      ) : (
        <span className="text-muted-foreground">No price reported today for this mandi + crop on data.gov.in.</span>
      )}
      {(isStale || when) && (
        <span className="ml-1 text-xs text-muted-foreground">
          {isStale ? "Showing cached data. " : ""}
          {when ? `Fetched ${when}.` : ""}
        </span>
      )}
    </div>
  );
}

export default MandiPriceHint;
