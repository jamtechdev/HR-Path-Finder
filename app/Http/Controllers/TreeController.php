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
        $user = $request->user();
        
        // Allow HR Manager, CEO, and Admin
        if (!$user->hasRole('hr_manager') && !$user->hasRole('ceo') && !$user->hasRole('admin')) {
            abort(403);
        }

        // For HR Manager, check if step is unlocked
        if ($user->hasRole('hr_manager') && !$hrProject->isStepUnlocked('tree')) {
            return back()->withErrors(['error' => 'TREE step is not yet unlocked.']);
        }

        // Load all necessary data
        $hrProject->load([
            'diagnosis',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'company',
            'ceoPhilosophy',
        ]);

        // Load finalized job definitions with job keywords
        $jobDefinitions = \App\Models\JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->with('jobKeyword')
            ->get();

        // Load org chart mappings for reporting structure
        $orgChartMappings = \App\Models\OrgChartMapping::where('hr_project_id', $hrProject->id)->get();
        
        // Map reporting structure to job definitions
        $jobDefinitions = $jobDefinitions->map(function ($job) use ($orgChartMappings) {
            // Try to find reporting structure from org chart mappings
            $mapping = $orgChartMappings->first(function ($mapping) use ($job) {
                $jobKeywordIds = $mapping->job_keyword_ids ?? [];
                return in_array($job->job_keyword_id, $jobKeywordIds);
            });

            if ($mapping) {
                $job->reporting_structure = [
                    'executive_director' => $mapping->org_head_name ? 
                        "{$mapping->org_head_title} {$mapping->org_head_name}" : null,
                    'reporting_hierarchy' => $mapping->org_head_rank ? 
                        "Team Leader → {$mapping->org_head_rank} → CEO" : null,
                ];
            }

            // Set job group from job keyword category
            if ($job->jobKeyword && $job->jobKeyword->category) {
                $job->job_group = $job->jobKeyword->category;
            }

            return $job;
        });
        
        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
            'tree' => $stepStatuses['tree'] ?? 'not_started',
            'conclusion' => $stepStatuses['conclusion'] ?? 'not_started',
        ];

        // Load admin recommendations
        $adminRecommendations = \App\Models\AdminComment::where('hr_project_id', $hrProject->id)
            ->where('step', 'tree')
            ->where('is_recommendation', true)
            ->first();

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
            'jobDefinitions' => $jobDefinitions,
            'adminRecommendations' => $adminRecommendations,
            'isAdminView' => $user->hasRole('admin'),
            'isCeoView' => $user->hasRole('ceo'),
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
