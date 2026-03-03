<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use App\Models\OrganizationalKpi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KpiReviewController extends Controller
{
    /**
     * Show Admin KPI review page.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403);
        }

        // Load all organizational KPIs and remove duplicates
        $allKpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->with('linkedJob')
            ->orderBy('organization_name')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Remove duplicates - keep the one with highest ID (most recent)
        $uniqueKpis = collect($allKpis)->unique(function ($kpi) {
            return strtolower(trim($kpi->organization_name)) . '::' . strtolower(trim($kpi->kpi_name));
        })->values();
        
        $kpis = $uniqueKpis;

        // Load org chart mappings for reference
        $orgChartMappings = \App\Models\OrgChartMapping::where('hr_project_id', $hrProject->id)->get();

        return Inertia::render('PerformanceSystem/CeoKpiReview', [
            'project' => $hrProject,
            'kpis' => $kpis,
            'orgChartMappings' => $orgChartMappings,
            'isAdmin' => true,
        ]);
    }

    /**
     * Store Admin KPI review (approve or request revision).
     */
    public function store(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403);
        }

        $action = $request->input('action'); // 'approve' or 'request_revision'

        if ($action === 'approve') {
            // Approve all KPIs
            OrganizationalKpi::where('hr_project_id', $hrProject->id)
                ->update([
                    'ceo_approval_status' => 'approved',
                    'status' => 'approved'
                ]);

            // Mark performance step as approved
            $hrProject->setStepStatus('performance', \App\Enums\StepStatus::APPROVED);

            return redirect()->route('admin.dashboard')
                ->with('success', 'Company-wide KPIs have been finalized and approved.');
        } elseif ($action === 'request_revision') {
            $validated = $request->validate([
                'revision_requests' => ['required', 'array'],
                'revision_requests.*.organization_name' => ['required', 'string'],
                'revision_requests.*.comment' => ['required', 'string'],
            ]);

            \DB::transaction(function () use ($hrProject, $validated) {
                foreach ($validated['revision_requests'] as $revision) {
                    OrganizationalKpi::where('hr_project_id', $hrProject->id)
                        ->where('organization_name', $revision['organization_name'])
                        ->update([
                            'ceo_approval_status' => 'revision_requested',
                            'ceo_revision_comment' => $revision['comment'],
                            'status' => 'revision_requested',
                            'revision_comment' => $revision['comment'],
                        ]);
                }
            });

            return back()->with('success', 'Revision requests have been sent to organization leaders.');
        }

        return back()->withErrors(['error' => 'Invalid action.']);
    }
}
