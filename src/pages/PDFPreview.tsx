
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePDF, PDFDocument } from "@/contexts/PDFContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Edit } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const PDFPreview = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getDocument } = usePDF();
  const navigate = useNavigate();
  const [document, setDocument] = useState<PDFDocument | null>(null);

  useEffect(() => {
    if (id) {
      const doc = getDocument(id);
      if (doc) {
        setDocument(doc);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Document not found",
        });
        navigate("/dashboard");
      }
    }
  }, [id, getDocument, navigate]);

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "Success",
      description: "PDF downloaded successfully",
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  if (!document) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          {t("common.loading")}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{document.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate(`/pdf-generator/${id}`)}
            >
              <Edit className="h-4 w-4" />
              {t("dashboard.edit")}
            </Button>
            <Button
              className="btn-primary flex items-center gap-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              {t("pdf.download")}
            </Button>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto p-8 font-serif">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-center mb-4">{document.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p><span className="font-bold">अनुज्ञा-पत्र क्रमांक:</span> {document.permitNumber}</p>
                <p><span className="font-bold">कृषि उपज का नाम:</span> {document.cropName}</p>
                <p><span className="font-bold">वाहन का प्रकार:</span> {document.vehicleType}</p>
                <p><span className="font-bold">वाहन क्रमांक:</span> {document.vehicleNumber}</p>
                <p><span className="font-bold">वाहन चालक का नाम:</span> {document.driverName}</p>
              </div>
              <div>
                <p><span className="font-bold">जारी करने का दिनांक:</span> {document.issueDate} {document.issueTime}</p>
                <p><span className="font-bold">प्रिंट दिनांक:</span> {document.printDate} {document.printTime}</p>
                <p><span className="font-bold">मंडी समिति:</span> {document.marketCommittee}</p>
                <p><span className="font-bold">स्थान:</span> {document.marketPlace}, {document.marketDistrict}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">कृषि उपज का विवरण</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p><span className="font-bold">कृषि उपज का विवरण:</span> {document.cropDetails}</p>
                <p><span className="font-bold">मिल कवालिटी:</span> {document.millQuality}</p>
                <p><span className="font-bold">कृषि उपज की मात्रा नग संख्या:</span> {document.cropQuantityUnits}</p>
                <p><span className="font-bold">कुल वजन (क्विंटल में):</span> {document.totalWeight}</p>
              </div>
              <div>
                <p><span className="font-bold">कुल क्रय मात्रा (क्विंटल में):</span> {document.totalPurchaseQuantity}</p>
                <p><span className="font-bold">कुल लाई गई मात्रा:</span> {document.totalBroughtQuantity}</p>
                <p><span className="font-bold">वापिस ले जायी गई मात्रा:</span> {document.returnedQuantity}</p>
                <p><span className="font-bold">वापिस ले जान े का कारण:</span> {document.returnReason}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">स्वामी विवरण</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p><span className="font-bold">कृषि उपज के स्वामी / विक्रेता का नाम:</span> {document.ownerName}</p>
                <p><span className="font-bold">अनुज्ञप्ति क्रमांक:</span> {document.licenseNumber}</p>
                <p><span className="font-bold">मान नंबर:</span> {document.manNumber}</p>
              </div>
              <div>
                <p><span className="font-bold">तौल कांटा का नाम एवं स्थान:</span> {document.weighingStation}</p>
                <p><span className="font-bold">तौल कांटा पर्ची नम्बर:</span> {document.weighingSlipNumber}</p>
                <p><span className="font-bold">क्रय दिनांक:</span> {document.purchaseDate}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">क्रेता विवरण</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p><span className="font-bold">क्रेता व्यापारी / फर्म:</span> {document.buyerTraderName}</p>
                <p><span className="font-bold">मान नंबर:</span> {document.buyerManNumber}</p>
                <p><span className="font-bold">जी.एस.टी. पंजीयन क्रमांक:</span> {document.gstNumber}</p>
              </div>
              <div>
                <p><span className="font-bold">शेष स्कंध वजन (क्विंटल में):</span> {document.remainingStockWeight}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6 mt-8">
            <div className="text-gray-700 whitespace-pre-line">
              <p className="mb-4">{document.content}</p>
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <div className="flex justify-between">
                <div>
                  <p>{document.name}</p>
                  <p>{document.address}</p>
                  <p>{formatDate(document.date)}</p>
                </div>
                <div className="mt-16 border-t border-dashed pt-2 inline-block">
                  <div className="font-bold">{document.name}</div>
                  <div className="text-sm text-gray-600">Signature</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PDFPreview;
