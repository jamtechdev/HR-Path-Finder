<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\HrProjectAudit;
use App\Services\RecommendationService;
use App\Services\ValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CompensationSystemController extends Controller
{
    public function __construct(
        protected RecommendationService $recommendationService,
        protected ValidationService $validationService
    ) {
    }

    public function show(HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);

        $hrProject->load(['compensationSystem', 'performanceSystem']);

        $recommendations = $this->recommendationService->getRecommendedCompensationStructure($hrProject);

        return Inertia::render('hr-projects/compensation-system', [
            'project' => $hrProject,
            'recommendations' => $recommendations,
        ]);
    }

    public function update(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'compensation_structure' => 'required|in:fixed,mixed,performance_based',
            'differentiation_method' => 'required|in:merit,incentive,role_based',
            'incentive_components' => 'nullable|array',
        ]);

        $validation = $this->validationService->validateLogicalConsistency($hrProject, 'compensation', $validated);
        if (!$validation['valid']) {
            return redirect()->back()->withErrors($validation['errors'])->with('warnings', $validation['warnings']);
        }

        DB::transaction(function () use ($hrProject, $validated) {
            $hrProject->compensationSystem()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $validated
            );

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'compensation_system_updated',
                'step' => 'compensation',
                'new_data' => $validated,
            ]);
        });

        return redirect()->back();
    }

    public function submit(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $system = $hrProject->compensationSystem;
        if (!$system) {
            return redirect()->back()->withErrors(['message' => 'Please complete the compensation system first.']);
        }

        DB::transaction(function () use ($system, $hrProject) {
            $system->update(['submitted_at' => now()]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'compensation_system_submitted',
                'step' => 'compensation',
            ]);

            $hrProject->moveToNextStep('consultant_review');
        });

        return redirect()->route('hr-projects.consultant-review.show', $hrProject->id);
    }
}
