<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
        $locale = $request->get('locale', 'ko');
        $page = $request->get('page', 'all');
        $search = $request->get('search', '');

        $translations = $this->translationService->getFlatTranslations($locale, $page);

        // Filter by search
        if ($search) {
            $translations = array_filter($translations, function ($value, $key) use ($search) {
                return stripos($key, $search) !== false || stripos($value, $search) !== false;
            }, ARRAY_FILTER_USE_BOTH);
        }

        return Inertia::render('Admin/Translations/Index', [
            'translations' => $translations,
            'locales' => $this->translationService->getLocales(),
            'pages' => $this->translationService->getPages(),
            'currentLocale' => $locale,
            'currentPage' => $page,
            'search' => $search,
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
}
