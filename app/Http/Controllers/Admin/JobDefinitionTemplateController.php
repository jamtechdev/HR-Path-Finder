<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobDefinitionTemplate;
use App\Models\JobKeyword;
use App\Models\IndustryCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobDefinitionTemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $industry = $request->get('industry');
        $sizeRange = $request->get('size_range');
        $jobKeywordId = $request->get('job_keyword_id');
        
        $query = JobDefinitionTemplate::with('jobKeyword');

        if ($industry) {
            $query->where('industry_category', $industry);
        }
        
        if ($sizeRange) {
            $query->where('company_size_range', $sizeRange);
        }
        
        if ($jobKeywordId) {
            $query->where('job_keyword_id', $jobKeywordId);
        }

        $templates = $query->orderBy('industry_category')->orderBy('company_size_range')->orderBy('id')->get();
        $jobKeywords = JobKeyword::where('is_active', true)->orderBy('name')->get();
        $industries = IndustryCategory::orderBy('name')->pluck('name', 'name');

        return Inertia::render('Admin/JobTemplates/Index', [
            'templates' => $templates,
            'jobKeywords' => $jobKeywords,
            'industries' => $industries,
            'sizeRanges' => ['small', 'medium', 'large', '1-50', '51-200', '201-500', '500+'],
            'currentIndustry' => $industry,
            'currentSizeRange' => $sizeRange,
            'currentJobKeywordId' => $jobKeywordId,
        ]);
    }

    public function create(): Response
    {
        $jobKeywords = JobKeyword::where('is_active', true)->orderBy('name')->get();
        $industries = IndustryCategory::orderBy('name')->pluck('name', 'name');

        return Inertia::render('Admin/JobTemplates/Create', [
            'jobKeywords' => $jobKeywords,
            'industries' => $industries,
            'sizeRanges' => ['small', 'medium', 'large', '1-50', '51-200', '201-500', '500+'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_keyword_id' => ['nullable', 'exists:job_keywords,id'],
            'industry_category' => ['nullable', 'string'],
            'company_size_range' => ['nullable', 'string'],
            'job_description' => ['nullable', 'string'],
            'job_specification' => ['nullable', 'array'],
            'competency_levels' => ['nullable', 'array'],
            'csfs' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        JobDefinitionTemplate::create($validated);

        return redirect()->route('admin.job-templates.index')
            ->with('success', 'Job template created successfully.');
    }

    public function edit(JobDefinitionTemplate $jobTemplate): Response
    {
        $jobTemplate->load('jobKeyword');
        $jobKeywords = JobKeyword::where('is_active', true)->orderBy('name')->get();
        $industries = IndustryCategory::orderBy('name')->pluck('name', 'name');

        return Inertia::render('Admin/JobTemplates/Edit', [
            'template' => $jobTemplate,
            'jobKeywords' => $jobKeywords,
            'industries' => $industries,
            'sizeRanges' => ['small', 'medium', 'large', '1-50', '51-200', '201-500', '500+'],
        ]);
    }

    public function update(Request $request, JobDefinitionTemplate $jobTemplate)
    {
        $validated = $request->validate([
            'job_keyword_id' => ['nullable', 'exists:job_keywords,id'],
            'industry_category' => ['nullable', 'string'],
            'company_size_range' => ['nullable', 'string'],
            'job_description' => ['nullable', 'string'],
            'job_specification' => ['nullable', 'array'],
            'competency_levels' => ['nullable', 'array'],
            'csfs' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $jobTemplate->update($validated);

        return redirect()->route('admin.job-templates.index')
            ->with('success', 'Job template updated successfully.');
    }

    public function destroy(JobDefinitionTemplate $jobTemplate)
    {
        $jobTemplate->delete();

        return redirect()->route('admin.job-templates.index')
            ->with('success', 'Job template deleted successfully.');
    }
}
