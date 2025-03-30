
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
            <div className="flex justify-between text-gray-600">
              <div>{document.name}</div>
              <div>{formatDate(document.date)}</div>
            </div>
            <div className="text-gray-600 mt-1">{document.address}</div>
          </div>
          
          <div className="whitespace-pre-line">
            {document.content}
          </div>
          
          <div className="mt-8 pt-4 border-t">
            <div className="text-right">
              <div className="mt-16 border-t border-dashed pt-2 inline-block">
                <div className="font-bold">{document.name}</div>
                <div className="text-sm text-gray-600">Signature</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PDFPreview;
