<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Translation Management Controller (JSON-based only)
 * 
 * This controller manages translations stored in JSON files only.
 * All translations are read from and saved to resources/js/locales/{locale}.json
 * No database operations are performed.
 */
class TranslationController extends Controller
{
    protected TranslationService $translationService;

    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Display a listing of translations by page
     */
    public function index(Request $request): Response
    {
        $page = $request->get('page', 'all');
        $search = $request->get('search', '');
        $role = $request->get('role', 'all');
        $searchMode = $request->get('searchMode', 'contains');

        $enTranslations = $this->translationService->getFlatTranslations('en', $page);
        $koTranslations = $this->translationService->getFlatTranslations('ko', $page);

        $keys = array_unique(array_merge(array_keys($enTranslations), array_keys($koTranslations)));
        sort($keys);

        $translations = [];
        foreach ($keys as $key) {
            $enValue = (string) ($enTranslations[$key] ?? '');
            $koValue = (string) ($koTranslations[$key] ?? '');

            if (!$this->matchesRole($key, $role)) {
                continue;
            }

            if ($search) {
                $matched = $this->matchesSearch($searchMode, $search, $key, $enValue, $koValue);

                if (!$matched) {
                    continue;
                }
            }

            $translations[] = [
                'key' => $key,
                'en' => $enValue,
                'ko' => $koValue,
            ];
        }

        return Inertia::render('Admin/Translations/Index', [
            'translations' => $translations,
            'pages' => $this->translationService->getPages(),
            'currentPage' => $page,
            'search' => $search,
            'currentRole' => $role,
            'searchMode' => $searchMode,
            'roles' => [
                'all' => 'All Roles',
                'admin' => 'Admin',
                'hr' => 'HR',
                'ceo' => 'CEO',
                'common' => 'Common/Shared',
            ],
        ]);
    }

    /**
     * Show the form for editing translations for a specific page
     */
    public function edit(Request $request): Response
    {
        $locale = $request->get('locale', 'ko');
        $page = $request->get('page', 'all');

        $translations = $this->translationService->getPageTranslations($locale, $page);

        return Inertia::render('Admin/Translations/Edit', [
            'translations' => $translations,
            'locales' => $this->translationService->getLocales(),
            'pages' => $this->translationService->getPages(),
            'currentLocale' => $locale,
            'currentPage' => $page,
        ]);
    }

