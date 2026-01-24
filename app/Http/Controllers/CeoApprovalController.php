<?php

namespace App\Http\Controllers;

use App\Models\CeoApproval;
use App\Models\HrProject;
use App\Models\HrProjectAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CeoApprovalController extends Controller
{
    public function show(HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);

        if (!Auth::user()->hasRole('ceo')) {
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
            'ceoApprovals',
        ]);

        return Inertia::render('hr-projects/ceo-approval', [
            'project' => $hrProject,
        ]);
    }

    public function approve(Request $request, HrProject $hrProject)
    {
        $this->authorize('view', $hrProject->company);

        if (!Auth::user()->hasRole('ceo')) {
            abort(403);
        }

        $validated = $request->validate([
            'comments' => 'nullable|string',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            CeoApproval::create([
                'hr_project_id' => $hrProject->id,
                'ceo_id' => Auth::id(),
                'status' => 'approved',
                'comments' => $validated['comments'] ?? null,
                'approved_at' => now(),
            ]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'hr_system_approved',
                'step' => 'ceo_approval',
            ]);

            $hrProject->lock();
        });

        return redirect()->route('hr-projects.dashboard.show', $hrProject->id);
    }

    public function requestChanges(Request $request, HrProject $hrProject)
    {
        $this->authorize('view', $hrProject->company);

        if (!Auth::user()->hasRole('ceo')) {
            abort(403);
        }

        $validated = $request->validate([
            'comments' => 'required|string',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            CeoApproval::create([
                'hr_project_id' => $hrProject->id,
                'ceo_id' => Auth::id(),
                'status' => 'requested_changes',
                'comments' => $validated['comments'],
            ]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'changes_requested',
                'step' => 'ceo_approval',
            ]);

            // Reopen the step that needs changes (simplified - could be more sophisticated)
            $hrProject->update(['status' => 'in_progress']);
        });

        return redirect()->back()->with('message', 'Changes requested. The HR Manager will be notified.');
    }
}
