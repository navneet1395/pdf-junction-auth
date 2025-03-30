
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePDF, PDFFormData } from "@/contexts/PDFContext";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowLeft, Download, Save } from "lucide-react";
import Layout from "@/components/Layout";
import PDFForm from "@/components/PDFForm";
import { toast } from "@/components/ui/use-toast";

const PDFGenerator = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getDocument, createDocument, updateDocument } = usePDF();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  const [formData, setFormData] = useState<PDFFormData>({
    title: "",
    permitNumber: "",
    cropName: "",
    vehicleType: "",
    vehicleNumber: "",
    driverName: "",
    weighingStation: "",
    weighingSlipNumber: "",
    millQuality: "",
    cropQuantityUnits: 0,
    totalWeight: 0,
    ownerName: "",
    licenseNumber: "",
    manNumber: "",
    cropDetails: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    totalPurchaseQuantity: 0,
    totalBroughtQuantity: 0,
    returnedQuantity: 0,
    returnReason: "",
    remainingStockWeight: 0,
    buyerTraderName: "",
    buyerManNumber: "",
    marketCommittee: "",
    gstNumber: "",
    marketDistrict: "",
    marketPlace: "",
    issueDate: new Date().toISOString().split("T")[0],
    issueTime: getCurrentTimeString(),
    printDate: new Date().toISOString().split("T")[0],
    printTime: getCurrentTimeString(),
    name: "",
    address: "",
    date: new Date().toISOString().split("T")[0],
    content: "",
  });

  useEffect(() => {
    if (isEditMode) {
      const document = getDocument(id);
      if (document) {
        setFormData({
          title: document.title,
          permitNumber: document.permitNumber || "",
          cropName: document.cropName || "",
          vehicleType: document.vehicleType || "",
          vehicleNumber: document.vehicleNumber || "",
          driverName: document.driverName || "",
          weighingStation: document.weighingStation || "",
          weighingSlipNumber: document.weighingSlipNumber || "",
          millQuality: document.millQuality || "",
          cropQuantityUnits: document.cropQuantityUnits || 0,
          totalWeight: document.totalWeight || 0,
          ownerName: document.ownerName || "",
          licenseNumber: document.licenseNumber || "",
          manNumber: document.manNumber || "",
          cropDetails: document.cropDetails || "",
          purchaseDate: document.purchaseDate || new Date().toISOString().split("T")[0],
          totalPurchaseQuantity: document.totalPurchaseQuantity || 0,
          totalBroughtQuantity: document.totalBroughtQuantity || 0,
          returnedQuantity: document.returnedQuantity || 0,
          returnReason: document.returnReason || "",
          remainingStockWeight: document.remainingStockWeight || 0,
          buyerTraderName: document.buyerTraderName || "",
          buyerManNumber: document.buyerManNumber || "",
          marketCommittee: document.marketCommittee || "",
          gstNumber: document.gstNumber || "",
          marketDistrict: document.marketDistrict || "",
          marketPlace: document.marketPlace || "",
          issueDate: document.issueDate || new Date().toISOString().split("T")[0],
          issueTime: document.issueTime || getCurrentTimeString(),
          printDate: document.printDate || new Date().toISOString().split("T")[0],
          printTime: document.printTime || getCurrentTimeString(),
          name: document.name,
          address: document.address,
          date: document.date,
          content: document.content,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Document not found",
        });
        navigate("/dashboard");
      }
    }
  }, [id, isEditMode, getDocument, navigate]);

  const handleFormChange = (newData: PDFFormData) => {
    setFormData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateDocument(id, formData);
      } else {
        await createDocument(formData);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleGeneratePDF = () => {
    try {
      // For demo purposes, we'll just show toast and navigate to preview
      // In a real app, this would generate and download a PDF
      if (isEditMode) {
        updateDocument(id, formData);
      } else {
        createDocument(formData).then(doc => {
          navigate(`/pdf-preview/${doc.id}`);
        });
      }
      
      toast({
        title: "Success",
        description: "PDF generated successfully",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? t("pdf.edit.title") : t("pdf.create.title")}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <PDFForm formData={formData} onChange={handleFormChange} />
          
          <CardFooter className="flex justify-between gap-4 flex-wrap pt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              {t("pdf.cancel")}
            </Button>
            <div className="flex gap-2">
              <Button 
                type="submit"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {t("pdf.save")}
              </Button>
              <Button 
                type="button"
                className="btn-primary flex items-center gap-2"
                onClick={handleGeneratePDF}
              >
                <Download className="h-4 w-4" />
                {t("pdf.generate")}
              </Button>
            </div>
          </CardFooter>
        </form>
      </div>
    </Layout>
  );
};

export default PDFGenerator;
