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

        $hrProject->load(['organizationDesign', 'companyAttributes', 'ceoPhilosophy', 'company']);

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

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'organization_design_submitted',
                'step' => 'organization',
            ]);

            $hrProject->moveToNextStep('performance');
        });

        return redirect()->route('hr-projects.performance-system.show', $hrProject->id);
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
