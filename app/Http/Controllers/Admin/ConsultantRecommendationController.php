<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminComment;
use App\Models\HrProject;
use App\Models\JobDefinition;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsultantRecommendationController extends Controller
{
    public function __construct(
        protected RecommendationService $recommendationService
    ) {
    }

    /**
     * Show performance recommendation preparation form (Step 3.5).
     */
    public function showPerformanceRecommendation(Request $request, HrProject $hrProject): Response
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403);
        }

        // Check if Step 3 is confirmed
        $stepStatuses = $hrProject->step_statuses ?? [];
        $jobAnalysisStatus = $stepStatuses['job_analysis'] ?? 'not_started';
        
        if (!in_array($jobAnalysisStatus, ['submitted', 'approved', 'locked'])) {
            return redirect()->route('admin.dashboard')
                ->withErrors(['error' => 'Job Analysis (Step 3) must be confirmed before preparing recommendations.']);
        }

        // Load project data
        $hrProject->load([
            'company',
            'diagnosis',
            'ceoPhilosophy',
            'companyAttributes',
            'organizationDesign',
        ]);

        // Load job definitions with CSFs
        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->get();

        // Get existing recommendation if any
        $existingRecommendation = AdminComment::where('hr_project_id', $hrProject->id)
            ->where('is_recommendation', true)
            ->where('recommendation_type', 'performance')
            ->first();

        // Get algorithm-based recommendations as reference
        $algorithmRecommendations = $this->recommendationService->getRecommendedPerformanceMethod($hrProject);

        return Inertia::render('Admin/Recommendations/PerformanceRecommendation', [
            'project' => $hrProject,
            'jobDefinitions' => $jobDefinitions,
            'existingRecommendation' => $existingRecommendation,
            'algorithmRecommendations' => $algorithmRecommendations,
        ]);
    }

    /**
     * Store performance recommendation.
     */
    public function storePerformanceRecommendation(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'recommended_option' => ['required', 'in:kpi,mbo,okr,bsc'],
            'rationale' => ['required', 'string', 'max:5000'],
        ]);

        // Delete existing recommendation if any
        AdminComment::where('hr_project_id', $hrProject->id)
            ->where('is_recommendation', true)
            ->where('recommendation_type', 'performance')
            ->delete();

        // Create new recommendation
        AdminComment::create([
            'hr_project_id' => $hrProject->id,
            'user_id' => $request->user()->id,
            'step' => 'performance',
            'recommendation_type' => 'performance',
            'recommended_option' => $validated['recommended_option'],
            'rationale' => $validated['rationale'],
            'is_recommendation' => true,
            'comment' => 'Performance Management Recommendation', // For backward compatibility
        ]);

        return redirect()->route('admin.recommendations.performance', $hrProject)
            ->with('success', 'Performance recommendation saved successfully.');
    }

    /**
     * Show compensation recommendation preparation form (Step 4.5).
     */
    public function showCompensationRecommendation(Request $request, HrProject $hrProject): Response
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403);
        }

        // Check if Step 4 is completed
        $stepStatuses = $hrProject->step_statuses ?? [];
        $performanceStatus = $stepStatuses['performance'] ?? 'not_started';
        
        if (!in_array($performanceStatus, ['submitted', 'approved', 'locked'])) {
            return redirect()->route('admin.dashboard')
                ->withErrors(['error' => 'Performance System (Step 4) must be completed before preparing compensation recommendations.']);
        }

        // Load project data
        $hrProject->load([
            'company',
            'diagnosis',
            'ceoPhilosophy',
            'companyAttributes',
            'organizationDesign',
            'performanceSystem',
            'organizationalSentiment',
        ]);

        // Get existing recommendation if any
        $existingRecommendation = AdminComment::where('hr_project_id', $hrProject->id)
            ->where('is_recommendation', true)
            ->where('recommendation_type', 'compensation')
            ->first();

        // Get algorithm-based recommendations as reference
        $algorithmRecommendations = $this->recommendationService->getRecommendedCompensationStructure($hrProject);

        return Inertia::render('Admin/Recommendations/CompensationRecommendation', [
            'project' => $hrProject,
            'existingRecommendation' => $existingRecommendation,
            'algorithmRecommendations' => $algorithmRecommendations,
        ]);
    }

    /**
     * Store compensation recommendation.
     */
    public function storeCompensationRecommendation(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'recommended_option' => ['required', 'in:fixed,mixed,performance_based'],
            'rationale' => ['required', 'string', 'max:5000'],
        ]);

        // Delete existing recommendation if any
        AdminComment::where('hr_project_id', $hrProject->id)
            ->where('is_recommendation', true)
            ->where('recommendation_type', 'compensation')
            ->delete();

        // Create new recommendation
        AdminComment::create([
            'hr_project_id' => $hrProject->id,
            'user_id' => $request->user()->id,
            'step' => 'compensation',
            'recommendation_type' => 'compensation',
            'recommended_option' => $validated['recommended_option'],
            'rationale' => $validated['rationale'],
            'is_recommendation' => true,
            'comment' => 'Compensation & Benefits Recommendation', // For backward compatibility
        ]);

        return redirect()->route('admin.recommendations.compensation', $hrProject)
            ->with('success', 'Compensation recommendation saved successfully.');
    }
}
