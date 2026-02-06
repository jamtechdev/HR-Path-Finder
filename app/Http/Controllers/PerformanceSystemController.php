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

        // Check if step is unlocked
        $hrProject->initializeStepStatuses();
        if (!$hrProject->isStepUnlocked('performance')) {
            return redirect()->route('dashboard.hr-manager')
                ->withErrors(['step_locked' => 'Step 3 (Performance System) is locked. Please complete and submit Step 2 (Organization Design) first, then wait for CEO verification.']);
        }

        $hrProject->load(['performanceSystem', 'organizationDesign', 'ceoPhilosophy']);

        // Set step to in_progress if not started
        if ($hrProject->getStepStatus('performance') === 'not_started') {
            $hrProject->setStepStatus('performance', 'in_progress');
        }

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

            // Set performance step status to submitted
            $hrProject->initializeStepStatuses();
            $hrProject->setStepStatus('performance', 'submitted');
            
            $hrProject->update([
                'current_step' => 'compensation',
            ]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'performance_system_submitted',
                'step' => 'performance',
            ]);
        });

        // Send email notification to CEO only if CEO exists
        $ceo = $hrProject->getCeoUser();
        if ($ceo) {
            try {
                $ceo->notify(new \App\Notifications\StepSubmittedNotification($hrProject, 'performance'));
            } catch (\Exception $e) {
                \Log::error('Failed to send CEO notification: ' . $e->getMessage());
            }
        }

        return redirect()->route('dashboard.hr-manager')->with('success', 'Performance System – Step 3 has been submitted successfully! An email notification has been sent to the CEO for verification. Step 4 will unlock automatically once the CEO verifies your submission.');
    }
}
