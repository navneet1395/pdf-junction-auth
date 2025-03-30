
import React, { createContext, useContext, useState } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Auth
    "login.title": "Welcome Back",
    "login.subtitle": "Log in to your PDF Junction account",
    "login.email": "Email",
    "login.password": "Password",
    "login.button": "Log In",
    "login.noAccount": "Don't have an account?",
    "login.signup": "Sign Up",
    
    "signup.title": "Create Account",
    "signup.subtitle": "Sign up for a new PDF Junction account",
    "signup.email": "Email",
    "signup.password": "Password",
    "signup.confirmPassword": "Confirm Password",
    "signup.button": "Create Account",
    "signup.hasAccount": "Already have an account?",
    "signup.login": "Log In",
    
    // Dashboard
    "dashboard.title": "Your Documents",
    "dashboard.create": "Create New PDF",
    "dashboard.empty": "No documents found. Create your first PDF!",
    "dashboard.search": "Search documents...",
    "dashboard.logout": "Log Out",
    "dashboard.tableDate": "Date",
    "dashboard.tableTitle": "Title",
    "dashboard.tableActions": "Actions",
    "dashboard.edit": "Edit",
    "dashboard.view": "View",
    "dashboard.delete": "Delete",
    
    // PDF Generator
    "pdf.create.title": "Create New PDF",
    "pdf.edit.title": "Edit PDF",
    "pdf.formName": "Name",
    "pdf.formAddress": "Address",
    "pdf.formDate": "Date",
    "pdf.formTitle": "Title",
    "pdf.formContent": "Content",
    "pdf.generate": "Generate PDF",
    "pdf.save": "Save",
    "pdf.cancel": "Cancel",
    "pdf.download": "Download PDF",
    "pdf.preview": "Preview",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.retry": "Try Again",
    "common.success": "Success!",
    "common.language": "Language",
  },
  hi: {
    // Auth
    "login.title": "वापस स्वागत है",
    "login.subtitle": "अपने PDF जंक्शन खाते में लॉग इन करें",
    "login.email": "ईमेल",
    "login.password": "पासवर्ड",
    "login.button": "लॉग इन करें",
    "login.noAccount": "खाता नहीं है?",
    "login.signup": "साइन अप करें",
    
    "signup.title": "खाता बनाएं",
    "signup.subtitle": "एक नए PDF जंक्शन खाते के लिए साइन अप करें",
    "signup.email": "ईमेल",
    "signup.password": "पासवर्ड",
    "signup.confirmPassword": "पासवर्ड की पुष्टि करें",
    "signup.button": "खाता बनाएं",
    "signup.hasAccount": "पहले से ही एक खाता है?",
    "signup.login": "लॉग इन करें",
    
    // Dashboard
    "dashboard.title": "आपके दस्तावेज़",
    "dashboard.create": "नया PDF बनाएं",
    "dashboard.empty": "कोई दस्तावेज़ नहीं मिला। अपना पहला PDF बनाएं!",
    "dashboard.search": "दस्तावेज खोजें...",
    "dashboard.logout": "लॉग आउट",
    "dashboard.tableDate": "तारीख",
    "dashboard.tableTitle": "शीर्षक",
    "dashboard.tableActions": "कार्रवाई",
    "dashboard.edit": "संपादित करें",
    "dashboard.view": "देखें",
    "dashboard.delete": "हटाएं",
    
    // PDF Generator
    "pdf.create.title": "नया PDF बनाएं",
    "pdf.edit.title": "PDF संपादित करें",
    "pdf.formName": "नाम",
    "pdf.formAddress": "पता",
    "pdf.formDate": "तारीख",
    "pdf.formTitle": "शीर्षक",
    "pdf.formContent": "सामग्री",
    "pdf.generate": "PDF उत्पन्न करें",
    "pdf.save": "सहेजें",
    "pdf.cancel": "रद्द करें",
    "pdf.download": "PDF डाउनलोड करें",
    "pdf.preview": "पूर्वावलोकन",
    
    // Common
    "common.loading": "लोड हो रहा है...",
    "common.error": "एक त्रुटि हुई",
    "common.retry": "पुनः प्रयास करें",
    "common.success": "सफलता!",
    "common.language": "भाषा",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
