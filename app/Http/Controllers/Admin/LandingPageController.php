<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display a listing of landing page sections.
     */
    public function index(Request $request): Response
    {
        $locale = $request->get('locale', 'ko');
        $search = $request->get('search', '');

        $query = LandingPageSection::where('locale', $locale);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('section_key', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $sections = $query->orderBy('order')->orderBy('section_key')->paginate(50);

        // Get predefined section keys for reference
        $predefinedSections = [
            'hero_badge_text' => 'Hero Badge Text',
            'hero_title' => 'Hero Title',
            'hero_description' => 'Hero Description',
            'hero_cta_primary' => 'Hero CTA Primary Button',
            'hero_cta_secondary' => 'Hero CTA Secondary Button',
            'features_badge' => 'Features Section Badge',
            'features_title' => 'Features Section Title',
            'features_description' => 'Features Section Description',
            'process_title' => 'Process Section Title',
            'process_description' => 'Process Section Description',
            'benefits_title' => 'Benefits Section Title',
            'cta_title' => 'CTA Section Title',
            'cta_description' => 'CTA Section Description',
            'cta_button' => 'CTA Button Text',
        ];

        return Inertia::render('Admin/LandingPage/Index', [
            'sections' => $sections,
            'locales' => ['ko' => 'Korean', 'en' => 'English'],
            'currentLocale' => $locale,
            'search' => $search,
            'predefinedSections' => $predefinedSections,
        ]);
    }

    /**
     * Show the form for creating a new section.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/LandingPage/Create', [
            'locales' => ['ko' => 'Korean', 'en' => 'English'],
            'sectionTypes' => [
                'text' => 'Text',
                'textarea' => 'Textarea',
                'html' => 'HTML',
                'json' => 'JSON (for arrays/objects)',
            ],
        ]);
    }

    /**
     * Store a newly created section.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'section_key' => ['required', 'string', 'max:255', 'unique:landing_page_sections,section_key,NULL,id,locale,' . $request->locale],
            'section_type' => ['required', 'string', 'in:text,textarea,html,json'],
            'content' => ['required', 'string'],
            'locale' => ['required', 'string', 'in:ko,en'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'metadata' => ['nullable', 'array'],
        ]);

        $validated['order'] = $validated['order'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;

        LandingPageSection::create($validated);

        return redirect()->route('admin.landing-page.index', [
            'locale' => $validated['locale'],
        ])->with('success', 'Landing page section created successfully.');
    }

    /**
     * Show the form for editing a section.
     */
    public function edit(LandingPageSection $landingPage): Response
    {
        return Inertia::render('Admin/LandingPage/Edit', [
            'section' => $landingPage,
            'locales' => ['ko' => 'Korean', 'en' => 'English'],
            'sectionTypes' => [
                'text' => 'Text',
                'textarea' => 'Textarea',
                'html' => 'HTML',
                'json' => 'JSON (for arrays/objects)',
            ],
        ]);
    }

    /**
     * Update the specified section.
     */
    public function update(Request $request, LandingPageSection $landingPage)
    {
        $validated = $request->validate([
            'section_key' => ['required', 'string', 'max:255'],
            'section_type' => ['required', 'string', 'in:text,textarea,html,json'],
            'content' => ['required', 'string'],
            'locale' => ['required', 'string', 'in:ko,en'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'metadata' => ['nullable', 'array'],
        ]);

        // Check for unique section_key if it changed
        if ($validated['section_key'] !== $landingPage->section_key || 
            $validated['locale'] !== $landingPage->locale) {
            
            $exists = LandingPageSection::where('section_key', $validated['section_key'])
                ->where('locale', $validated['locale'])
                ->where('id', '!=', $landingPage->id)
                ->exists();

            if ($exists) {
                return back()->withErrors(['section_key' => 'This section key already exists for this locale.']);
            }
        }

        $landingPage->update($validated);

        return redirect()->route('admin.landing-page.index', [
            'locale' => $validated['locale'],
        ])->with('success', 'Landing page section updated successfully.');
    }

    /**
     * Remove the specified section.
     */
    public function destroy(LandingPageSection $landingPage)
    {
        $locale = $landingPage->locale;
        $landingPage->delete();

        return redirect()->route('admin.landing-page.index', [
            'locale' => $locale,
        ])->with('success', 'Landing page section deleted successfully.');
    }

    /**
     * Bulk create/update sections from JSON structure.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:ko,en'],
            'sections' => ['required', 'array'],
        ]);

        $updated = 0;
        foreach ($validated['sections'] as $key => $data) {
            if (is_array($data)) {
                LandingPageSection::updateOrCreate(
                    [
                        'section_key' => $key,
                        'locale' => $validated['locale'],
                    ],
                    [
                        'section_type' => $data['type'] ?? 'text',
                        'content' => $data['content'] ?? '',
                        'order' => $data['order'] ?? 0,
                        'is_active' => $data['is_active'] ?? true,
                        'metadata' => $data['metadata'] ?? null,
                    ]
                );
                $updated++;
            }
        }

        return redirect()->route('admin.landing-page.index', [
            'locale' => $validated['locale'],
        ])->with('success', "{$updated} sections updated successfully.");
    }
}
