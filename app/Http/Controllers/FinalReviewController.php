<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Notifications\SystemLockedNotification;
use App\Services\StepTransitionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class FinalReviewController extends Controller
{
    public function __construct(
        protected StepTransitionService $stepTransitionService
    ) {
    }

    /**
     * Show final review page.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $hrProject->load([
            'diagnosis',
            'ceoPhilosophy',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'adminComments',
            'company',
        ]);

        return \Inertia\Inertia::render('CEO/FinalReview/Index', [
            'project' => $hrProject,
            'adminComments' => $hrProject->adminComments,
        ]);
    }

    /**
     * Approve and lock the entire HR system.
     */
    public function approve(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if all steps are submitted
        $steps = ['diagnosis', 'organization', 'performance', 'compensation'];
        foreach ($steps as $step) {
            $status = $hrProject->getStepStatus($step);
            if (!$status || !in_array($status, [
                \App\Enums\StepStatus::SUBMITTED, 
                \App\Enums\StepStatus::APPROVED, 
                \App\Enums\StepStatus::LOCKED
            ])) {
                return back()->withErrors(['error' => 'All steps must be submitted before final approval.']);
            }
        }

        // Lock all steps
        $this->stepTransitionService->lockAllSteps($hrProject);

        // Notify all stakeholders
        $users = $hrProject->company->users;
        foreach ($users as $user) {
            Notification::send($user, new SystemLockedNotification($hrProject));
        }

        return redirect()->route('hr-system.overview', $hrProject)
            ->with('success', 'HR System approved and locked successfully.');
    }

    /**
     * Request revision for a specific step.
     */
    public function requestRevision(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        $request->validate([
            'step' => ['required', 'in:diagnosis,organization,performance,compensation'],
        ]);

        $step = $request->step;
        $hrProject->setStepStatus($step, \App\Enums\StepStatus::IN_PROGRESS);

        return back()->with('success', "Step {$step} reopened for revision.");
    }
}
