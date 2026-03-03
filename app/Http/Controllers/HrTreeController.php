<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Services\ReportDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrTreeController extends Controller
{
    protected ReportDataService $reportDataService;

    public function __construct(ReportDataService $reportDataService)
    {
        $this->reportDataService = $reportDataService;
    }

    /**
     * Show tree page for HR Manager.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        $user = $request->user();
        
        // Only allow HR Manager
        if (!$user->hasRole('hr_manager')) {
            abort(403);
        }

        $data = $this->reportDataService->getComprehensiveProjectData($hrProject);

        return Inertia::render('HRManager/Tree/Index', [
            'project' => $data['project'],
            'stepStatuses' => $data['stepStatuses'],
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
            'jobDefinitions' => $data['jobDefinitions'],
            'hrSystemSnapshot' => $data['hrSystemSnapshot'],
        ]);
    }
}
