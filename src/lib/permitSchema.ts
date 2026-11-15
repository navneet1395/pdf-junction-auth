import { z } from "zod";
import { PDFFormData } from "@/types/pdf";

/** Indian GSTIN: 2-digit state code, PAN, entity code, Z, check digit. */
export const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;
/** Indian vehicle registration, spaces/hyphens removed, e.g. MP07GA1234, DL1CAB1234. */
export const VEHICLE_REGEX = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/;

export const normalizeVehicleNumber = (v: string) => v.replace(/[\s-]+/g, "").toUpperCase();
export const normalizeGstin = (v: string) => v.replace(/\s+/g, "").toUpperCase();

const str = z.string().trim();
const required = (label: string) => str.min(1, `${label} is required`);
const nonNegative = (label: string) =>
  z.coerce.number({ invalid_type_error: `${label} must be a number` }).min(0, `${label} cannot be negative`);
const optionalGstin = str
  .transform(normalizeGstin)
  .refine((v) => v === "" || GSTIN_REGEX.test(v), "Enter a valid 15-character GSTIN");

export const permitSchema = z
  .object({
    title: required("Title"),
    permitNumber: required("Permit number"),
    marketDistrict: required("Market district"),
    marketPlace: required("Mandi / market place"),
    marketCommittee: str,

    cropName: required("Crop name"),
    cropVariety: str,
    cropQuantityUnits: nonNegative("Crop quantity (units)"),
    totalWeight: nonNegative("Total weight"),
    ownerName: required("Owner / seller name"),
    vehicleType: required("Vehicle type"),
    vehicleNumber: str
      .transform(normalizeVehicleNumber)
      .refine((v) => v.length > 0, "Vehicle number is required")
      .refine((v) => v === "" || VEHICLE_REGEX.test(v), "Enter a valid vehicle number, e.g. MP07GA1234"),
    weighingStation: str,
    weighingSlipNumber: str,
    driverName: str,
    depositedMarketFee: str,
    purposeOfTransport: str,

    licenseNumber: str,
    manNumber: str,
    millQuality: str,
    cropDetails: str,
    purchaseDate: str,
    totalBroughtQuantity: nonNegative("Total brought quantity"),
    returnedQuantity: nonNegative("Returned quantity"),
    returnReason: str,

    totalPurchaseQuantity: nonNegative("Total purchase quantity"),
    remainingStockWeight: nonNegative("Remaining stock weight"),

    buyerTraderName: str,
    gstNumber: optionalGstin,
    buyerManNumber: str,
    destinationState: str,

    destTraderName: str,
    destGstNumber: optionalGstin,
    destManNumber: str,

    issueDate: required("Issue date"),
    issueTime: str,
    printDate: str,
    printTime: str,
  })
  .refine((d) => d.returnedQuantity <= d.totalBroughtQuantity, {
    message: "Returned quantity cannot exceed the total brought quantity",
    path: ["returnedQuantity"],
  });

export type PermitFieldErrors = Partial<Record<keyof PDFFormData, string>>;

export type PermitValidation =
  | { ok: true; data: PDFFormData; errors: PermitFieldErrors }
  | { ok: false; data: null; errors: PermitFieldErrors };

/** Validate and normalise a permit. Returns the first error message per field. */
export function validatePermit(input: PDFFormData): PermitValidation {
  const result = permitSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data as PDFFormData, errors: {} };
  const errors: PermitFieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof PDFFormData | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, data: null, errors };
}
