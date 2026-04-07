/**
 * HR Diagnosis copy is loaded from i18n (`diagnosis_strings`, `company_info`, `diagnosis_*` namespaces)
 * merged in `lib/i18n.ts`. This module exposes `tr` / `both` helpers and the default table for admin UI.
 */
import i18n from '@/lib/i18n';
import { diagnosisTranslationStrings } from '@/config/diagnosisTranslationStrings';

export { diagnosisTranslationStrings as t };

export type Lang = 'en' | 'ko';

export type DiagnosisStringKey = keyof typeof diagnosisTranslationStrings;

/** Align with i18next active language. */
export function getLang(): Lang {
    const l = (i18n.language || 'ko').toLowerCase();
    return l.startsWith('ko') ? 'ko' : 'en';
}

/** Bilingual pair for modals (fixed EN/KO regardless of current UI language). */
export function both(key: DiagnosisStringKey): { en: string; ko: string } {
    return {
        en: tr(key, 'en'),
        ko: tr(key, 'ko'),
    };
}

/** Single string; supports admin overrides via `diagnosis_overrides.<key>`. */
export function tr(key: DiagnosisStringKey, lang?: Lang): string {
    const lang_ = lang ?? getLang();
    const fixedT = i18n.getFixedT(lang_);
    const overrideKey = `diagnosis_overrides.${String(key)}`;
    const overrideVal = fixedT(overrideKey, { defaultValue: '' });
    if (
        typeof overrideVal === 'string' &&
        overrideVal.length > 0 &&
        overrideVal !== overrideKey
    ) {
        return overrideVal;
    }
    const primary = fixedT(`diagnosis_strings.${String(key)}`, {
        defaultValue: '',
    });
    if (
        typeof primary === 'string' &&
        primary.length > 0 &&
        primary !== `diagnosis_strings.${String(key)}`
    ) {
        return primary;
    }
    return diagnosisTranslationStrings[key][lang_];
}
