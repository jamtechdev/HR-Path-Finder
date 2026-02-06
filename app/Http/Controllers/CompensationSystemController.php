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

        // Check if step is unlocked
        $hrProject->initializeStepStatuses();
        if (!$hrProject->isStepUnlocked('compensation')) {
            return redirect()->route('dashboard.hr-manager')
                ->withErrors(['step_locked' => 'Step 4 (Compensation System) is locked. Please complete and submit Step 3 (Performance System) first, then wait for CEO verification.']);
        }

        $hrProject->load(['compensationSystem', 'performanceSystem']);

        // Set step to in_progress if not started
        if ($hrProject->getStepStatus('compensation') === 'not_started') {
            $hrProject->setStepStatus('compensation', 'in_progress');
        }

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

            // Set compensation step status to submitted
            $hrProject->initializeStepStatuses();
            $hrProject->setStepStatus('compensation', 'submitted');
            
            // Check if all steps are submitted
            $stepStatuses = [
                'diagnosis' => $hrProject->getStepStatus('diagnosis'),
                'organization' => $hrProject->getStepStatus('organization'),
                'performance' => $hrProject->getStepStatus('performance'),
                'compensation' => 'submitted', // Just set
            ];
            
            $allStepsSubmitted = collect($stepStatuses)->every(fn($status) => 
                in_array($status, ['submitted', 'completed'])
            );
            
            $hrProject->update([
                'current_step' => 'complete',
                'status' => $allStepsSubmitted ? 'pending_consultant_review' : 'submitted',
            ]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'compensation_system_submitted',
                'step' => 'compensation',
            ]);
        });

        // Send email notification to CEO only if CEO exists
        $ceo = $hrProject->getCeoUser();
        if ($ceo) {
            try {
                $ceo->notify(new \App\Notifications\StepSubmittedNotification($hrProject, 'compensation'));
            } catch (\Exception $e) {
                \Log::error('Failed to send CEO notification: ' . $e->getMessage());
            }
        }

        return redirect()->route('dashboard.hr-manager')->with('success', 'Compensation System – Step 4 has been submitted successfully! An email notification has been sent to the CEO for verification. All steps are now complete.');
    }
}
