import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePDF, PDFDocument } from "@/contexts/PDFContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit } from "lucide-react";
import Layout from "@/components/Layout";
import AnugyaPatraDocument from "@/components/pdf/AnugyaPatraDocument";
import { toFormData } from "@/lib/permit";
import { toast } from "@/components/ui/use-toast";

const safeFileName = (s: string) => s.replace(/[^A-Za-z0-9_-]+/g, "_") || "permit";

const PDFPreview = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getDocument, ready } = usePDF();
  const navigate = useNavigate();
  const [documentData, setDocumentData] = useState<PDFDocument | null>(null);

  useEffect(() => {
    if (!id || !ready) return;
    const doc = getDocument(id);
    if (doc) {
      setDocumentData(doc);
    } else {
      toast({ variant: "destructive", title: "Error", description: "Document not found" });
      navigate("/dashboard");
    }
  }, [id, ready, getDocument, navigate]);

  if (!documentData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">{t("common.loading")}</div>
      </Layout>
    );
  }

  const formData = toFormData(documentData);
  const pdfDoc = <AnugyaPatraDocument data={formData} />;
  const fileName = `anugya-${safeFileName(formData.permitNumber || documentData.id)}.pdf`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="p-0 h-auto">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{documentData.title || formData.permitNumber}</h1>
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
            <PDFDownloadLink document={pdfDoc} fileName={fileName}>
              {({ loading: rendering }) => (
                <Button className="btn-primary flex items-center gap-2" disabled={rendering} type="button">
                  <Download className="h-4 w-4" />
                  {rendering ? t("common.loading") : t("pdf.download")}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-2">
          <PDFViewer
            className="w-full"
            style={{ width: "100%", height: "min(1123px, 85vh)", border: "none" }}
            showToolbar
          >
            {pdfDoc}
          </PDFViewer>
        </div>
      </div>
    </Layout>
  );
};

export default PDFPreview;
