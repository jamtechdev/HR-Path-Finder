<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobKeyword;
use App\Models\IndustryCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobKeywordController extends Controller
{
    public function index(Request $request): Response
    {
        $industry = $request->get('industry');
        $sizeRange = $request->get('size_range');
        
        $query = JobKeyword::query();

        if ($industry) {
            $query->where('industry_category', $industry);
        }
        
        if ($sizeRange) {
            $query->where('company_size_range', $sizeRange);
        }

        $keywords = $query->orderBy('order')->orderBy('id')->get();
        $industries = IndustryCategory::orderBy('name')->pluck('name', 'name');

        return Inertia::render('Admin/JobKeywords/Index', [
            'keywords' => $keywords,
            'industries' => $industries,
            'sizeRanges' => ['small', 'medium', 'large', '1-50', '51-200', '201-500', '500+'],
            'currentIndustry' => $industry,
            'currentSizeRange' => $sizeRange,
        ]);
    }

    public function create(): Response
    {
        $industries = IndustryCategory::orderBy('name')->pluck('name', 'name');

        return Inertia::render('Admin/JobKeywords/Create', [
            'industries' => $industries,
            'sizeRanges' => ['small', 'medium', 'large', '1-50', '51-200', '201-500', '500+'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'industry_category' => ['nullable', 'string'],
            'company_size_range' => ['nullable', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['order'] = $validated['order'] ?? JobKeyword::max('order') + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;

        JobKeyword::create($validated);

        return redirect()->route('admin.job-keywords.index')
            ->with('success', 'Job keyword created successfully.');
    }

    public function edit(JobKeyword $jobKeyword): Response
    {
        $industries = IndustryCategory::orderBy('name')->pluck('name', 'name');

        return Inertia::render('Admin/JobKeywords/Edit', [
            'keyword' => $jobKeyword,
            'industries' => $industries,
            'sizeRanges' => ['small', 'medium', 'large', '1-50', '51-200', '201-500', '500+'],
        ]);
    }

    public function update(Request $request, JobKeyword $jobKeyword)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'industry_category' => ['nullable', 'string'],
            'company_size_range' => ['nullable', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $jobKeyword->update($validated);

        return redirect()->route('admin.job-keywords.index')
            ->with('success', 'Job keyword updated successfully.');
    }

    public function destroy(JobKeyword $jobKeyword)
    {
        $jobKeyword->delete();

        return redirect()->route('admin.job-keywords.index')
            ->with('success', 'Job keyword deleted successfully.');
    }
}
