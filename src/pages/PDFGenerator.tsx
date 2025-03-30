
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePDF, PDFDocument } from "@/contexts/PDFContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ArrowLeft, Download, Save } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "@/components/ui/use-toast";

const PDFGenerator = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getDocument, createDocument, updateDocument } = usePDF();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<Omit<PDFDocument, "id" | "userId" | "createdAt" | "updatedAt">>({
    title: "",
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">
              {isEditMode ? t("pdf.edit.title") : t("pdf.create.title")}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("pdf.formTitle")}</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t("pdf.formName")}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("pdf.formAddress")}</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">{t("pdf.formDate")}</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">{t("pdf.formContent")}</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={6}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-4 flex-wrap">
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
        </Card>
      </div>
    </Layout>
  );
};

export default PDFGenerator;
