<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EvaluationModelGuidance;
use App\Models\JobKeyword;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationModelGuidanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $guidances = EvaluationModelGuidance::orderBy('model_type')->orderBy('version', 'desc')->get();

        return Inertia::render('Admin/PerformanceSystem/EvaluationModelGuidance/Index', [
            'guidances' => $guidances,
            'modelTypes' => [
                'mbo' => 'MBO',
                'bsc' => 'BSC',
                'okr' => 'OKR',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $jobKeywords = JobKeyword::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/PerformanceSystem/EvaluationModelGuidance/Create', [
            'modelTypes' => [
                'mbo' => 'MBO',
                'bsc' => 'BSC',
                'okr' => 'OKR',
            ],
            'jobKeywords' => $jobKeywords,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'model_type' => ['required', 'string', 'in:mbo,bsc,okr'],
            'concept' => ['required', 'string'],
            'key_characteristics' => ['required', 'string'],
            'example' => ['required', 'string'],
            'pros' => ['nullable', 'string'],
            'cons' => ['nullable', 'string'],
            'best_fit_organizations' => ['nullable', 'string'],
            'recommended_job_keyword_ids' => ['nullable', 'array'],
            'recommended_job_keyword_ids.*' => ['exists:job_keywords,id'],
            'version' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        EvaluationModelGuidance::create($validated);

        return redirect()->route('admin.evaluation-model-guidance.index')
            ->with('success', 'Evaluation model guidance created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EvaluationModelGuidance $evaluationModelGuidance): Response
    {
        $jobKeywords = JobKeyword::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/PerformanceSystem/EvaluationModelGuidance/Edit', [
            'guidance' => $evaluationModelGuidance,
            'modelTypes' => [
                'mbo' => 'MBO',
                'bsc' => 'BSC',
                'okr' => 'OKR',
            ],
            'jobKeywords' => $jobKeywords,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EvaluationModelGuidance $evaluationModelGuidance)
    {
        $validated = $request->validate([
            'model_type' => ['required', 'string', 'in:mbo,bsc,okr'],
            'concept' => ['required', 'string'],
            'key_characteristics' => ['required', 'string'],
            'example' => ['required', 'string'],
            'pros' => ['nullable', 'string'],
            'cons' => ['nullable', 'string'],
            'best_fit_organizations' => ['nullable', 'string'],
            'recommended_job_keyword_ids' => ['nullable', 'array'],
            'recommended_job_keyword_ids.*' => ['exists:job_keywords,id'],
            'version' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $evaluationModelGuidance->update($validated);

        return redirect()->route('admin.evaluation-model-guidance.index')
            ->with('success', 'Evaluation model guidance updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EvaluationModelGuidance $evaluationModelGuidance)
    {
        $evaluationModelGuidance->delete();

        return redirect()->route('admin.evaluation-model-guidance.index')
            ->with('success', 'Evaluation model guidance deleted successfully.');
    }
}
