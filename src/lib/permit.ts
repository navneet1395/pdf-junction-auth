import { PDFDocument, PDFFormData } from "@/types/pdf";

const todayISO = () => new Date().toISOString().split("T")[0];

/** "HH:MM" in local time, as accepted by <input type="time">. */
const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** A blank permit with today's date/time defaults. */
export function emptyPermit(): PDFFormData {
  return {
    title: "",
    permitNumber: "",
    marketDistrict: "",
    marketPlace: "",
    marketCommittee: "",

    cropName: "",
    cropVariety: "",
    cropQuantityUnits: 0,
    totalWeight: 0,
    ownerName: "",
    vehicleType: "",
    vehicleNumber: "",
    weighingStation: "",
    weighingSlipNumber: "",
    driverName: "",
    depositedMarketFee: "",
    purposeOfTransport: "",

    licenseNumber: "",
    manNumber: "",
    millQuality: "",
    cropDetails: "",
    purchaseDate: todayISO(),
    totalBroughtQuantity: 0,
    returnedQuantity: 0,
    returnReason: "",

    totalPurchaseQuantity: 0,
    remainingStockWeight: 0,

    buyerTraderName: "",
    gstNumber: "",
    buyerManNumber: "",
    destinationState: "",

    destTraderName: "",
    destGstNumber: "",
    destManNumber: "",

    issueDate: todayISO(),
    issueTime: nowHHMM(),
    printDate: todayISO(),
    printTime: nowHHMM(),
  };
}

const FORM_KEYS = Object.keys(emptyPermit()) as (keyof PDFFormData)[];

/**
 * Convert a stored document (possibly saved by an older version of the app
 * that lacked some fields) into a complete form value.
 */
export function toFormData(doc: Partial<PDFDocument> | undefined | null): PDFFormData {
  const base = emptyPermit();
  if (!doc) return base;
  const out: Record<string, unknown> = { ...base };
  for (const key of FORM_KEYS) {
    const v = (doc as Record<string, unknown>)[key];
    if (v === undefined || v === null) continue;
    out[key] = typeof base[key] === "number" ? Number(v) || 0 : String(v);
  }
  return out as unknown as PDFFormData;
}
