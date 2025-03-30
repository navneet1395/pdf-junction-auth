
import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Layout from "@/components/Layout";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <Layout showHeader={false}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <FileQuestion className="h-24 w-24 text-gray-300 mb-4" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-6">Page not found</p>
        <Button asChild className="btn-primary">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
