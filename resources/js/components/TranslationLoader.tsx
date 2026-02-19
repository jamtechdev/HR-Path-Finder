import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { updateTranslationsFromDatabase } from '@/lib/i18n';

/**
 * Component that loads translations from database on every page load
 * Translations are shared via HandleInertiaRequests middleware
 * Supports both old format (single object) and new format ({ ko: {...}, en: {...} })
 */
export default function TranslationLoader() {
    const page = usePage<any>();
    const translations = page.props.translations;

    useEffect(() => {
        if (translations) {
            // Check if it's the new format (object with ko/en keys) or old format (single object)
            if (typeof translations === 'object' && (translations.ko || translations.en || Object.keys(translations).length > 0)) {
                updateTranslationsFromDatabase(translations);
            }
        }
    }, [translations]);

    return null; // This component doesn't render anything
}
