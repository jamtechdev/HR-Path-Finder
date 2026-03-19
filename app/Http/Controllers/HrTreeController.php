<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\HrPolicyOs;
use App\Models\HrProject;
use App\Services\ReportDataService;
use App\Services\StepTransitionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrTreeController extends Controller
{
    public function __construct(
        protected ReportDataService $reportDataService,
        protected StepTransitionService $stepTransitionService
    ) {
    }

    /**
     * Final Dashboard (Design Progress board) for HR Manager.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        $user = $request->user();

        if (! $user->hasRole('hr_manager')) {
            abort(403);
        }

        $data = $this->reportDataService->getComprehensiveProjectData($hrProject);

        return Inertia::render('HRManager/Tree/Index', [
            'project' => $data['project'],
            'stepStatuses' => $data['stepStatuses'],
            'stageProgressPercent' => $data['stageProgressPercent'],
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
            'jobDefinitions' => $data['jobDefinitions'],
            'hrSystemSnapshot' => $data['hrSystemSnapshot'],
        ]);
    }

    /**
     * Submit Final Dashboard (Step 5) for CEO review — replaces former HR Policy OS form submit.
     */
    public function submitFinal(Request $request, HrProject $hrProject)
    {
        if (! $request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        if (! $hrProject->isStepUnlocked('hr_policy_os')) {
            return back()->withErrors(['error' => 'Final Dashboard is not yet unlocked.']);
        }

        HrPolicyOs::firstOrCreate(
            ['hr_project_id' => $hrProject->id],
            [
                'status' => StepStatus::IN_PROGRESS,
                'policy_manual' => [],
                'system_handbook' => [],
                'implementation_roadmap' => [],
                'analytics_blueprint' => [],
            ]
        );

        $this->stepTransitionService->submitStep($hrProject, 'hr_policy_os');

        return redirect()->route('hr-manager.dashboard')
            ->with('success', 'Final Dashboard submitted for CEO review.');
    }
}
