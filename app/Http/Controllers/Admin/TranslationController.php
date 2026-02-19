<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Translation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TranslationController extends Controller
{
    /**
     * Display a listing of translations.
     */
    public function index(Request $request): Response
    {
        $locale = $request->get('locale', 'ko');
        $namespace = $request->get('namespace', 'translation');
        $search = $request->get('search', '');

        $query = Translation::where('locale', $locale)
            ->where('namespace', $namespace);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('value', 'like', "%{$search}%");
            });
        }

        $translations = $query->orderBy('key')->paginate(50);

        return Inertia::render('Admin/Translations/Index', [
            'translations' => $translations,
            'locales' => ['ko' => 'Korean', 'en' => 'English'],
            'namespaces' => ['translation' => 'Main Translations'],
            'currentLocale' => $locale,
            'currentNamespace' => $namespace,
            'search' => $search,
        ]);
    }

    /**
     * Show the form for creating a new translation.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Translations/Create', [
            'locales' => ['ko' => 'Korean', 'en' => 'English'],
            'namespaces' => ['translation' => 'Main Translations'],
        ]);
    }

    /**
     * Store a newly created translation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:ko,en'],
            'namespace' => ['required', 'string'],
            'key' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        Translation::updateOrCreate(
            [
                'locale' => $validated['locale'],
                'namespace' => $validated['namespace'],
                'key' => $validated['key'],
            ],
            $validated
        );

        return redirect()->route('admin.translations.index', [
            'locale' => $validated['locale'],
            'namespace' => $validated['namespace'],
        ])->with('success', 'Translation created successfully.');
    }

    /**
     * Show the form for editing a translation.
     */
    public function edit(Translation $translation): Response
    {
        return Inertia::render('Admin/Translations/Edit', [
            'translation' => $translation,
            'locales' => ['ko' => 'Korean', 'en' => 'English'],
            'namespaces' => ['translation' => 'Main Translations'],
        ]);
    }

    /**
     * Update the specified translation.
     */
    public function update(Request $request, Translation $translation)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:ko,en'],
            'namespace' => ['required', 'string'],
            'key' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        // If key changed, check for uniqueness
        if ($validated['key'] !== $translation->key || 
            $validated['locale'] !== $translation->locale || 
            $validated['namespace'] !== $translation->namespace) {
            
            $exists = Translation::where('locale', $validated['locale'])
                ->where('namespace', $validated['namespace'])
                ->where('key', $validated['key'])
                ->where('id', '!=', $translation->id)
                ->exists();

            if ($exists) {
                return back()->withErrors(['key' => 'This translation key already exists for this locale and namespace.']);
            }
        }

        $translation->update($validated);

        return redirect()->route('admin.translations.index', [
            'locale' => $validated['locale'],
            'namespace' => $validated['namespace'],
        ])->with('success', 'Translation updated successfully.');
    }

    /**
     * Remove the specified translation.
     */
    public function destroy(Translation $translation)
    {
        $translation->delete();

        return redirect()->route('admin.translations.index', [
            'locale' => $translation->locale,
            'namespace' => $translation->namespace,
        ])->with('success', 'Translation deleted successfully.');
    }

    /**
     * Bulk import translations from JSON structure.
     */
    public function bulkImport(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:ko,en'],
            'namespace' => ['required', 'string'],
            'translations' => ['required', 'array'],
        ]);

        $imported = 0;
        foreach ($validated['translations'] as $key => $value) {
            if (is_array($value)) {
                // Handle nested structure
                $this->importNested($validated['locale'], $validated['namespace'], $key, $value);
                $imported++;
            } else {
                Translation::updateOrCreate(
                    [
                        'locale' => $validated['locale'],
                        'namespace' => $validated['namespace'],
                        'key' => $key,
                    ],
                    [
                        'value' => $value,
                        'is_active' => true,
                    ]
                );
                $imported++;
            }
        }

        return redirect()->route('admin.translations.index', [
            'locale' => $validated['locale'],
            'namespace' => $validated['namespace'],
        ])->with('success', "{$imported} translations imported successfully.");
    }

    /**
     * Import nested translation structure.
     */
    private function importNested(string $locale, string $namespace, string $prefix, array $data): void
    {
        foreach ($data as $key => $value) {
            $fullKey = $prefix . '.' . $key;
            if (is_array($value)) {
                $this->importNested($locale, $namespace, $fullKey, $value);
            } else {
                Translation::updateOrCreate(
                    [
                        'locale' => $locale,
                        'namespace' => $namespace,
                        'key' => $fullKey,
                    ],
                    [
                        'value' => $value,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