    /**
     * Update translations for a page
     */
    public function update(Request $request)
    {
        // New "single translation center" payload: update both locales together.
        if ($request->has('entries')) {
            $validated = $request->validate([
                'entries' => ['required', 'array'],
                'entries.*.key' => ['required', 'string'],
                'entries.*.en' => ['nullable', 'string'],
                'entries.*.ko' => ['nullable', 'string'],
            ]);

            $enTranslations = $this->translationService->getTranslations('en');
            $koTranslations = $this->translationService->getTranslations('ko');

            foreach ($validated['entries'] as $entry) {
                $key = $entry['key'];
                $enValue = (string) ($entry['en'] ?? '');
                $koValue = (string) ($entry['ko'] ?? '');

                $this->setNestedValue($enTranslations, $key, $enValue);
                $this->setNestedValue($koTranslations, $key, $koValue);
            }

            $savedEn = $this->translationService->saveTranslations('en', $enTranslations);
            $savedKo = $this->translationService->saveTranslations('ko', $koTranslations);

            if ($savedEn && $savedKo) {
                return redirect()->back()->with('success', 'Translations updated successfully.');
            }

            return back()->withErrors(['error' => 'Failed to update translations.']);
        }

        // Backward compatible payload
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:ko,en'],
            'page' => ['required', 'string'],
            'translations' => ['required', 'array'],
        ]);

        $locale = $validated['locale'];
        $page = $validated['page'];
        $translations = $validated['translations'];

        // Get all translations
        $allTranslations = $this->translationService->getTranslations($locale);

        // Update the specific page section
        if ($page === 'all') {
            // Merge with existing translations
            $allTranslations = array_merge_recursive($allTranslations, $translations);
            // Remove duplicates and keep the new values
            $allTranslations = $this->arrayMergeRecursiveDistinct($allTranslations, $translations);
        } else {
            // Handle nested pages like 'auth.login'
            $keys = explode('.', $page);
            $current = &$allTranslations;
            
            foreach ($keys as $key) {
                if (!isset($current[$key])) {
                    $current[$key] = [];
                }
                $current = &$current[$key];
            }
            
            $current = array_merge($current, $translations);
        }

        $success = $this->translationService->saveTranslations($locale, $allTranslations);

        if ($success) {
            return redirect()->route('admin.translations.index', [
                'locale' => $locale,
                'page' => $page,
            ])->with('success', 'Translations updated successfully.');
        }

        return back()->withErrors(['error' => 'Failed to update translations.']);
    }

    /**
     * Update a single translation key
     */
    public function updateKey(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:ko,en'],
            'key' => ['required', 'string'],
            'value' => ['required', 'string'],
        ]);

        $success = $this->translationService->updateTranslation(
            $validated['locale'],
            $validated['key'],
            $validated['value']
        );

        if ($success) {
            return response()->json(['success' => true, 'message' => 'Translation updated successfully.']);
        }

        return response()->json(['success' => false, 'message' => 'Failed to update translation.'], 422);
    }

    /**
     * Delete a translation key
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:ko,en'],
            'key' => ['required', 'string'],
        ]);

        $success = $this->translationService->deleteTranslation(
            $validated['locale'],
            $validated['key']
        );

        if ($success) {
            return redirect()->back()->with('success', 'Translation deleted successfully.');
        }

        return back()->withErrors(['error' => 'Failed to delete translation.']);
    }

    /**
     * Add a new translation key
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:ko,en'],
            'key' => ['required', 'string'],
            'value' => ['required', 'string'],
            'page' => ['nullable', 'string'],
        ]);

        $success = $this->translationService->addTranslation(
            $validated['locale'],
            $validated['key'],
            $validated['value'],
            $validated['page'] ?? null
        );

        if ($success) {
            return redirect()->back()->with('success', 'Translation added successfully.');
        }

        return back()->withErrors(['error' => 'Failed to add translation.']);
    }

    /**
     * Merge arrays recursively, keeping the second array's values
     */
    protected function arrayMergeRecursiveDistinct(array $array1, array $array2): array
    {
        $merged = $array1;

        foreach ($array2 as $key => &$value) {
            if (is_array($value) && isset($merged[$key]) && is_array($merged[$key])) {
                $merged[$key] = $this->arrayMergeRecursiveDistinct($merged[$key], $value);
            } else {
                $merged[$key] = $value;
            }
        }

        return $merged;
    }

    /**
     * Set a dot-notation key into a nested array.
     */
    protected function setNestedValue(array &$target, string $dotKey, string $value): void
    {
        $keys = explode('.', $dotKey);
        $current = &$target;

        foreach ($keys as $index => $key) {
            $isLast = $index === count($keys) - 1;

            if ($isLast) {
                $current[$key] = $value;
                return;
            }

            if (!isset($current[$key]) || !is_array($current[$key])) {
                $current[$key] = [];
            }

            $current = &$current[$key];
        }
    }

    /**
     * Role filter based on translation key naming conventions.
     */
    protected function matchesRole(string $key, string $role): bool
    {
        if ($role === 'all') {
            return true;
        }

        $normalized = strtolower($key);
        $isAdmin = str_contains($normalized, 'admin_') || str_starts_with($normalized, 'admin.');
        $isCeo = str_contains($normalized, 'ceo_') || str_starts_with($normalized, 'ceo.');
        $isHr = str_contains($normalized, 'hr_')
            || str_contains($normalized, 'hrmanager')
            || str_contains($normalized, 'hr_manager');

        return match ($role) {
            'admin' => $isAdmin,
            'ceo' => $isCeo,
            'hr' => $isHr,
            'common' => !$isAdmin && !$isCeo && !$isHr,
            default => true,
        };
    }

    /**
     * Search keys/values by contains or exact mode.
     */
    protected function matchesSearch(string $searchMode, string $search, string $key, string $enValue, string $koValue): bool
    {
        $needle = mb_strtolower(trim($search));
        if ($needle === '') {
            return true;
        }

        $candidates = [
            mb_strtolower($key),
            mb_strtolower($enValue),
            mb_strtolower($koValue),
        ];

        if ($searchMode === 'exact') {
            return in_array($needle, $candidates, true);
        }

        foreach ($candidates as $candidate) {
            if (str_contains($candidate, $needle)) {
                return true;
            }
        }

        return false;
    }
}
