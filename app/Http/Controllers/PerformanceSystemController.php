<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\HrProject;
use App\Models\PerformanceSystem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerformanceSystemController extends Controller
{
    /**
     * Show performance system step.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('performance')) {
            return back()->withErrors(['error' => 'Performance System step is not yet unlocked.']);
        }

        $hrProject->load(['diagnosis', 'organizationDesign', 'performanceSystem', 'company']);
        $performanceSystem = $hrProject->performanceSystem;

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
            'overview' => 'PerformanceSystem/Overview',
            'evaluation-units' => 'PerformanceSystem/EvaluationUnits',
            'performance-methods' => 'PerformanceSystem/PerformanceMethods',
            'assessment-structure' => 'PerformanceSystem/AssessmentStructure',
        ];

        $component = $componentMap[$tab] ?? 'PerformanceSystem/Overview';

        return Inertia::render($component, [
            'project' => $hrProject,
            'performanceSystem' => $performanceSystem,
            'stepStatuses' => $mainStepStatuses,
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
        ]);
    }

    /**
     * Store performance system data.
     */
    public function store(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'evaluation_units' => ['nullable', 'array'],
            'performance_methods' => ['nullable', 'array'],
            'assessment_structure' => ['nullable', 'array'],
        ]);

        $performanceSystem = PerformanceSystem::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            array_merge($validated, ['status' => StepStatus::IN_PROGRESS])
        );

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        return back()->with('success', 'Performance system data saved successfully.');
    }

    /**
     * Submit performance system.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $performanceSystem = $hrProject->performanceSystem;
        
        if (!$performanceSystem) {
            return back()->withErrors(['error' => 'Please complete the performance system first.']);
        }

        $hrProject->setStepStatus('performance', StepStatus::SUBMITTED);

        return back()->with('success', 'Performance system submitted successfully.');
    }
}
