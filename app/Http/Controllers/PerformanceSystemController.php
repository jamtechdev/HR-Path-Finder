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

class PerformanceSystemController extends Controller
{
    public function __construct(
        protected RecommendationService $recommendationService,
        protected ValidationService $validationService
    ) {
    }

    public function show(HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);

        $hrProject->load(['performanceSystem', 'organizationDesign', 'ceoPhilosophy']);

        $recommendations = $this->recommendationService->getRecommendedPerformanceMethod($hrProject);

        return Inertia::render('hr-projects/performance-system', [
            'project' => $hrProject,
            'recommendations' => $recommendations,
        ]);
    }

    public function update(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'performance_unit' => 'required|in:individual,organization,hybrid',
            'performance_method' => 'required|in:kpi,mbo,okr,bsc',
            'evaluation_structure_quantitative' => 'required|in:quantitative,qualitative,hybrid',
            'evaluation_structure_relative' => 'required|in:relative,absolute',
        ]);

        $validation = $this->validationService->validateLogicalConsistency($hrProject, 'performance', $validated);
        if (!$validation['valid']) {
            return redirect()->back()->withErrors($validation['errors'])->with('warnings', $validation['warnings']);
        }

        DB::transaction(function () use ($hrProject, $validated) {
            $hrProject->performanceSystem()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $validated
            );

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'performance_system_updated',
                'step' => 'performance',
                'new_data' => $validated,
            ]);
        });

        return redirect()->back();
    }

    public function submit(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $system = $hrProject->performanceSystem;
        if (!$system) {
            return redirect()->back()->withErrors(['message' => 'Please complete the performance system first.']);
        }

        DB::transaction(function () use ($system, $hrProject) {
            $system->update(['submitted_at' => now()]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'performance_system_submitted',
                'step' => 'performance',
            ]);

            $hrProject->moveToNextStep('compensation');
        });

        return redirect()->route('hr-projects.compensation-system.show', $hrProject->id);
    }
}
