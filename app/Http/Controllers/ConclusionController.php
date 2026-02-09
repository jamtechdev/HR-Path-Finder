<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\HrProject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConclusionController extends Controller
{
    /**
     * Show conclusion step.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('conclusion')) {
            return back()->withErrors(['error' => 'Conclusion step is not yet unlocked.']);
        }

        $hrProject->load([
            'diagnosis',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'company',
        ]);

        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
            'tree' => $stepStatuses['tree'] ?? 'not_started',
            'conclusion' => $stepStatuses['conclusion'] ?? 'not_started',
        ];

        return Inertia::render('Conclusion/Index', [
            'project' => $hrProject,
            'stepStatuses' => $mainStepStatuses,
            'projectId' => $hrProject->id,
        ]);
    }

    /**
     * Finalize and approve the entire HR system.
     */
    public function finalize(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Mark conclusion as completed
        $hrProject->setStepStatus('conclusion', StepStatus::APPROVED);
        $hrProject->update(['status' => \App\Enums\ProjectStatus::COMPLETED]);

        return redirect()->route('hr-manager.dashboard')
            ->with('success', 'HR System Design completed successfully!');
    }
}
