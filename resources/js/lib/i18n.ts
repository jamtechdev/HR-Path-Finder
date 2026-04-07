import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { diagnosisPageI18nEn, diagnosisPageI18nKo } from '@/config/diagnosisPageI18n';
import { diagnosisTranslationStrings } from '@/config/diagnosisTranslationStrings';
import enTranslations from '@/locales/en.json';
import koTranslations from '@/locales/ko.json';

const STORAGE_KEY = 'i18nextLng';

const COMPANY_INFO_KEYS = [
    'companyInfoPageTitle',
    'companyInfoHeroTitle',
    'companyInfoHeroDesc',
    'companyIdentitySection',
    'companyNameLabel',
    'companyNamePlaceholder',
    'registrationNumberLabel',
    'registrationNumberFormatHint',
    'brandNameLabel',
    'brandNamePlaceholder',
    'foundationDateLabel',
    'publicListingLabel',
    'listedLabel',
    'privateLabel',
    'industryLocationSection',
    'primaryIndustryLabel',
    'primaryIndustryPlaceholder',
    'othersLabel',
    'specifyPlaceholder',
    'subIndustryLabel',
    'subIndustryPlaceholder',
    'hqLocationLabel',
    'hqLocationPlaceholder',
    'logoUploadTitle',
    'logoUploadHint',
    'logoUploadSpec',
    'chooseFileBtn',
    'logoAlt',
    'fileTypeError',
    'fileSizeError',
    'saveDraft',
    'saveDraftHint',
    'completionTitle',
    'completionDescription',
] as const satisfies ReadonlyArray<keyof typeof diagnosisTranslationStrings>;

function flattenDiagnosisStrings(lang: 'en' | 'ko'): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(diagnosisTranslationStrings)) {
        out[k] = v[lang];
    }
    return out;
}

function companyInfoBundle(lang: 'en' | 'ko'): Record<string, string> {
    const out: Record<string, string> = {};
    for (const k of COMPANY_INFO_KEYS) {
        out[k] = diagnosisTranslationStrings[k][lang];
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

const enMerged = {
    ...enTranslations,
    diagnosis_strings: flattenDiagnosisStrings('en'),
    company_info: companyInfoBundle('en'),
    ...diagnosisPageI18nEn,
};

const koMerged = {
    ...koTranslations,
    diagnosis_strings: flattenDiagnosisStrings('ko'),
    company_info: companyInfoBundle('ko'),
    ...diagnosisPageI18nKo,
};

i18n.use(LanguageDetector).use(initReactI18next).init({
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
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: STORAGE_KEY,
        caches: ['localStorage'],
    },
});

export default i18n;
