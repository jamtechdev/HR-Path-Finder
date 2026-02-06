<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\HrProjectAudit;
use App\Models\OrganizationDesign;
use App\Services\RecommendationService;
use App\Services\ValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationDesignController extends Controller
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
        if (!$hrProject->isStepUnlocked('organization')) {
            return redirect()->route('dashboard.hr-manager')
                ->withErrors(['step_locked' => 'Step 2 (Organization Design) is locked. Please complete and submit Step 1 (Diagnosis) first, then wait for CEO verification.']);
        }

        $hrProject->load(['organizationDesign', 'companyAttributes', 'ceoPhilosophy', 'company']);

        // Set step to in_progress if not started
        if ($hrProject->getStepStatus('organization') === 'not_started') {
            $hrProject->setStepStatus('organization', 'in_progress');
        }

        $recommendations = $this->recommendationService->getRecommendedOrganizationStructure(
            $hrProject->companyAttributes,
            $hrProject->ceoPhilosophy,
            $hrProject->organizationalSentiment,
            $hrProject->company
        );

        return Inertia::render('hr-projects/organization-design', [
            'project' => $hrProject,
            'recommendations' => $recommendations,
        ]);
    }

    public function update(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'structure_type' => 'required|in:functional,team,divisional,matrix',
            'job_grade_structure' => 'required|in:single,multi',
            'grade_title_relationship' => 'required|in:integrated,separated',
            'managerial_role_definition' => 'nullable|string',
        ]);

        $validation = $this->validationService->validateLogicalConsistency($hrProject, 'organization', $validated);
        if (!$validation['valid']) {
            return redirect()->back()->withErrors($validation['errors']);
        }

        DB::transaction(function () use ($hrProject, $validated) {
            $hrProject->organizationDesign()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $validated
            );

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'organization_design_updated',
                'step' => 'organization',
                'new_data' => $validated,
            ]);
        });

        return redirect()->back();
    }

    public function submit(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $design = $hrProject->organizationDesign;
        if (!$design) {
            return redirect()->back()->withErrors(['message' => 'Please complete the organization design first.']);
        }

        DB::transaction(function () use ($design, $hrProject) {
            $design->update(['submitted_at' => now()]);

            // Set organization step status to submitted
            $hrProject->initializeStepStatuses();
            $hrProject->setStepStatus('organization', 'submitted');
            
            $hrProject->update([
                'current_step' => 'performance',
            ]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'organization_design_submitted',
                'step' => 'organization',
            ]);
        });

        // Send email notification to CEO only if CEO exists
        $ceo = $hrProject->getCeoUser();
        if ($ceo) {
            try {
                $ceo->notify(new \App\Notifications\StepSubmittedNotification($hrProject, 'organization'));
            } catch (\Exception $e) {
                \Log::error('Failed to send CEO notification: ' . $e->getMessage());
            }
        }

        return redirect()->route('dashboard.hr-manager')->with('success', 'Organization Design – Step 2 has been submitted successfully! An email notification has been sent to the CEO for verification. Step 3 will unlock automatically once the CEO verifies your submission.');
    }

    public function getRecommendations(HrProject $hrProject)
    {
        $this->authorize('view', $hrProject->company);

        $recommendations = $this->recommendationService->getRecommendedOrganizationStructure(
            $hrProject->companyAttributes,
            $hrProject->ceoPhilosophy,
            $hrProject->organizationalSentiment,
            $hrProject->company
        );

        return response()->json($recommendations);
    }
}
