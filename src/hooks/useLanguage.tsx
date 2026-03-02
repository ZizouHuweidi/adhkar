import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, type Language, type AppTranslations } from "@/i18n";
import * as api from "@/hooks/useApi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: AppTranslations;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    api.getSetting("language").then((lang) => {
      if (lang === "ar" || lang === "en") {
        setLanguageState(lang);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await api.setSetting("language", lang);
    
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const t = translations[language];
  const isRtl = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [isRtl, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
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
