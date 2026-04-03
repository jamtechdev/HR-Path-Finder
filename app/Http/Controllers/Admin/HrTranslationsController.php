<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HrTranslationsController extends Controller
{
    public function __construct(protected TranslationService $translationService)
    {
    }

    /**
     * Show HR/Diagnosis translation overrides that can be updated by admin.
     */
    public function index(Request $request): Response
    {
        $enAll = $this->translationService->getTranslations('en');
        $koAll = $this->translationService->getTranslations('ko');

        $enOverrides = $enAll['diagnosis_overrides'] ?? [];
        $koOverrides = $koAll['diagnosis_overrides'] ?? [];

        return Inertia::render('Admin/HrTranslations/Index', [
            'overrides' => [
                'en' => is_array($enOverrides) ? $enOverrides : [],
                'ko' => is_array($koOverrides) ? $koOverrides : [],
            ],
            'locales' => $this->translationService->getLocales(),
        ]);
    }

    /**
     * Replace diagnosis_overrides for each locale.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'overrides' => ['required', 'array'],
            'overrides.en' => ['required', 'array'],
            'overrides.ko' => ['required', 'array'],
            'overrides.en.*' => ['nullable', 'string'],
            'overrides.ko.*' => ['nullable', 'string'],
        ]);

        $enOverrides = $validated['overrides']['en'] ?? [];
        $koOverrides = $validated['overrides']['ko'] ?? [];

        foreach ([
            'en' => $enOverrides,
            'ko' => $koOverrides,
        ] as $locale => $overrides) {
            $allTranslations = $this->translationService->getTranslations($locale);
            $allTranslations['diagnosis_overrides'] = $overrides;
            $this->translationService->saveTranslations($locale, $allTranslations);
        }

        return back()->with('success', 'HR translation overrides updated successfully.');
    }
}

