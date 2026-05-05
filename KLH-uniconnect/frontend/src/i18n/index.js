import en from './en';
import hi from './hi';
import te from './te';

const translations = { English: en, Hindi: hi, Telugu: te };

/**
 * Get a nested value from an object using a dot-separated path.
 * Falls back to English, then to the key itself.
 */
export function getTranslation(lang, key) {
  const resolve = (obj, path) => {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  };
  const dict = translations[lang] || translations.English;
  const value = resolve(dict, key);
  if (value !== undefined) return value;
  // Fallback to English
  if (lang !== 'English') {
    const fallback = resolve(translations.English, key);
    if (fallback !== undefined) return fallback;
  }
  // Last resort: return the key itself
  return key;
}

export { translations };
export default translations;
