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
        $page = $this->stringInput($request, 'page', 'all');
        $search = $this->stringInput($request, 'search', '');
        $role = $this->normalizeRole($this->stringInput($request, 'role', 'all'));
        $searchMode = $this->normalizeSearchMode($this->stringInput($request, 'searchMode', 'contains'));
        $status = $this->normalizeStatus($this->stringInput($request, 'status', 'all'));

        $enTranslations = $this->translationService->getFlatTranslations('en', $page);
        $koTranslations = $this->translationService->getFlatTranslations('ko', $page);

        $keys = array_unique(array_merge(array_keys($enTranslations), array_keys($koTranslations)));
        sort($keys);
        $stats = $this->buildStats($keys, $enTranslations, $koTranslations, $role);

        $translations = [];
        foreach ($keys as $key) {
            $enValue = (string) ($enTranslations[$key] ?? '');
            $koValue = (string) ($koTranslations[$key] ?? '');

            if (!$this->matchesRole($key, $role)) {
                continue;
            }

            if (!$this->matchesStatus($status, $enValue, $koValue)) {
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
            'currentStatus' => $status,
            'roles' => [
                'all' => 'All Roles',
                'admin' => 'Admin',
                'hr' => 'HR',
                'ceo' => 'CEO',
                'common' => 'Common/Shared',
            ],
            'statuses' => [
                'all' => 'All Statuses',
                'missing_any' => 'Missing EN or KO',
                'missing_en' => 'Missing English',
                'missing_ko' => 'Missing Korean',
                'same_text' => 'Same EN and KO text',
            ],
            'stats' => $stats,
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
     * Export current translation scope as CSV (key,en,ko).
     */
    public function export(Request $request)
    {
        $page = $this->stringInput($request, 'page', 'all');
        $search = $this->stringInput($request, 'search', '');
        $role = $this->normalizeRole($this->stringInput($request, 'role', 'all'));
        $searchMode = $this->normalizeSearchMode($this->stringInput($request, 'searchMode', 'contains'));
        $status = $this->normalizeStatus($this->stringInput($request, 'status', 'all'));

        $rows = $this->collectFilteredRows($page, $search, $role, $searchMode, $status);
        $filename = sprintf('translations-%s-%s.csv', $page, now()->format('Ymd-His'));

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fputcsv($handle, ['key', 'en', 'ko']);
            foreach ($rows as $row) {
                fputcsv($handle, [$row['key'], $row['en'], $row['ko']]);
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Import CSV and upsert translation keys for EN/KO.
     */
    public function import(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        $file = $validated['file'];
        $handle = fopen($file->getRealPath(), 'r');
        if ($handle === false) {
            return back()->withErrors(['error' => 'Unable to open the uploaded CSV file.']);
        }

        $enTranslations = $this->translationService->getTranslations('en');
        $koTranslations = $this->translationService->getTranslations('ko');

        $header = fgetcsv($handle);
        if ($header === false) {
            fclose($handle);
            return back()->withErrors(['error' => 'CSV file is empty.']);
        }

        $normalized = array_map(function ($v) {
            $cell = mb_strtolower(trim((string) $v));
            return $this->stripUtf8Bom($cell);
        }, $header);
        $expected = ['key', 'en', 'ko'];
        if ($normalized !== $expected) {
            fclose($handle);
            return back()->withErrors(['error' => 'CSV header must be: key,en,ko']);
        }

        $updated = 0;
        while (($row = fgetcsv($handle)) !== false) {
            $key = trim((string) ($row[0] ?? ''));
            if ($key === '') {
                continue;
            }

            $enValue = (string) ($row[1] ?? '');
            $koValue = (string) ($row[2] ?? '');
            $this->setNestedValue($enTranslations, $key, $enValue);
            $this->setNestedValue($koTranslations, $key, $koValue);
            $updated++;
        }
        fclose($handle);

        $savedEn = $this->translationService->saveTranslations('en', $enTranslations);
        $savedKo = $this->translationService->saveTranslations('ko', $koTranslations);

        if (!$savedEn || !$savedKo) {
            return back()->withErrors(['error' => 'Failed to save imported translations.']);
        }

        return back()->with('success', "Imported {$updated} translation rows successfully.");
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
     * Safely read request input as string with fallback.
     */
    protected function stringInput(Request $request, string $key, string $default = ''): string
    {
        $value = $request->input($key, $default);

        return is_string($value) ? $value : $default;
    }

    protected function normalizeRole(string $role): string
    {
        $allowed = ['all', 'admin', 'ceo', 'hr', 'common'];
        return in_array($role, $allowed, true) ? $role : 'all';
    }

    protected function normalizeSearchMode(string $searchMode): string
    {
        $allowed = ['contains', 'exact'];
        return in_array($searchMode, $allowed, true) ? $searchMode : 'contains';
    }

    protected function normalizeStatus(string $status): string
    {
        $allowed = ['all', 'missing_any', 'missing_en', 'missing_ko', 'same_text'];
        return in_array($status, $allowed, true) ? $status : 'all';
    }

    protected function stripUtf8Bom(string $value): string
    {
        return preg_replace('/^\xEF\xBB\xBF/u', '', $value) ?? $value;
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

    /**
     * Filter by translation completeness/quality status.
     */
    protected function matchesStatus(string $status, string $enValue, string $koValue): bool
    {
        $en = trim($enValue);
        $ko = trim($koValue);
        $missingEn = $en === '';
        $missingKo = $ko === '';
        $sameText = $en !== '' && $ko !== '' && mb_strtolower($en) === mb_strtolower($ko);

        return match ($status) {
            'missing_any' => $missingEn || $missingKo,
            'missing_en' => $missingEn,
            'missing_ko' => $missingKo,
            'same_text' => $sameText,
            default => true,
        };
    }

    /**
     * Build QA stats for current page + role scope.
     */
    protected function buildStats(array $keys, array $enTranslations, array $koTranslations, string $role): array
    {
        $total = 0;
        $missingAny = 0;
        $missingEn = 0;
        $missingKo = 0;
        $sameText = 0;
        $complete = 0;

        foreach ($keys as $key) {
            if (!$this->matchesRole($key, $role)) {
                continue;
            }

            $enValue = (string) ($enTranslations[$key] ?? '');
            $koValue = (string) ($koTranslations[$key] ?? '');
            $en = trim($enValue);
            $ko = trim($koValue);
            $isMissingEn = $en === '';
            $isMissingKo = $ko === '';
            $isSameText = !$isMissingEn && !$isMissingKo && mb_strtolower($en) === mb_strtolower($ko);

            $total++;
            if ($isMissingEn) {
                $missingEn++;
            }
            if ($isMissingKo) {
                $missingKo++;
            }
            if ($isMissingEn || $isMissingKo) {
                $missingAny++;
            } else {
                $complete++;
            }
            if ($isSameText) {
                $sameText++;
            }
        }

        return [
            'total' => $total,
            'complete' => $complete,
            'missing_any' => $missingAny,
            'missing_en' => $missingEn,
            'missing_ko' => $missingKo,
            'same_text' => $sameText,
        ];
    }

    /**
     * Collect filtered rows by the same criteria used in index().
     *
     * @return array<int, array{key:string,en:string,ko:string}>
     */
    protected function collectFilteredRows(
        string $page,
        string $search,
        string $role,
        string $searchMode,
        string $status,
    ): array {
        $enTranslations = $this->translationService->getFlatTranslations('en', $page);
        $koTranslations = $this->translationService->getFlatTranslations('ko', $page);
        $keys = array_unique(array_merge(array_keys($enTranslations), array_keys($koTranslations)));
        sort($keys);

        $rows = [];
        foreach ($keys as $key) {
            $enValue = (string) ($enTranslations[$key] ?? '');
            $koValue = (string) ($koTranslations[$key] ?? '');

            if (!$this->matchesRole($key, $role)) {
                continue;
            }
            if (!$this->matchesStatus($status, $enValue, $koValue)) {
                continue;
            }
            if ($search !== '' && !$this->matchesSearch($searchMode, $search, $key, $enValue, $koValue)) {
                continue;
            }

            $rows[] = [
                'key' => $key,
                'en' => $enValue,
                'ko' => $koValue,
            ];
        }

        return $rows;
    }
}
