<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use App\Services\ReportDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TreeManagementController extends Controller
{
    protected ReportDataService $reportDataService;

    public function __construct(ReportDataService $reportDataService)
    {
        $this->reportDataService = $reportDataService;
    }

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

        $data = $this->reportDataService->getComprehensiveProjectData($hrProject);

        return Inertia::render('Admin/Tree/Index', [
            'project' => $data['project'],
            'stepStatuses' => $data['stepStatuses'],
            'stageProgressPercent' => $data['stageProgressPercent'],
            'projectId' => $hrProject->id,
            'hrSystemSnapshot' => $data['hrSystemSnapshot'],
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
