/**
 * TranslationLoader component - No longer needed since we use JSON-only translations
 * Translations are loaded directly from JSON files in i18n.ts
 * This component is kept for backward compatibility but does nothing
 */
export default function TranslationLoader() {
    // Translations are now loaded directly from JSON files at initialization
    // No need to load from database or update dynamically
    return null; // This component doesn't render anything
}
