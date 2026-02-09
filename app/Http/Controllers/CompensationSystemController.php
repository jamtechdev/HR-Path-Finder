<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\HrProject;
use App\Models\CompensationSystem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompensationSystemController extends Controller
{
    /**
     * Show compensation system step.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('compensation')) {
            return back()->withErrors(['error' => 'Compensation System step is not yet unlocked.']);
        }

        $hrProject->load(['diagnosis', 'organizationDesign', 'performanceSystem', 'compensationSystem']);
        $compensationSystem = $hrProject->compensationSystem;

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
            'overview' => 'CompensationSystem/Overview',
            'compensation-structure' => 'CompensationSystem/CompensationStructure',
            'differentiation' => 'CompensationSystem/Differentiation',
            'incentives' => 'CompensationSystem/Incentives',
        ];

        $component = $componentMap[$tab] ?? 'CompensationSystem/Overview';

        return Inertia::render($component, [
            'project' => $hrProject,
            'compensationSystem' => $compensationSystem,
            'stepStatuses' => $mainStepStatuses,
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
        ]);
    }

    /**
     * Store compensation system data.
     */
    public function store(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'compensation_structure' => ['nullable', 'array'],
            'differentiation_methods' => ['nullable', 'array'],
            'incentive_components' => ['nullable', 'array'],
        ]);

        $compensationSystem = CompensationSystem::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            array_merge($validated, ['status' => StepStatus::IN_PROGRESS])
        );

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        return back()->with('success', 'Compensation system data saved successfully.');
    }

    /**
     * Submit compensation system.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $compensationSystem = $hrProject->compensationSystem;
        
        if (!$compensationSystem) {
            return back()->withErrors(['error' => 'Please complete the compensation system first.']);
        }

        $hrProject->setStepStatus('compensation', StepStatus::SUBMITTED);

        return back()->with('success', 'Compensation system submitted successfully.');
    }
}
