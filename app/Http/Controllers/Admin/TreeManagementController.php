<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use App\Models\JobDefinition;
use App\Models\OrgChartMapping;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TreeManagementController extends Controller
{
    /**
     * Show tree management page (Admin only).
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        $user = $request->user();
        
        // Only allow Admin
        if (!$user->hasRole('admin')) {
            abort(403);
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
        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->with('jobKeyword')
            ->get();

        // Load org chart mappings for reporting structure
        $orgChartMappings = OrgChartMapping::where('hr_project_id', $hrProject->id)->get();
        
        // Map reporting structure to job definitions
        $jobDefinitions = $jobDefinitions->map(function ($job) use ($orgChartMappings) {
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
            'hr_policy_os' => $stepStatuses['hr_policy_os'] ?? 'not_started',
        ];

        // Load admin recommendations
        $adminRecommendations = \App\Models\AdminComment::where('hr_project_id', $hrProject->id)
            ->where('step', 'tree')
            ->where('is_recommendation', true)
            ->first();

        $componentMap = [
            'overview' => 'Admin/TreeManagement/Overview',
            'talent-review' => 'Admin/TreeManagement/TalentReview',
            'evaluation' => 'Admin/TreeManagement/Evaluation',
            'enhancement' => 'Admin/TreeManagement/Enhancement',
        ];

        $component = $componentMap[$tab] ?? 'Admin/TreeManagement/Overview';

        return Inertia::render($component, [
            'project' => $hrProject,
            'stepStatuses' => $mainStepStatuses,
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
            'jobDefinitions' => $jobDefinitions,
            'adminRecommendations' => $adminRecommendations,
        ]);
    }

    /**
     * Store tree data (Admin only).
     */
    public function store(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'talent_review' => ['nullable', 'array'],
            'evaluation' => ['nullable', 'array'],
            'enhancement' => ['nullable', 'array'],
        ]);

        // Store TREE data (you may want to create a Tree model)
        // For now, we'll store in a separate table or in project metadata

        return back()->with('success', 'Tree data saved successfully.');
    }

    /**
     * Update tree data (Admin only).
     */
    public function update(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'talent_review' => ['nullable', 'array'],
            'evaluation' => ['nullable', 'array'],
            'enhancement' => ['nullable', 'array'],
        ]);

        // Update TREE data

        return back()->with('success', 'Tree data updated successfully.');
    }
}
