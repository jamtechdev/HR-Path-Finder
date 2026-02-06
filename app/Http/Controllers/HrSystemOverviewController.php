<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HrSystemOverviewController extends Controller
{
    public function show(HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);

        $hrProject->load([
            'company',
            'companyAttributes',
            'organizationalSentiment',
            'ceoPhilosophy',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'consultantReviews',
            'ceoApprovals',
        ]);

        // Initialize step statuses
        $hrProject->initializeStepStatuses();
        
        // Get step statuses and verified status
        $stepStatuses = [
            'diagnosis' => $hrProject->getStepStatus('diagnosis'),
            'organization' => $hrProject->getStepStatus('organization'),
            'performance' => $hrProject->getStepStatus('performance'),
            'compensation' => $hrProject->getStepStatus('compensation'),
        ];

        $verifiedSteps = [
            'diagnosis' => $hrProject->isStepVerified('diagnosis'),
            'organization' => $hrProject->isStepVerified('organization'),
            'performance' => $hrProject->isStepVerified('performance'),
            'compensation' => $hrProject->isStepVerified('compensation'),
        ];

        // Prepare project data
        $projectData = [
            'id' => $hrProject->id,
            'status' => $hrProject->status,
            'company' => $hrProject->company ? [
                'id' => $hrProject->company->id,
                'name' => $hrProject->company->name,
                'industry' => $hrProject->company->industry,
                'hq_location' => $hrProject->company->hq_location,
                'logo_path' => $hrProject->company->logo_path,
            ] : null,
            'ceo_philosophy' => $hrProject->ceoPhilosophy ? [
                'main_trait' => $hrProject->ceoPhilosophy->main_trait,
                'sub_trait' => $hrProject->ceoPhilosophy->sub_trait,
                'completed_at' => $hrProject->ceoPhilosophy->completed_at,
            ] : null,
            'organization_design' => $hrProject->organizationDesign ? [
                'structure_type' => $hrProject->organizationDesign->structure_type,
                'job_grade_structure' => $hrProject->organizationDesign->job_grade_structure,
                'grade_title_relationship' => $hrProject->organizationDesign->grade_title_relationship,
                'managerial_role_definition' => $hrProject->organizationDesign->managerial_role_definition,
            ] : null,
            'performance_system' => $hrProject->performanceSystem ? [
                'performance_method' => $hrProject->performanceSystem->performance_method,
                'performance_unit' => $hrProject->performanceSystem->performance_unit,
                'evaluation_structure_quantitative' => $hrProject->performanceSystem->evaluation_structure_quantitative,
                'evaluation_structure_relative' => $hrProject->performanceSystem->evaluation_structure_relative,
            ] : null,
            'compensation_system' => $hrProject->compensationSystem ? [
                'compensation_structure' => $hrProject->compensationSystem->compensation_structure,
                'differentiation_method' => $hrProject->compensationSystem->differentiation_method,
                'incentive_components' => $hrProject->compensationSystem->incentive_components,
            ] : null,
        ];

        return Inertia::render('hr-system-overview', [
            'project' => $projectData,
            'stepStatuses' => $stepStatuses,
            'verifiedSteps' => $verifiedSteps,
        ]);
    }
}
