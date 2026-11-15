import React, { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PDFFormData } from "@/types/pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PermitFieldErrors } from "@/lib/permitSchema";
import { useMandiData } from "@/hooks/useMandiData";
import { commodities, districts, latestPrice, markets, varieties } from "@/integrations/ogd/derive";
import ComboboxField from "@/components/form/ComboboxField";
import MandiPriceHint from "@/components/form/MandiPriceHint";

interface PDFFormProps {
  formData: PDFFormData;
  onChange: (newData: PDFFormData) => void;
  errors?: PermitFieldErrors;
}

type TextKey = {
  [K in keyof PDFFormData]: PDFFormData[K] extends string ? K : never;
}[keyof PDFFormData];
type NumberKey = {
  [K in keyof PDFFormData]: PDFFormData[K] extends number ? K : never;
}[keyof PDFFormData];


interface TextFieldProps {
  name: TextKey;
  label: React.ReactNode;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  className?: string;
}

const TextField = ({ name, label, value, error, onChange, type = "text", required, className }: TextFieldProps) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={name}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      aria-invalid={!!error}
      className={cn(error && "border-red-500")}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

interface NumberFieldProps {
  name: NumberKey;
  label: React.ReactNode;
  value: number;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
  className?: string;
}

const NumberField = ({ name, label, value, error, onChange, step, className }: NumberFieldProps) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={name}>{label}</Label>
    <Input
      id={name}
      name={name}
      type="number"
      min={0}
      step={step}
      value={value}
      onChange={onChange}
      aria-invalid={!!error}
      className={cn(error && "border-red-500")}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const PDFForm = ({ formData, onChange, errors = {} }: PDFFormProps) => {
  const { t } = useLanguage();
  const mandi = useMandiData();

  const districtOptions = useMemo(() => districts(mandi.records), [mandi.records]);
  const marketOptions = useMemo(
    () => markets(mandi.records, formData.marketDistrict || undefined),
    [mandi.records, formData.marketDistrict],
  );
  const commodityOptions = useMemo(
    () => commodities(mandi.records, formData.marketPlace || undefined),
    [mandi.records, formData.marketPlace],
  );
  const varietyOptions = useMemo(
    () => varieties(mandi.records, formData.cropName || undefined, formData.marketPlace || undefined),
    [mandi.records, formData.cropName, formData.marketPlace],
  );
  const price = useMemo(
    () =>
      latestPrice(mandi.records, {
        market: formData.marketPlace,
        commodity: formData.cropName,
        variety: formData.cropVariety,
      }),
    [mandi.records, formData.marketPlace, formData.cropName, formData.cropVariety],
  );

  const set = (patch: Partial<PDFFormData>) => onChange({ ...formData, ...patch });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    set({ [name]: value } as Partial<PDFFormData>);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    set({ [name]: value === "" ? 0 : Number(value) } as Partial<PDFFormData>);
  };

  const sourceHint = mandi.isError && !mandi.isStale ? undefined : "Suggestions from data.gov.in (Agmarknet)";

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          <TextField name="title" label={t("pdf.formTitle")} required value={formData.title} error={errors.title} onChange={handleInputChange} />
          <TextField name="permitNumber" label="अनुज्ञा-पत्र क्रमांक (Permit Number)" required value={formData.permitNumber} error={errors.permitNumber} onChange={handleInputChange} />
        </CardContent>
      </Card>

      {/* Mandi (prefilled from data.gov.in) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">मंडी विवरण (Mandi Details)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComboboxField
            id="marketDistrict"
            label="मंडी समिति का जिला (Market District)"
            required
            value={formData.marketDistrict}
            options={districtOptions}
            loading={mandi.isLoading}
            error={errors.marketDistrict}
            hint={sourceHint}
            onChange={(v) => {
              const changed = v !== formData.marketDistrict;
              set({
                marketDistrict: v,
                ...(changed && { marketPlace: "", marketCommittee: "" }),
              });
            }}
          />
          <ComboboxField
            id="marketPlace"
            label="स्थान / मंडी (Market Place)"
            required
            value={formData.marketPlace}
            options={marketOptions}
            loading={mandi.isLoading}
            error={errors.marketPlace}
            placeholder={formData.marketDistrict ? "Select or type mandi…" : "Pick a district first, or type…"}
            onChange={(v) =>
              set({
                marketPlace: v,
                marketCommittee: formData.marketCommittee || v,
              })
            }
          />
          <TextField name="marketCommittee" label="मंडी समिति (Market Committee)" value={formData.marketCommittee} error={errors.marketCommittee} onChange={handleInputChange} />
        </CardContent>
      </Card>

      {/* Crop (prefilled from data.gov.in) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">कृषि उपज (Produce)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComboboxField
            id="cropName"
            label="कृषि उपज का नाम (Crop Name)"
            required
            value={formData.cropName}
            options={commodityOptions}
            loading={mandi.isLoading}
            error={errors.cropName}
            hint={sourceHint}
            onChange={(v) => set({ cropName: v, ...(v !== formData.cropName && { cropVariety: "" }) })}
          />
          <ComboboxField
            id="cropVariety"
            label="किस्म (Variety)"
            value={formData.cropVariety}
            options={varietyOptions}
            loading={mandi.isLoading}
            error={errors.cropVariety}
            placeholder={formData.cropName ? "Select or type variety…" : "Pick a crop first, or type…"}
            onChange={(v) => set({ cropVariety: v })}
          />
          <TextField name="millQuality" label="मिल क्वालिटी (Mill Quality)" value={formData.millQuality} error={errors.millQuality} onChange={handleInputChange} />
          <MandiPriceHint
            price={price}
            loading={mandi.isLoading}
            isError={mandi.isError}
            isStale={mandi.isStale}
            fetchedAt={mandi.fetchedAt}
            hasSelection={!!formData.marketPlace && !!formData.cropName}
          />
          <NumberField name="cropQuantityUnits" label="कृषि उपज की मात्रा - नग संख्या (Crop Quantity Units)" value={formData.cropQuantityUnits} error={errors.cropQuantityUnits} onChange={handleNumberChange} />
          <NumberField name="totalWeight" label="कुल वजन (क्विंटल में) (Total Weight in Quintals)" step="0.01" value={formData.totalWeight} error={errors.totalWeight} onChange={handleNumberChange} />
          <TextField name="ownerName" label="कृषि उपज के स्वामी / विक्रेता का नाम (Owner/Seller Name)" required value={formData.ownerName} error={errors.ownerName} onChange={handleInputChange} />
        </CardContent>
      </Card>

      {/* Vehicle and weighing */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">वाहन एवं तौल (Vehicle &amp; Weighing)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField name="vehicleType" label="वाहन का प्रकार (Vehicle Type)" required value={formData.vehicleType} error={errors.vehicleType} onChange={handleInputChange} />
          <TextField name="vehicleNumber" label="वाहन क्रमांक (Vehicle Number)" required value={formData.vehicleNumber} error={errors.vehicleNumber} onChange={handleInputChange} />
          <TextField name="driverName" label="वाहन चालक का नाम (Driver Name)" value={formData.driverName} error={errors.driverName} onChange={handleInputChange} />
          <TextField name="weighingStation" label="तौल कांटा का नाम एवं स्थान (Weighing Station)" value={formData.weighingStation} error={errors.weighingStation} onChange={handleInputChange} />
          <TextField name="weighingSlipNumber" label="तौल कांटा पर्ची नम्बर (Weighing Slip Number)" value={formData.weighingSlipNumber} error={errors.weighingSlipNumber} onChange={handleInputChange} />
          <TextField name="depositedMarketFee" label="जमा की गई मंडी फीस / अनुज्ञापत्र का विवरण (Market Fee Deposited)" value={formData.depositedMarketFee} error={errors.depositedMarketFee} onChange={handleInputChange} />
          <TextField name="purposeOfTransport" label="बाहर ले जाने का उद्देश्य (Purpose of Transport)" value={formData.purposeOfTransport} error={errors.purposeOfTransport} onChange={handleInputChange} />
        </CardContent>
      </Card>

      {/* Trader section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">व्यापारी के लिये (For Trader)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField name="licenseNumber" label="अनुज्ञप्ति क्रमांक (License Number)" value={formData.licenseNumber} error={errors.licenseNumber} onChange={handleInputChange} />
          <TextField name="manNumber" label="मान नंबर (Man Number)" value={formData.manNumber} error={errors.manNumber} onChange={handleInputChange} />
          <TextField name="cropDetails" label="कृषि उपज का विवरण (Crop Details)" value={formData.cropDetails} error={errors.cropDetails} onChange={handleInputChange} />
          <TextField name="purchaseDate" label="क्रय दिनांक (Purchase Date)" type="date" value={formData.purchaseDate} error={errors.purchaseDate} onChange={handleInputChange} />
          <NumberField name="totalBroughtQuantity" label="कुल लाई गई मात्रा (Total Brought Quantity)" step="0.01" value={formData.totalBroughtQuantity} error={errors.totalBroughtQuantity} onChange={handleNumberChange} />
          <NumberField name="returnedQuantity" label="वापिस ले जायी गई मात्रा (Returned Quantity)" step="0.01" value={formData.returnedQuantity} error={errors.returnedQuantity} onChange={handleNumberChange} />
          <TextField name="returnReason" label="वापिस ले जाने का कारण (Return Reason)" value={formData.returnReason} error={errors.returnReason} onChange={handleInputChange} />
        </CardContent>
      </Card>

      {/* Farmer section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">कृषकों के लिये (For Farmers)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberField
            name="totalPurchaseQuantity"
            label="कुल क्रय मात्रा (क्विंटल में) (Total Purchase Quantity)"
            step="0.01" value={formData.totalPurchaseQuantity} error={errors.totalPurchaseQuantity} onChange={handleNumberChange} />
          <NumberField
            name="remainingStockWeight"
            label="निकासी के बाद शेष स्कंध वजन (क्विंटल में) (Remaining Stock Weight)"
            step="0.01"
            className="md:col-span-2" value={formData.remainingStockWeight} error={errors.remainingStockWeight} onChange={handleNumberChange} />
        </CardContent>
      </Card>

      {/* Buyer and destination */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">क्रेता एवं गंतव्य (Buyer &amp; Destination)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            name="buyerTraderName"
            label="क्रेता व्यापारी / फर्म / स्थान का नाम (Buyer/Trader Name)"
            className="md:col-span-3" value={formData.buyerTraderName} error={errors.buyerTraderName} onChange={handleInputChange} />
          <TextField name="gstNumber" label="जी.एस.टी. पंजीयन क्रमांक (GST Number)" value={formData.gstNumber} error={errors.gstNumber} onChange={handleInputChange} />
          <TextField name="buyerManNumber" label="मान नंबर (Buyer Man Number)" value={formData.buyerManNumber} error={errors.buyerManNumber} onChange={handleInputChange} />
          <TextField name="destinationState" label="जिला / प्रदेश (Destination District / State)" value={formData.destinationState} error={errors.destinationState} onChange={handleInputChange} />
          <TextField
            name="destTraderName"
            label="गंतव्य / डिलीवरी क्रेता व्यापारी / फर्म / स्थान का नाम (Delivery Buyer Name)"
            className="md:col-span-3" value={formData.destTraderName} error={errors.destTraderName} onChange={handleInputChange} />
          <TextField name="destGstNumber" label="जी.एस.टी. पंजीयन क्रमांक (Delivery GST Number)" value={formData.destGstNumber} error={errors.destGstNumber} onChange={handleInputChange} />
          <TextField name="destManNumber" label="मान नंबर (Delivery Man Number)" value={formData.destManNumber} error={errors.destManNumber} onChange={handleInputChange} />
        </CardContent>
      </Card>

      {/* Issue and print */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">जारी / प्रिंट (Issue &amp; Print)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField name="issueDate" label="जारी करने का दिनांक (Issue Date)" type="date" required value={formData.issueDate} error={errors.issueDate} onChange={handleInputChange} />
          <TextField name="issueTime" label="जारी करने का समय (Issue Time)" type="time" value={formData.issueTime} error={errors.issueTime} onChange={handleInputChange} />
          <TextField name="printDate" label="प्रिंट दिनांक (Print Date)" type="date" value={formData.printDate} error={errors.printDate} onChange={handleInputChange} />
          <TextField name="printTime" label="प्रिंट समय (Print Time)" type="time" value={formData.printTime} error={errors.printTime} onChange={handleInputChange} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFForm;
