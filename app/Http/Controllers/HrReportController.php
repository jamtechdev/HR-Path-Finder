<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HrReportController extends Controller
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
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
        ]);

        // Aggregate report data
        $reportData = [
            'project' => [
                'id' => $hrProject->id,
                'status' => $hrProject->status,
                'created_at' => $hrProject->created_at,
                'updated_at' => $hrProject->updated_at,
            ],
            'company' => $hrProject->company,
            'diagnosis' => [
                'company_attributes' => $hrProject->companyAttributes,
                'organizational_sentiment' => $hrProject->organizationalSentiment,
                'business_profile' => $hrProject->businessProfile,
                'workforce' => $hrProject->workforce,
                'current_hr_status' => $hrProject->currentHrStatus,
                'culture' => $hrProject->culture,
            ],
            'ceo_philosophy' => $hrProject->ceoPhilosophy,
            'organization_design' => $hrProject->organizationDesign,
            'performance_system' => $hrProject->performanceSystem,
            'compensation_system' => $hrProject->compensationSystem,
            'consultant_reviews' => $hrProject->consultantReviews,
            'ceo_approvals' => $hrProject->ceoApprovals,
        ];

        return Inertia::render('HrSystemOutput/Report', $reportData);
    }
}
