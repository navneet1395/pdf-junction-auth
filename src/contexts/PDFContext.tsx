import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";
import { PDFDocument, PDFFormData } from "@/types/pdf";

interface PDFContextType {
  documents: PDFDocument[];
  loading: boolean;
  error: string | null;
  createDocument: (document: PDFFormData) => Promise<PDFDocument>;
  updateDocument: (id: string, document: Partial<PDFDocument>) => Promise<PDFDocument>;
  deleteDocument: (id: string) => Promise<void>;
  getDocument: (id: string) => PDFDocument | undefined;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export function PDFProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
    } else {
      setDocuments([]);
    }
  }, [user]);

  const loadDocuments = () => {
    try {
      setLoading(true);
      const storedDocs = localStorage.getItem(`pdfJunction_docs_${user?.id}`);
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveDocuments = (docs: PDFDocument[]) => {
    try {
      if (user) {
        localStorage.setItem(`pdfJunction_docs_${user.id}`, JSON.stringify(docs));
      }
    } catch (error) {
      console.error("Failed to save documents:", error);
    }
  };

  const createDocument = async (document: PDFFormData): Promise<PDFDocument> => {
    try {
      setLoading(true);
      if (!user) throw new Error("User must be logged in");

      const now = new Date().toISOString();
      const newDoc: PDFDocument = {
        ...document,
        id: `doc_${Date.now()}`,
        userId: user.id,
        createdAt: now,
        updatedAt: now,
      };

      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      toast({
        title: "Success",
        description: "Document created successfully",
      });

      return newDoc;
    } catch (error) {
      console.error("Failed to create document:", error);
      setError("Failed to create document. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create document. Please try again.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (id: string, document: Partial<PDFDocument>): Promise<PDFDocument> => {
    try {
      setLoading(true);
      if (!user) throw new Error("User must be logged in");

      const documentIndex = documents.findIndex(doc => doc.id === id);
      if (documentIndex === -1) throw new Error("Document not found");

      const updatedDoc: PDFDocument = {
        ...documents[documentIndex],
        ...document,
        updatedAt: new Date().toISOString(),
      };

      const updatedDocs = [...documents];
      updatedDocs[documentIndex] = updatedDoc;

      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      toast({
        title: "Success",
        description: "Document updated successfully",
      });

      return updatedDoc;
    } catch (error) {
      console.error("Failed to update document:", error);
      setError("Failed to update document. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update document. Please try again.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      if (!user) throw new Error("User must be logged in");

      const updatedDocs = documents.filter(doc => doc.id !== id);
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete document:", error);
      setError("Failed to delete document. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document. Please try again.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = (id: string): PDFDocument | undefined => {
    return documents.find(doc => doc.id === id);
  };

  return (
    <PDFContext.Provider
      value={{
        documents,
        loading,
        error,
        createDocument,
        updateDocument,
        deleteDocument,
        getDocument,
      }}
    >
      {children}
    </PDFContext.Provider>
  );
}

export function usePDF() {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error("usePDF must be used within a PDFProvider");
  }
  return context;
}

export type { PDFDocument, PDFFormData };
