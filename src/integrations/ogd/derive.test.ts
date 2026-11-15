import { describe, expect, it } from "vitest";
import { commodities, districts, latestPrice, markets, varieties } from "./derive";

// Shape of rows from OGD resource 9ef84268-d588-465a-a308-a864a43d0070.
const rows = [
  { state: "Madhya Pradesh", district: "Gwalior", market: "Dabra", commodity: "Wheat", variety: "Lokwan", grade: "FAQ", arrival_date: "14/11/2026", min_price: "2400", max_price: "2600", modal_price: "2500" },
  { state: "Madhya Pradesh", district: "Gwalior", market: "Dabra", commodity: "Wheat", variety: "Lokwan", grade: "FAQ", arrival_date: "15/11/2026", min_price: "2450", max_price: "2650", modal_price: "2550" },
  { state: "Madhya Pradesh", district: "Gwalior", market: "Dabra", commodity: "Wheat", variety: "Sharbati", grade: "FAQ", arrival_date: "15/11/2026", min_price: "3000", max_price: "3400", modal_price: "3200" },
  { state: "Madhya Pradesh", district: "Gwalior", market: "dabra", commodity: "Mustard", variety: "", grade: "FAQ", arrival_date: "15/11/2026", min_price: "5,100", max_price: "5,400", modal_price: "5,250" },
  { state: "Madhya Pradesh", district: "Gwalior", market: "Lashkar", commodity: "Gram", variety: "Desi", grade: "FAQ", arrival_date: "15/11/2026", min_price: "5000", max_price: "5200", modal_price: "5100" },
  { state: "Madhya Pradesh", district: "Indore", market: "Indore", commodity: "Soyabean", variety: "Yellow", grade: "FAQ", arrival_date: "15/11/2026", min_price: "4000", max_price: "4500", modal_price: "4300" },
  { state: "Madhya Pradesh", district: " Indore ", market: "Sanwer", commodity: "Wheat", variety: "Mill Quality", grade: "FAQ", arrival_date: "15/11/2026", min_price: "2300", max_price: "2500", modal_price: "2400" },
  { state: "Madhya Pradesh", district: "", market: "", commodity: "", variety: null, arrival_date: "", min_price: "", max_price: "", modal_price: "" },
  { state: "Madhya Pradesh", district: "Bhopal", market: "Bhopal", commodity: "Wheat" }, // missing columns
];

describe("districts", () => {
  it("returns distinct, trimmed, sorted districts", () => {
    expect(districts(rows)).toEqual(["Bhopal", "Gwalior", "Indore"]);
  });
  it("handles an empty list", () => {
    expect(districts([])).toEqual([]);
  });
});

describe("markets", () => {
  it("filters by district case-insensitively and de-duplicates market casing", () => {
    expect(markets(rows, "gwalior")).toEqual(["Dabra", "Lashkar"]);
  });
  it("returns every market when no district is chosen", () => {
    expect(markets(rows)).toEqual(["Bhopal", "Dabra", "Indore", "Lashkar", "Sanwer"]);
  });
  it("returns nothing for an unknown district", () => {
    expect(markets(rows, "Ujjain")).toEqual([]);
  });
});

describe("commodities", () => {
  it("lists commodities traded at the chosen mandi", () => {
    expect(commodities(rows, "Dabra")).toEqual(["Mustard", "Wheat"]);
  });
  it("falls back to all commodities when the mandi has no rows", () => {
    expect(commodities(rows, "Custom Mandi")).toEqual(["Gram", "Mustard", "Soyabean", "Wheat"]);
  });
});

describe("varieties", () => {
  it("lists varieties of the chosen commodity across all markets", () => {
    expect(varieties(rows, "wheat")).toEqual(["Lokwan", "Mill Quality", "Sharbati"]);
  });
  it("prefers the chosen market's varieties and falls back to all markets", () => {
    expect(varieties(rows, "Wheat", "Dabra")).toEqual(["Lokwan", "Sharbati"]);
    expect(varieties(rows, "Wheat", "Custom Mandi")).toEqual(["Lokwan", "Mill Quality", "Sharbati"]);
  });
  it("is empty without a commodity", () => {
    expect(varieties(rows)).toEqual([]);
  });
});

describe("latestPrice", () => {
  it("picks the most recent arrival for market + commodity + variety", () => {
    const p = latestPrice(rows, { market: "Dabra", commodity: "Wheat", variety: "Lokwan" });
    expect(p).toMatchObject({ arrivalDate: "15/11/2026", min: 2450, max: 2650, modal: 2550 });
  });
  it("falls back to the commodity when the variety has no row", () => {
    const p = latestPrice(rows, { market: "Dabra", commodity: "Wheat", variety: "Unknown" });
    expect(p?.commodity).toBe("Wheat");
    expect(p?.arrivalDate).toBe("15/11/2026");
  });
  it("parses prices with thousands separators", () => {
    const p = latestPrice(rows, { market: "Dabra", commodity: "Mustard" });
    expect(p?.modal).toBe(5250);
  });
  it("returns null when the selection is incomplete or absent", () => {
    expect(latestPrice(rows, { market: "Dabra" })).toBeNull();
    expect(latestPrice(rows, { market: "Nowhere", commodity: "Wheat" })).toBeNull();
  });
});
