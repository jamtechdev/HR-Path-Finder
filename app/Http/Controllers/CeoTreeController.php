<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Services\ReportDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CeoTreeController extends Controller
{
    protected ReportDataService $reportDataService;

    public function __construct(ReportDataService $reportDataService)
    {
        $this->reportDataService = $reportDataService;
    }

    /**
     * Show tree page for CEO.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        $user = $request->user();
        
        // Only allow CEO
        if (!$user->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($user)) {
            abort(403);
        }

        $data = $this->reportDataService->getComprehensiveProjectData($hrProject);

        return Inertia::render('CEO/Tree/Index', [
            'project' => $data['project'],
            'stepStatuses' => $data['stepStatuses'],
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
            'jobDefinitions' => $data['jobDefinitions'],
            'hrSystemSnapshot' => $data['hrSystemSnapshot'],
        ]);
    }
}
