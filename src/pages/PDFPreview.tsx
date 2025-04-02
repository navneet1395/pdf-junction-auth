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
import PDFViewerComponent from "@/components/PDFViewerComponent";
const PDFPreview = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getDocument } = usePDF();
  const navigate = useNavigate();
  const [documentData, setDocument] = useState<PDFDocument | null>(null);

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

  async function handleDownload() {
    // In a real app, this would generate and download a PDF
    toast({
      title: "Success",
      description: "PDF downloaded successfully",
    });
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  if (!documentData) {
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
            <h1 className="text-2xl font-bold">{documentData.title}</h1>
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
          </div>
        </div>
        <PDFViewerComponent data={documentData} />
      </div>
    </Layout>
  );
};

export default PDFPreview;
