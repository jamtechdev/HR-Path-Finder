<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use Illuminate\Http\Request;

class HrSystemOverviewController extends Controller
{
    /**
     * Show HR System overview dashboard.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        // Check authorization
        $company = $hrProject->company;
        if (!$company->users->contains($request->user()) && !$request->user()->hasRole('admin')) {
            abort(403);
        }

        $hrProject->load([
            'diagnosis',
            'ceoPhilosophy',
            'companyAttributes',
            'organizationalSentiment',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'adminComments',
            'company',
        ]);

        // Build comprehensive HR system object
        $hrSystem = [
            'project' => $hrProject,
            'company' => $hrProject->company,
            'management_philosophy' => [
                'main_trait' => $hrProject->ceoPhilosophy?->main_trait,
                'secondary_trait' => $hrProject->ceoPhilosophy?->secondary_trait,
            ],
            'organization_structure' => [
                'structure_type' => $hrProject->organizationDesign?->structure_type,
                'job_grade_structure' => $hrProject->organizationDesign?->job_grade_structure,
            ],
            'performance_system' => [
                'evaluation_unit' => $hrProject->performanceSystem?->evaluation_unit,
                'performance_method' => $hrProject->performanceSystem?->performance_method,
                'evaluation_logic' => $hrProject->performanceSystem?->evaluation_logic,
            ],
            'compensation_system' => [
                'compensation_structure' => $hrProject->compensationSystem?->compensation_structure,
                'incentive_types' => $hrProject->compensationSystem?->incentive_types,
            ],
            'is_locked' => $hrProject->isFullyLocked(),
            'step_statuses' => $hrProject->step_statuses,
        ];

        return \Inertia\Inertia::render('HRSystem/Overview', [
            'hrSystem' => $hrSystem,
        ]);
    }
}
