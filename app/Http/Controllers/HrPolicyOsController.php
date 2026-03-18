<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\HrProject;
use App\Services\StepTransitionService;
use Illuminate\Http\Request;

/**
 * Step 5 (hr_policy_os) UI is the Final Board at /hr-manager/tree/{project}.
 * This controller only handles CEO final approval POST.
 */
class HrPolicyOsController extends Controller
{
    public function __construct(
        protected StepTransitionService $stepTransitionService
    ) {
    }

    /**
     * CEO approve final step (locks project).
     */
    public function approve(Request $request, HrProject $hrProject)
    {
        if (! $request->user()->hasRole('ceo')) {
            abort(403);
        }

        if (! $hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $currentStatus = $hrProject->getStepStatus('hr_policy_os');

        if (! $currentStatus || $currentStatus !== StepStatus::SUBMITTED) {
            return back()->withErrors(['error' => 'Final Dashboard must be submitted before approval.']);
        }

        $this->stepTransitionService->approveAndLockStep($hrProject, 'hr_policy_os');

        $hrProject->update(['status' => \App\Enums\ProjectStatus::LOCKED]);

        return redirect()->route('ceo.dashboard')
            ->with('success', 'Final Dashboard approved and system locked. The Pathfinder journey is complete!');
    }
}
