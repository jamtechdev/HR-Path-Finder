import type { TFunction } from 'i18next';

/**
 * Translate only known static i18n keys.
 * If input is DB/user text, return as-is.
 */
export function translateStaticOnly(
    t: TFunction,
    value: string,
    staticPrefixes: string[],
): string {
    if (!value || typeof value !== 'string') return value;
    const shouldTranslate = staticPrefixes.some((prefix) =>
        value.startsWith(prefix),
    );
    if (!shouldTranslate) return value;
    return t(value, { defaultValue: value });
}

