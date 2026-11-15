/**
 * A Madhya Pradesh mandi "Anugya-Patra" (agricultural produce transit permit)
 * as stored by the app. Field names mirror the sections of the printed permit.
 */
export interface PDFDocument {
  id: string;
  userId: string;
  title: string;

  // Header
  permitNumber: string;
  marketDistrict: string;
  marketPlace: string;
  marketCommittee: string;

  // 1–8: produce, quantity, owner, vehicle, weighing, driver, fee/purpose
  cropName: string;
  cropVariety: string;
  cropQuantityUnits: number;
  totalWeight: number;
  ownerName: string;
  vehicleType: string;
  vehicleNumber: string;
  weighingStation: string;
  weighingSlipNumber: string;
  driverName: string;
  depositedMarketFee: string;
  purposeOfTransport: string;

  // Trader section
  licenseNumber: string;
  manNumber: string;
  millQuality: string;
  cropDetails: string;
  purchaseDate: string;
  totalBroughtQuantity: number;
  returnedQuantity: number;
  returnReason: string;

  // Farmer section
  totalPurchaseQuantity: number;
  remainingStockWeight: number;

  // Buyer
  buyerTraderName: string;
  gstNumber: string;
  buyerManNumber: string;
  destinationState: string;

  // Destination / delivery buyer
  destTraderName: string;
  destGstNumber: string;
  destManNumber: string;

  // Issue / print
  issueDate: string;
  issueTime: string;
  printDate: string;
  printTime: string;

  createdAt: string;
  updatedAt: string;
}

export type PDFFormData = Omit<PDFDocument, "id" | "userId" | "createdAt" | "updatedAt">;
