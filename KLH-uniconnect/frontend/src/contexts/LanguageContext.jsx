import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTranslation } from '../i18n';

const LanguageContext = createContext();

const STORAGE_KEY = 'klhLanguage';

/**
 * LanguageProvider
 * Wraps the app and provides language + translation function.
 * Persists to localStorage; syncs to backend via optional saveToBackend callback.
 */
export function LanguageProvider({ children, initialLanguage }) {
  const [language, setLanguageState] = useState(() => {
    // Priority: prop → localStorage → 'English'
    return initialLanguage || localStorage.getItem(STORAGE_KEY) || 'English';
  });

  // Persist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    // Set html lang attribute for accessibility
    const langMap = { English: 'en', Hindi: 'hi', Telugu: 'te' };
    document.documentElement.lang = langMap[language] || 'en';
  }, [language]);

  // Translation function
  const t = useCallback((key) => getTranslation(language, key), [language]);

  // Setter that also persists
  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage hook — returns { language, setLanguage, t }
 * t('modules.profile') → translated string
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback when used outside provider (shouldn't happen but safe)
    return {
      language: 'English',
      setLanguage: () => {},
      t: (key) => getTranslation('English', key),
    };
  }
  return ctx;
}
