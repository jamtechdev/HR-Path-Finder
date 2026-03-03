<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobAnalysisIntro;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobAnalysisIntroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $intros = JobAnalysisIntro::orderBy('key')->orderBy('version', 'desc')->get();

        return Inertia::render('Admin/JobAnalysis/IntroTexts/Index', [
            'intros' => $intros,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/JobAnalysis/IntroTexts/Create', [
            'availableKeys' => [
                'hr_job_analysis_intro' => 'HR Job Analysis - Before You Begin',
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'version' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        // If creating a new version of existing key, deactivate old versions
        if ($validated['is_active'] ?? true) {
            JobAnalysisIntro::where('key', $validated['key'])
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['version'] = $validated['version'] ?? '1.0';

        JobAnalysisIntro::create($validated);

        return redirect()->route('admin.job-analysis.intro-texts.index')
            ->with('success', 'Intro text created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(JobAnalysisIntro $introText): Response
    {
        return Inertia::render('Admin/JobAnalysis/IntroTexts/Show', [
            'intro' => $introText,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JobAnalysisIntro $introText): Response
    {
        return Inertia::render('Admin/JobAnalysis/IntroTexts/Edit', [
            'intro' => $introText,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JobAnalysisIntro $introText)
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'version' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        // If activating, deactivate other versions of same key
        if ($validated['is_active'] ?? $introText->is_active) {
            JobAnalysisIntro::where('key', $validated['key'])
                ->where('id', '!=', $introText->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $introText->update($validated);

        return redirect()->route('admin.job-analysis.intro-texts.index')
            ->with('success', 'Intro text updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobAnalysisIntro $introText)
    {
        $introText->delete();

        return redirect()->route('admin.job-analysis.intro-texts.index')
            ->with('success', 'Intro text deleted successfully.');
    }
}
