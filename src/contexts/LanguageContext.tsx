import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Lang } from '@/i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  ta: (key: string) => any;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('kssi-lang') as Lang) || 'fr';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('kssi-lang', newLang);
  };

  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  // t() returns a string value — falls back to FR then to the key itself
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[lang];
    for (const k of keys) value = value?.[k];
    if (typeof value === 'string') return value;
    // fallback to FR
    let fallback: any = translations['fr'];
    for (const k of keys) fallback = fallback?.[k];
    return typeof fallback === 'string' ? fallback : key;
  };

  // ta() returns any value (for arrays / objects)
  const ta = (key: string): any => {
    const keys = key.split('.');
    let value: any = translations[lang];
    for (const k of keys) value = value?.[k];
    if (value !== undefined) return value;
    let fallback: any = translations['fr'];
    for (const k of keys) fallback = fallback?.[k];
    return fallback;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, ta, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
