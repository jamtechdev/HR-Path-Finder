<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobEvaluationModelRecommendation;
use App\Models\JobKeyword;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobEvaluationModelRecommendationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $recommendations = JobEvaluationModelRecommendation::with('jobKeyword')
            ->orderBy('recommended_model')
            ->orderBy('job_keyword_id')
            ->get();

        $jobKeywords = JobKeyword::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/PerformanceSystem/JobModelRecommendation/Index', [
            'recommendations' => $recommendations,
            'jobKeywords' => $jobKeywords,
            'modelTypes' => [
                'mbo' => 'MBO',
                'bsc' => 'BSC',
                'okr' => 'OKR',
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_keyword_id' => ['required', 'exists:job_keywords,id', 'unique:job_evaluation_model_recommendations,job_keyword_id'],
            'recommended_model' => ['required', 'string', 'in:mbo,bsc,okr'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        JobEvaluationModelRecommendation::create($validated);

        return redirect()->route('admin.job-model-recommendation.index')
            ->with('success', 'Job evaluation model recommendation created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JobEvaluationModelRecommendation $jobEvaluationModelRecommendation)
    {
        $validated = $request->validate([
            'recommended_model' => ['required', 'string', 'in:mbo,bsc,okr'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $jobEvaluationModelRecommendation->update($validated);

        return redirect()->route('admin.job-model-recommendation.index')
            ->with('success', 'Job evaluation model recommendation updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobEvaluationModelRecommendation $jobEvaluationModelRecommendation)
    {
        $jobEvaluationModelRecommendation->delete();

        return redirect()->route('admin.job-model-recommendation.index')
            ->with('success', 'Job evaluation model recommendation deleted successfully.');
    }
}
