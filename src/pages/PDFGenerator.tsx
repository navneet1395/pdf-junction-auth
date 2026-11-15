import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePDF, PDFFormData } from "@/contexts/PDFContext";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowLeft, Download, Save } from "lucide-react";
import Layout from "@/components/Layout";
import PDFForm from "@/components/PDFForm";
import { toast } from "@/components/ui/use-toast";
import { emptyPermit, toFormData } from "@/lib/permit";
import { PermitFieldErrors, validatePermit } from "@/lib/permitSchema";

const PDFGenerator = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getDocument, createDocument, updateDocument, ready } = usePDF();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<PDFFormData>(() => emptyPermit());
  const [errors, setErrors] = useState<PermitFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !ready) return;
    const document = getDocument(id);
    if (document) {
      setFormData(toFormData(document));
    } else {
      toast({ variant: "destructive", title: "Error", description: "Document not found" });
      navigate("/dashboard");
    }
  }, [id, isEditMode, ready, getDocument, navigate]);

  const handleFormChange = (newData: PDFFormData) => {
    setFormData(newData);
    if (Object.keys(errors).length) setErrors({});
  };

  /** Validate, persist and return the saved document id (or null on failure). */
  const persist = async (): Promise<string | null> => {
    const result = validatePermit(formData);
    if (!result.ok) {
      setErrors(result.errors);
      const first = Object.keys(result.errors)[0];
      document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast({
        variant: "destructive",
        title: "Please fix the highlighted fields",
        description: Object.values(result.errors)[0],
      });
      return null;
    }
    setFormData(result.data);
    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateDocument(id, result.data);
        return id;
      }
      const doc = await createDocument(result.data);
      return doc.id;
    } catch (error) {
      console.error("Form submission error:", error);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const savedId = await persist();
    if (savedId) navigate("/dashboard");
  };

  const handleGeneratePDF = async () => {
    const savedId = await persist();
    if (savedId) navigate(`/pdf-preview/${savedId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="p-0 h-auto">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{isEditMode ? t("pdf.edit.title") : t("pdf.create.title")}</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <PDFForm formData={formData} onChange={handleFormChange} errors={errors} />

          <CardFooter className="flex justify-between gap-4 flex-wrap pt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
              {t("pdf.cancel")}
            </Button>
            <div className="flex gap-2">
              <Button type="submit" variant="outline" className="flex items-center gap-2" disabled={submitting}>
                <Save className="h-4 w-4" />
                {t("pdf.save")}
              </Button>
              <Button
                type="button"
                className="btn-primary flex items-center gap-2"
                onClick={handleGeneratePDF}
                disabled={submitting}
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
