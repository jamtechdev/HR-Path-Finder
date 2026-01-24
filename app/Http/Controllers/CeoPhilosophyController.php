<?php

namespace App\Http\Controllers;

use App\Models\CeoPhilosophy;
use App\Models\HrProject;
use App\Models\HrProjectAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CeoPhilosophyController extends Controller
{
    public function show(HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);

        // Only CEO can access
        if (!Auth::user()->hasRole('ceo')) {
            abort(403);
        }

        $hrProject->load(['ceoPhilosophy', 'company', 'companyAttributes', 'organizationalSentiment']);

        return Inertia::render('hr-projects/diagnosis/ceo-philosophy', [
            'project' => $hrProject,
        ]);
    }

    public function update(Request $request, HrProject $hrProject)
    {
        $this->authorize('view', $hrProject->company);

        if (!Auth::user()->hasRole('ceo')) {
            abort(403);
        }

        $validated = $request->validate([
            'responses' => 'required|array',
            'main_trait' => 'required|string',
            'sub_trait' => 'nullable|string',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            $philosophy = $hrProject->ceoPhilosophy()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                [
                    'user_id' => Auth::id(),
                    'responses' => $validated['responses'],
                    'main_trait' => $validated['main_trait'],
                    'sub_trait' => $validated['sub_trait'] ?? null,
                ]
            );

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'ceo_philosophy_updated',
                'step' => 'ceo_philosophy',
                'new_data' => $validated,
            ]);
        });

        return redirect()->back();
    }

    public function submit(Request $request, HrProject $hrProject)
    {
        $this->authorize('view', $hrProject->company);

        if (!Auth::user()->hasRole('ceo')) {
            abort(403);
        }

        $philosophy = $hrProject->ceoPhilosophy;
        if (!$philosophy) {
            return redirect()->back()->withErrors(['message' => 'Please complete the philosophy survey first.']);
        }

        DB::transaction(function () use ($philosophy, $hrProject) {
            $philosophy->update(['completed_at' => now()]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'ceo_philosophy_submitted',
                'step' => 'ceo_philosophy',
            ]);

            $hrProject->moveToNextStep('organization');
        });

        return redirect()->route('hr-projects.organization-design.show', $hrProject->id);
    }
}
