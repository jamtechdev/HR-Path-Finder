<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use App\Models\OrganizationalKpi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KpiReviewController extends Controller
{
    /**
     * All projects that have KPIs (admin picks one to open detail review).
     */
    public function listIndex(Request $request): Response
    {
        if (! $request->user()->hasRole('admin')) {
            abort(403);
        }

        $projects = HrProject::with(['company'])->get();
        $projectIds = $projects->pluck('id')->toArray();

        $kpiCounts = OrganizationalKpi::whereIn('hr_project_id', $projectIds)
            ->selectRaw("hr_project_id, COUNT(*) as total, SUM(CASE WHEN COALESCE(ceo_approval_status, '') = 'approved' OR COALESCE(status, '') = 'approved' THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN COALESCE(ceo_approval_status, '') = 'revision_requested' OR COALESCE(status, '') = 'revision_requested' THEN 1 ELSE 0 END) as revision_requested")
            ->groupBy('hr_project_id')
            ->get()
            ->keyBy('hr_project_id');

        $kpiProjects = $projects->map(function (HrProject $project) use ($kpiCounts) {
            $counts = $kpiCounts->get($project->id);
            $kpiTotal = $counts ? (int) $counts->total : 0;
            $kpiApproved = $counts ? (int) $counts->approved : 0;
            $kpiRevisionRequested = $counts ? (int) $counts->revision_requested : 0;
            $perfStatus = $project->step_statuses['performance'] ?? 'not_started';
            $kpiStatus = 'none';
            if ($kpiTotal > 0) {
                if ($kpiApproved >= $kpiTotal) {
                    $kpiStatus = 'approved';
                } elseif ($kpiRevisionRequested > 0) {
                    $kpiStatus = 'revision_requested';
                } else {
                    $kpiStatus = in_array($perfStatus, ['in_progress', 'submitted'], true) ? 'pending' : 'in_progress';
                }
            }

            return [
                'id' => $project->id,
                'company' => $project->company ? [
                    'id' => $project->company->id,
                    'name' => $project->company->name,
                ] : null,
                'kpi_total' => $kpiTotal,
                'kpi_approved' => $kpiApproved,
                'kpi_review_status' => $kpiStatus,
                'created_at' => $project->created_at,
            ];
        })->filter(fn (array $row) => $row['kpi_total'] > 0)->values();

        return Inertia::render('Admin/KpiReview/Index', [
            'projects' => $kpiProjects,
            'stats' => [
                'total_projects' => $projects->count(),
                'kpi_projects' => $kpiProjects->count(),
                'pending_kpi_review' => $kpiProjects->where('kpi_review_status', 'pending')->count(),
                'completed_kpi_review' => $kpiProjects->where('kpi_review_status', 'approved')->count(),
            ],
        ]);
    }

    /**
     * Show Admin KPI review page.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        if (! $request->user()->hasRole('admin')) {
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
            return strtolower(trim($kpi->organization_name)).'::'.strtolower(trim($kpi->kpi_name));
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
        if (! $request->user()->hasRole('admin')) {
            abort(403);
        }

        $action = $request->input('action'); // 'approve' or 'request_revision'

        if ($action === 'approve') {
            $weightByOrg = OrganizationalKpi::where('hr_project_id', $hrProject->id)
                ->get()
                ->groupBy(fn ($k) => trim((string) $k->organization_name))
                ->map(function ($rows) {
                    return (float) $rows->sum(fn ($k) => (float) ($k->weight ?? 0));
                });
            $invalidOrg = $weightByOrg->first(fn ($sum, $org) => trim((string) $org) !== '' && round($sum, 2) !== 100.0);
            if ($invalidOrg !== null) {
                return back()->withErrors([
                    'error' => '조직별 KPI 가중치 합계가 100%가 되어야 최종 확정할 수 있습니다.',
                ]);
            }

            // Approve all KPIs
            OrganizationalKpi::where('hr_project_id', $hrProject->id)
                ->update([
                    'ceo_approval_status' => 'approved',
                    'status' => 'approved',
                ]);

            // Mark performance step as approved
            $hrProject->setStepStatus('performance', \App\Enums\StepStatus::APPROVED);

            return redirect()->route('admin.dashboard')
                ->with('success', '전사 KPI가 최종 확정 및 승인되었습니다.');
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

            return back()->with('success', '조직 리더에게 수정 요청을 전송했습니다.');
        }

        return back()->withErrors(['error' => '유효하지 않은 요청입니다.']);
    }
}
