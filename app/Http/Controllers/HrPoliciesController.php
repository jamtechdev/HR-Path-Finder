<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HrPoliciesController extends Controller
{
    public function show(HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);

        $hrProject->load([
            'company',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
        ]);

        // Aggregate policies data
        $policiesData = [
            'project' => [
                'id' => $hrProject->id,
                'status' => $hrProject->status,
            ],
            'company' => $hrProject->company,
            'organization_design' => $hrProject->organizationDesign,
            'performance_system' => $hrProject->performanceSystem,
            'compensation_system' => $hrProject->compensationSystem,
        ];

        return Inertia::render('HrSystemOutput/Policies', $policiesData);
    }
}
