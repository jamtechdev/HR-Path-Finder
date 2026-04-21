import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { diagnosisPageI18nEn, diagnosisPageI18nKo } from '@/config/diagnosisPageI18n';
import enLocale from '@/locales/en.json';
import koLocale from '@/locales/ko.json';

const STORAGE_KEY = 'i18nextLng';

async function fetchLocaleTranslations(locale: 'en' | 'ko'): Promise<Record<string, unknown>> {
    const response = await fetch(`/i18n/${locale}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
        credentials: 'same-origin',
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch locale ${locale}: ${response.status}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    return data ?? {};
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function deepMerge(
    base: Record<string, unknown>,
    override: Record<string, unknown>,
): Record<string, unknown> {
    const out: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(override)) {
        const existing = out[k];
        if (isPlainObject(existing) && isPlainObject(v)) {
            out[k] = deepMerge(existing, v);
        } else {
            out[k] = v;
        }
    }
    return out;
}

// Read saved language synchronously so it's used on first paint and persists after refresh
function getInitialLanguage(): string {
    if (typeof window === 'undefined') return 'ko';
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'ko') return saved;
        if (saved && saved.startsWith('en')) return 'en';
        if (saved && saved.startsWith('ko')) return 'ko';
    } catch (_) {}
    return 'ko';
}

export async function initializeI18n(): Promise<void> {
    let enTranslations: Record<string, unknown> = {};
    let koTranslations: Record<string, unknown> = {};

    try {
        [enTranslations, koTranslations] = await Promise.all([
            fetchLocaleTranslations('en'),
            fetchLocaleTranslations('ko'),
        ]);
    } catch (error) {
        // Keep app usable even if translation API is temporarily unavailable.
        console.error('[i18n] failed to load runtime locales', error);
    }

    const enMerged = deepMerge(
        deepMerge(
            diagnosisPageI18nEn as unknown as Record<string, unknown>,
            enLocale as Record<string, unknown>,
        ),
        enTranslations,
    );

    const koMerged = deepMerge(
        deepMerge(
            diagnosisPageI18nKo as unknown as Record<string, unknown>,
            koLocale as Record<string, unknown>,
        ),
        koTranslations,
    );

    await i18n.use(LanguageDetector).use(initReactI18next).init({
        resources: {
            en: {
                translation: enMerged,
            },
            ko: {
                translation: koMerged,
            },
        },
        fallbackLng: 'ko',
        lng: getInitialLanguage(),
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'cookie', 'navigator'],
            lookupLocalStorage: STORAGE_KEY,
            lookupCookie: STORAGE_KEY,
            caches: ['localStorage', 'cookie'],
            cookieMinutes: 60 * 24 * 365,
        },
    });
}

export default i18n;
