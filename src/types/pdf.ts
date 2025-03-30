
export interface PDFDocument {
  id: string;
  userId: string;
  title: string;
  permitNumber: string;
  cropName: string;
  vehicleType: string;
  vehicleNumber: string;
  driverName: string;
  weighingStation: string;
  weighingSlipNumber: string;
  millQuality: string;
  cropQuantityUnits: number;
  totalWeight: number;
  ownerName: string;
  licenseNumber: string;
  manNumber: string;
  cropDetails: string;
  purchaseDate: string;
  totalPurchaseQuantity: number;
  totalBroughtQuantity: number;
  returnedQuantity: number;
  returnReason: string;
  remainingStockWeight: number;
  buyerTraderName: string;
  buyerManNumber: string;
  marketCommittee: string;
  gstNumber: string;
  marketDistrict: string;
  marketPlace: string;
  issueDate: string;
  issueTime: string;
  printDate: string;
  printTime: string;
  name: string;
  address: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type PDFFormData = Omit<PDFDocument, "id" | "userId" | "createdAt" | "updatedAt">;
