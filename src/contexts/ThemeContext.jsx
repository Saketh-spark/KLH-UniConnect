import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'klhTheme';

/**
 * ThemeProvider
 * Manages 'light' | 'dark' theme globally.
 * Toggles the 'dark' class on <html> for Tailwind dark mode.
 * Persists to localStorage; loads instantly before API.
 */
export function ThemeProvider({ children, initialTheme }) {
  const [theme, setThemeState] = useState(() => {
    return initialTheme || localStorage.getItem(STORAGE_KEY) || 'light';
  });

  // Apply the theme class to <html> and persist to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#e2e8f0';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme hook — returns { theme, setTheme, toggleTheme, isDark }
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: 'light', setTheme: () => {}, toggleTheme: () => {}, isDark: false };
  }
  return ctx;
}
