<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    protected TranslationService $translationService;

    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Display landing page translations for editing
     */
    public function index(Request $request): Response
    {
        $locale = $request->get('locale', 'ko');

        $translations = $this->translationService->getPageTranslations($locale, 'landing');

        return Inertia::render('Admin/LandingPage/Index', [
            'translations' => $translations,
            'locales' => $this->translationService->getLocales(),
            'currentLocale' => $locale,
        ]);
    }

    /**
     * Update landing page translations
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:ko,en'],
            'translations' => ['required', 'array'],
        ]);

        $locale = $validated['locale'];
        $translations = $validated['translations'];

        // Get all translations
        $allTranslations = $this->translationService->getTranslations($locale);

        // Update the landing section
        if (!isset($allTranslations['landing'])) {
            $allTranslations['landing'] = [];
        }

        // Merge with existing landing translations
        $allTranslations['landing'] = array_merge($allTranslations['landing'], $translations);

        $success = $this->translationService->saveTranslations($locale, $allTranslations);

        if ($success) {
            return redirect()->route('admin.landing-page.index', [
                'locale' => $locale,
            ])->with('success', 'Landing page translations updated successfully.');
        }

        return back()->withErrors(['error' => 'Failed to update translations.']);
    }
}
