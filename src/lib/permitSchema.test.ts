import { describe, expect, it } from "vitest";
import { emptyPermit, toFormData } from "./permit";
import { validatePermit } from "./permitSchema";

const valid = () => ({
  ...emptyPermit(),
  title: "Wheat to Ghaziabad",
  permitNumber: "2524601570303",
  marketDistrict: "Gwalior",
  marketPlace: "Dabra",
  cropName: "Wheat",
  ownerName: "Test Trader",
  vehicleType: "Truck",
  vehicleNumber: "mp 07 ga 1234",
  totalBroughtQuantity: 100,
  returnedQuantity: 10,
});

describe("validatePermit", () => {
  it("accepts a complete permit and normalises the vehicle number", () => {
    const r = validatePermit(valid());
    expect(r.ok).toBe(true);
    expect(r.data?.vehicleNumber).toBe("MP07GA1234");
  });

  it("reports one message per missing required field", () => {
    const r = validatePermit({ ...valid(), title: "", permitNumber: " ", cropName: "" });
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(["cropName", "permitNumber", "title"]);
  });

  it("rejects a malformed GSTIN but allows it to be blank", () => {
    expect(validatePermit({ ...valid(), gstNumber: "" }).ok).toBe(true);
    expect(validatePermit({ ...valid(), gstNumber: "09aaacb0643f2z3" }).ok).toBe(true);
    const bad = validatePermit({ ...valid(), gstNumber: "NOT-A-GST" });
    expect(bad.ok).toBe(false);
    expect(bad.errors.gstNumber).toMatch(/GSTIN/);
  });

  it("rejects a malformed vehicle number", () => {
    const r = validatePermit({ ...valid(), vehicleNumber: "1234" });
    expect(r.errors.vehicleNumber).toBeDefined();
  });

  it("rejects negative quantities and returned > brought", () => {
    expect(validatePermit({ ...valid(), totalWeight: -1 }).errors.totalWeight).toBeDefined();
    const r = validatePermit({ ...valid(), totalBroughtQuantity: 5, returnedQuantity: 6 });
    expect(r.errors.returnedQuantity).toMatch(/exceed/);
  });
});

describe("toFormData", () => {
  it("fills fields missing from documents saved by older versions", () => {
    const legacy = { id: "doc_1", title: "Old", permitNumber: "1", totalWeight: "12.5" } as never;
    const f = toFormData(legacy);
    expect(f.cropVariety).toBe("");
    expect(f.destGstNumber).toBe("");
    expect(f.totalWeight).toBe(12.5);
    expect(f.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("returns a blank permit for null", () => {
    expect(toFormData(null).title).toBe("");
  });
});
