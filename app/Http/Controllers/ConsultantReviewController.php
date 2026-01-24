<?php

namespace App\Http\Controllers;

use App\Models\ConsultantReview;
use App\Models\HrProject;
use App\Models\HrProjectAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConsultantReviewController extends Controller
{
    public function show(HrProject $hrProject): Response
    {
        // Only consultants can access
        if (!Auth::user()->hasRole('consultant')) {
            abort(403);
        }

        $hrProject->load([
            'companyAttributes',
            'organizationalSentiment',
            'ceoPhilosophy',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'consultantReviews',
        ]);

        return Inertia::render('hr-projects/consultant-review', [
            'project' => $hrProject,
        ]);
    }

    public function store(Request $request, HrProject $hrProject)
    {
        if (!Auth::user()->hasRole('consultant')) {
            abort(403);
        }

        $validated = $request->validate([
            'opinions' => 'required|string',
            'risk_notes' => 'nullable|string',
            'alignment_observations' => 'nullable|string',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            $review = ConsultantReview::create([
                'hr_project_id' => $hrProject->id,
                'consultant_id' => Auth::id(),
                'opinions' => $validated['opinions'],
                'risk_notes' => $validated['risk_notes'] ?? null,
                'alignment_observations' => $validated['alignment_observations'] ?? null,
                'reviewed_at' => now(),
            ]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'consultant_review_created',
                'step' => 'consultant_review',
                'new_data' => $validated,
            ]);

            $hrProject->moveToNextStep('ceo_approval');
        });

        return redirect()->route('hr-projects.ceo-approval.show', $hrProject->id);
    }
}
