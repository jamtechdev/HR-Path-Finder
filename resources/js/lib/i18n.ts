import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '@/locales/en.json';
import koTranslations from '@/locales/ko.json';

// Initialize with JSON translations (JSON-only system)
const koResources = koTranslations;
const enResources = enTranslations;

const STORAGE_KEY = 'i18nextLng';

// Read saved language synchronously so it's used on first paint and persists after refresh
function getInitialLanguage(): string {
    if (typeof window === 'undefined') return 'ko';
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'ko') return saved;
        // Handle region codes (e.g. en-US -> en)
        if (saved && saved.startsWith('en')) return 'en';
        if (saved && saved.startsWith('ko')) return 'ko';
    } catch (_) {}
    return 'ko';
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enResources,
            },
            ko: {
                translation: koResources,
            },
        },
        fallbackLng: 'ko',
        lng: getInitialLanguage(), // Use saved language so refresh keeps selection
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: STORAGE_KEY,
            caches: ['localStorage'],
        },
    });

export default i18n;
