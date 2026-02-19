import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '@/locales/en.json';
import koTranslations from '@/locales/ko.json';

// Function to merge database translations with JSON fallback
function mergeTranslations(dbTranslations: any, jsonTranslations: any): any {
    if (!dbTranslations || Object.keys(dbTranslations).length === 0) {
        return jsonTranslations;
    }
    
    // Deep merge: database translations override JSON translations
    const merged = { ...jsonTranslations };
    
    function deepMerge(target: any, source: any) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    
    deepMerge(merged, dbTranslations);
    return merged;
}

// Initialize with JSON translations first
let koResources = koTranslations;
let enResources = enTranslations;

// Function to update translations from database (called after Inertia page load)
export function updateTranslationsFromDatabase(dbTranslations: any) {
    if (dbTranslations && typeof dbTranslations === 'object') {
        // Handle both old format (single object) and new format (object with ko/en keys)
        if (dbTranslations.ko || dbTranslations.en) {
            // New format: { ko: {...}, en: {...} }
            if (dbTranslations.ko && Object.keys(dbTranslations.ko).length > 0) {
                koResources = mergeTranslations(dbTranslations.ko, koTranslations);
                i18n.addResourceBundle('ko', 'translation', koResources, true, true);
            }
            if (dbTranslations.en && Object.keys(dbTranslations.en).length > 0) {
                enResources = mergeTranslations(dbTranslations.en, enTranslations);
                i18n.addResourceBundle('en', 'translation', enResources, true, true);
            }
        } else {
            // Old format: single object (assumed to be Korean)
            if (Object.keys(dbTranslations).length > 0) {
                koResources = mergeTranslations(dbTranslations, koTranslations);
                i18n.addResourceBundle('ko', 'translation', koResources, true, true);
            }
        }
    }
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
