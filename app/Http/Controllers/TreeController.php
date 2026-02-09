<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\HrProject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TreeController extends Controller
{
    /**
     * Show TREE step.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('tree')) {
            return back()->withErrors(['error' => 'TREE step is not yet unlocked.']);
        }

        $hrProject->load(['diagnosis', 'organizationDesign', 'performanceSystem', 'compensationSystem']);
        
        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
            'tree' => $stepStatuses['tree'] ?? 'not_started',
            'conclusion' => $stepStatuses['conclusion'] ?? 'not_started',
        ];

        $componentMap = [
            'overview' => 'Tree/Overview',
            'talent-review' => 'Tree/TalentReview',
            'evaluation' => 'Tree/Evaluation',
            'enhancement' => 'Tree/Enhancement',
        ];

        $component = $componentMap[$tab] ?? 'Tree/Overview';

        return Inertia::render($component, [
            'project' => $hrProject,
            'stepStatuses' => $mainStepStatuses,
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
        ]);
    }

    /**
     * Store TREE data.
     */
    public function store(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'talent_review' => ['nullable', 'array'],
            'evaluation' => ['nullable', 'array'],
            'enhancement' => ['nullable', 'array'],
        ]);

        // Store TREE data (you may want to create a Tree model)
        $hrProject->setStepStatus('tree', StepStatus::IN_PROGRESS);

        return back()->with('success', 'TREE data saved successfully.');
    }

    /**
     * Submit TREE.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $hrProject->setStepStatus('tree', StepStatus::SUBMITTED);

        return back()->with('success', 'TREE submitted successfully.');
    }
}
