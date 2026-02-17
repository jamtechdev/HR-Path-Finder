<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\OrganizationalKpi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CeoKpiReviewController extends Controller
{
    /**
     * Show CEO KPI review page.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Load all organizational KPIs grouped by organization
        $kpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->with('linkedJob')
            ->get()
            ->groupBy('organization_name');

        // Get unique organization names
        $organizations = $kpis->keys()->toArray();

        // Load org chart mappings for reference
        $orgChartMappings = \App\Models\OrgChartMapping::where('hr_project_id', $hrProject->id)->get();

        return Inertia::render('PerformanceSystem/CeoKpiReview', [
            'project' => $hrProject,
            'kpisByOrganization' => $kpis,
            'organizations' => $organizations,
            'orgChartMappings' => $orgChartMappings,
        ]);
    }

    /**
     * Store CEO KPI review (approve or request revision).
     */
    public function store(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        $action = $request->input('action'); // 'approve' or 'request_revision'

        if ($action === 'approve') {
            // Approve all KPIs
            OrganizationalKpi::where('hr_project_id', $hrProject->id)
                ->update(['status' => 'approved']);

            // Mark performance step as approved
            $hrProject->setStepStatus('performance', \App\Enums\StepStatus::APPROVED);

            return redirect()->route('ceo.dashboard')
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
