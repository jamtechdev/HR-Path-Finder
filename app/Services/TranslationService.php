<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class TranslationService
{
    protected string $translationsPath;
    protected array $pages = [
        'landing' => 'Landing Page',
        'auth' => 'Authentication',
        'auth.login' => 'Login Page',
        'auth.register' => 'Register Page',
        'dashboard' => 'Dashboard',
        'common' => 'Common',
        'navigation' => 'Navigation',
        'buttons' => 'Buttons',
        'messages' => 'Messages',
    ];

    public function __construct()
    {
        $this->translationsPath = resource_path('js/locales');
    }

    /**
     * Get all translations for a locale
     */
    public function getTranslations(string $locale): array
    {
        $filePath = $this->translationsPath . "/{$locale}.json";
        
        if (!File::exists($filePath)) {
            return [];
        }

        $content = File::get($filePath);
        return json_decode($content, true) ?? [];
    }

    /**
     * Get translations for a specific page/section
     */
    public function getPageTranslations(string $locale, string $page): array
    {
        $translations = $this->getTranslations($locale);
        
        if ($page === 'all') {
            return $translations;
        }

        // Handle nested keys like 'auth.login'
        $keys = explode('.', $page);
        $result = $translations;
        
        foreach ($keys as $key) {
            if (isset($result[$key])) {
                $result = $result[$key];
            } else {
                return [];
            }
        }
        
        return is_array($result) ? $result : [];
    }

    /**
     * Save translations for a locale
     */
    public function saveTranslations(string $locale, array $translations): bool
    {
        $filePath = $this->translationsPath . "/{$locale}.json";
        
        // Sort keys recursively
        $translations = $this->sortKeysRecursive($translations);
        
        $json = json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
        return File::put($filePath, $json) !== false;
    }

    /**
     * Update a specific translation key
     */
    public function updateTranslation(string $locale, string $key, string $value): bool
    {
        $translations = $this->getTranslations($locale);
        
        // Handle nested keys like 'auth.login.title'
        $keys = explode('.', $key);
        $current = &$translations;
        
        foreach ($keys as $k) {
            if (!isset($current[$k])) {
                $current[$k] = [];
            }
            if ($k === end($keys)) {
                $current[$k] = $value;
            } else {
                $current = &$current[$k];
            }
        }
        
        return $this->saveTranslations($locale, $translations);
    }

    /**
     * Delete a translation key
     */
    public function deleteTranslation(string $locale, string $key): bool
    {
        $translations = $this->getTranslations($locale);
        
        $keys = explode('.', $key);
        $current = &$translations;
        
        for ($i = 0; $i < count($keys) - 1; $i++) {
            if (!isset($current[$keys[$i]])) {
                return false;
            }
            $current = &$current[$keys[$i]];
        }
        
        $lastKey = end($keys);
        if (isset($current[$lastKey])) {
            unset($current[$lastKey]);
            return $this->saveTranslations($locale, $translations);
        }
        
        return false;
    }

    /**
     * Add a new translation key
     */
    public function addTranslation(string $locale, string $key, string $value, ?string $page = null): bool
    {
        $translations = $this->getTranslations($locale);
        
        // If page is specified, prepend it to the key
        if ($page && $page !== 'all') {
            $key = $page . '.' . $key;
        }
        
        return $this->updateTranslation($locale, $key, $value);
    }

    /**
     * Get all available pages
     */
    public function getPages(): array
    {
        return $this->pages;
    }

    /**
     * Get flat list of all translation keys for a page
     */
    public function getFlatTranslations(string $locale, string $page): array
    {
        $translations = $this->getPageTranslations($locale, $page);
        return $this->flattenArray($translations, $page === 'all' ? '' : $page);
    }

    /**
     * Flatten nested array to dot notation
     */
    protected function flattenArray(array $array, string $prefix = ''): array
    {
        $result = [];
        
        foreach ($array as $key => $value) {
            $newKey = $prefix ? "{$prefix}.{$key}" : $key;
            
            if (is_array($value)) {
                $result = array_merge($result, $this->flattenArray($value, $newKey));
            } else {
                $result[$newKey] = $value;
            }
        }
        
        return $result;
    }

    /**
     * Sort array keys recursively
     */
    protected function sortKeysRecursive(array $array): array
    {
        ksort($array);
        
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $array[$key] = $this->sortKeysRecursive($value);
            }
        }
        
        return $array;
    }

    /**
     * Get all locales
     */
    public function getLocales(): array
    {
        return ['ko' => 'Korean', 'en' => 'English'];
    }
}
