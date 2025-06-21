import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePDF } from "@/contexts/PDFContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
const PDFPreview = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getDocument } = usePDF();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      const doc = getDocument(id);
      if (doc) {
        setData(doc);
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

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  if (!data) {
    return (
      <Layout>
               {" "}
        <div className="container mx-auto px-4 py-8 text-center">
                    {t("common.loading")}       {" "}
        </div>
             {" "}
      </Layout>
    );
  }
  return (
    <Layout>
           {" "}
      <div className="container mx-auto px-4 py-8">
               {" "}
        <div className="flex items-center justify-between mb-6">
                   {" "}
          <div className="flex items-center gap-2">
                       {" "}
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="p-0 h-auto"
            >
                            <ArrowLeft className="h-5 w-5" />           {" "}
            </Button>
                        <h1 className="text-2xl font-bold">{data.title}</h1>   
                 {" "}
          </div>
                   {" "}
          <div className="flex gap-2">
                       {" "}
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate(`/pdf-generator/${id}`)}
            >
                            <Edit className="h-4 w-4" />             {" "}
              {t("dashboard.edit")}           {" "}
            </Button>
                     {" "}
          </div>
                 {" "}
        </div>
                {/* <PDFViewerComponent data={documentData} /> */}       {" "}
        <div className=" border h-[1123px] w-[794px] bg-white  py-4 px-8 flex flex-col items-center">
                   {" "}
          <div className="flex justify-between items-center  w-[60%] self-start">
                        <div>{new Date().toLocaleString("en-IN")}</div>         
              <div>Anugya-Patra</div>         {" "}
          </div>
                   {" "}
          <div className="border border-black mt-12 w-[90%] h-full">
                       {" "}
            <div className="text-center">"केवल राज्य के बाहर उपयोग हेतु "</div> 
                     {" "}
            <div className="flex justify-between items-center gap-4 px-4">
                            <div>मूल प्रति</div>             {" "}
              <div className="flex flex-col items-center">
                               {" "}
                <div className="text-2xl font-bold">अनुज्ञा-पत्र</div>         
                     {" "}
                <div className="font-semibold">
                                    कृषि उपज मंडी समिति -{" "}
                  {data?.marketPlace || "Dabra"}               {" "}
                </div>
                               {" "}
                <div>
                                    जिला -{" "}
                  <b>{data?.marketDistrict || "Gwalior"}</b>               {" "}
                </div>
                               {" "}
                <div>अधिनियम की धारा-19(6) तथा उपविधि 20(10)</div>             
                 {" "}
                <div className="font-bold">
                                    (मूल मंडी क्षेत्र अथवा मंडी प्रांगण से माल
                  बाहर ले जाने के                   लिये)                {" "}
                </div>
                             {" "}
              </div>
                           {" "}
              <div>
                               {" "}
                <div className=" border w-full h-full p-16"></div>             {" "}
              </div>
                         {" "}
            </div>
                       {" "}
            <div className="mt-4">
                           {" "}
              <div className="text-center">
                                अनुज्ञा-पत्र क्रमांक :                {" "}
                <b>{data?.licenseNumber || "25226015703031334"}</b>             {" "}
              </div>
                           {" "}
              <div className="flex items-center gap-3 ">
                               {" "}
                <div className="flex gap-2 flex-1 ">
                                    <div>1.</div>                 {" "}
                  <div className="min-w-36">कृषि उपज का नाम</div>               
                    <b>{data?.cropName || " jo"}</b>               {" "}
                </div>
                               {" "}
                <div className="flex gap-2 self-start flex-1">
                                   {" "}
                  <div className="min-w-36">कृषि उपज का नाम</div>               
                    <b>{data?.cropName || " jo"}</b>               {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </div>
                    <hr className="border-2 mt-16  w-full " />         {" "}
          <div>NIC NIC BHOPAL(MP)&#169; 2025-2026</div>         {" "}
          <div className="self-start mt-32 w-full flex items-center justify-between">
                        <a>https://eanugya.mp.gov.in/Trader.aspx</a>           {" "}
            <div>1/1</div>         {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </Layout>
  );
};

export default PDFPreview;
