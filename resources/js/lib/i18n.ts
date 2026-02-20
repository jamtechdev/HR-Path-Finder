import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '@/locales/en.json';
import koTranslations from '@/locales/ko.json';

// Initialize with JSON translations (JSON-only system)
const koResources = koTranslations;
const enResources = enTranslations;

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
        fallbackLng: 'ko', // Default to Korean
        lng: 'ko', // Set default language to Korean
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
