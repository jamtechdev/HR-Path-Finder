<?php

namespace App\Http\Controllers;

use App\Models\CompanyAttribute;
use App\Models\HrProject;
use App\Models\HrProjectAudit;
use App\Models\OrganizationalSentiment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DiagnosisController extends Controller
{
    public function show(HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);

        $hrProject->load(['companyAttributes', 'organizationalSentiment']);

        return Inertia::render('hr-projects/diagnosis/company-attributes', [
            'project' => $hrProject,
        ]);
    }

    public function storeCompanyAttributes(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'job_standardization_level' => 'required|integer|min:1|max:5',
            'performance_measurability' => 'required|integer|min:1|max:5',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            $attributes = $hrProject->companyAttributes()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $validated
            );

            // Audit trail
            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'company_attributes_updated',
                'step' => 'diagnosis',
                'new_data' => $validated,
            ]);
        });

        return redirect()->back();
    }

    public function storeOrganizationalSentiment(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'openness_to_change' => 'required|integer|min:1|max:5',
            'trust_level' => 'required|integer|min:1|max:5',
            'evaluation_acceptance' => 'required|integer|min:1|max:5',
            'reward_sensitivity' => 'required|integer|min:1|max:5',
            'conflict_perception' => 'required|integer|min:1|max:5',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            $sentiment = $hrProject->organizationalSentiment()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $validated
            );

            // Audit trail
            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'organizational_sentiment_updated',
                'step' => 'diagnosis',
                'new_data' => $validated,
            ]);

            // Move to next step if both parts are complete
            if ($hrProject->companyAttributes && $sentiment) {
                $hrProject->moveToNextStep('ceo_philosophy');
            }
        });

        return redirect()->route('hr-projects.ceo-philosophy.show', $hrProject->id);
    }
}
