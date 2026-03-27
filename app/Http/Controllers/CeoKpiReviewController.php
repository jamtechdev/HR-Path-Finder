<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\KpiReviewToken;
use App\Models\OrgChartMapping;
use App\Models\OrganizationalKpi;
use App\Notifications\OrgKpiApprovalCompletedNotification;
use App\Notifications\OrgKpiRevisionRequestedNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
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

        $hrProject->load('company.users');
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        // Load all organizational KPIs and remove duplicates
        $allKpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->with(['linkedJob', 'editHistory' => function ($q) {
                $q->orderByDesc('id');
            }])
            ->orderBy('organization_name')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Remove duplicates - keep the one with highest ID (most recent)
        $uniqueKpis = collect($allKpis)->unique(function ($kpi) {
            return strtolower(trim($kpi->organization_name)) . '::' . strtolower(trim($kpi->kpi_name));
        })->values();
        
        $kpis = $uniqueKpis->map(function ($kpi) {
            $hrVersion = $kpi->editHistory
                ->first(function ($h) {
                    return ($h->edited_by_type ?? null) === 'hr_manager' && !empty($h->changes['new_values'] ?? null);
                });

            $leaderVersion = $kpi->editHistory
                ->first(function ($h) {
                    return ($h->edited_by_type ?? null) === 'org_manager' && !empty($h->changes['new_values'] ?? null);
                });

            $kpi->hr_draft = $hrVersion?->changes['new_values'] ?? null;
            $kpi->leader_latest = $leaderVersion?->changes['new_values'] ?? null;

            return $kpi;
        })->values();

        // Load org chart mappings for reference
        $orgChartMappings = \App\Models\OrgChartMapping::where('hr_project_id', $hrProject->id)->get();

        return Inertia::render('PerformanceSystem/CeoKpiReview', [
            'project' => $hrProject,
            'kpis' => $kpis,
            'orgChartMappings' => $orgChartMappings,
            'isAdmin' => false,
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

        $hrProject->load('company.users');
        if (!$hrProject->company->users->contains($request->user())) {
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
                    'error' => 'Each organization total KPI weight must be exactly 100% before CEO approval.',
                ]);
            }

            $orgNames = OrganizationalKpi::where('hr_project_id', $hrProject->id)
                ->select('organization_name')
                ->distinct()
                ->pluck('organization_name')
                ->filter(fn ($name) => trim((string) $name) !== '');

            // Approve all KPIs
            OrganizationalKpi::where('hr_project_id', $hrProject->id)
                ->update([
                    'ceo_approval_status' => 'approved',
                    'status' => 'approved'
                ]);

            // Mark performance step as approved
            $hrProject->setStepStatus('performance', \App\Enums\StepStatus::APPROVED);

            // Email: Org KPI Approval Completed by CEO
            foreach ($orgNames as $orgName) {
                $mapping = OrgChartMapping::where('hr_project_id', $hrProject->id)
                    ->whereRaw('TRIM(LOWER(org_unit_name)) = ?', [strtolower(trim((string) $orgName))])
                    ->where('is_kpi_reviewer', true)
                    ->first();

                $leaderEmail = trim((string) ($mapping?->org_head_email ?? ''));
                if ($leaderEmail === '') {
                    continue;
                }

                Notification::route('mail', $leaderEmail)->notify(
                    new OrgKpiApprovalCompletedNotification($hrProject, (string) $orgName)
                );
            }

            return back()->with('ceo_modal_success', 'Company-wide KPIs have been finalized and approved.');
        } elseif ($action === 'request_revision') {
            $validated = $request->validate([
                'revision_requests' => ['required', 'array'],
                'revision_requests.*.organization_name' => ['required', 'string'],
                'revision_requests.*.comment' => ['required', 'string'],
            ]);

            \DB::transaction(function () use ($hrProject, $validated) {
                foreach ($validated['revision_requests'] as $revision) {
                    OrganizationalKpi::where('hr_project_id', $hrProject->id)
                        ->whereRaw('TRIM(LOWER(organization_name)) = ?', [strtolower(trim((string) $revision['organization_name']))])
                        ->update([
                            'ceo_approval_status' => 'revision_requested',
                            'ceo_revision_comment' => $revision['comment'],
                            'status' => 'revision_requested',
                            'revision_comment' => $revision['comment'],
                        ]);
                }
            });

            // Email: Org KPI Revision Requested by CEO + fresh review token link
            foreach ($validated['revision_requests'] as $revision) {
                $organizationName = trim((string) $revision['organization_name']);
                $mapping = OrgChartMapping::where('hr_project_id', $hrProject->id)
                    ->whereRaw('TRIM(LOWER(org_unit_name)) = ?', [strtolower($organizationName)])
                    ->where('is_kpi_reviewer', true)
                    ->first();

                $leaderEmail = trim((string) ($mapping?->org_head_email ?? ''));
                if ($leaderEmail === '') {
                    continue;
                }

                $leaderName = trim((string) ($mapping?->org_head_name ?? '')) ?: $leaderEmail;
                $reviewToken = KpiReviewToken::create([
                    'hr_project_id' => $hrProject->id,
                    'organization_name' => $organizationName,
                    'token' => KpiReviewToken::generateToken(),
                    'email' => $leaderEmail,
                    'name' => $leaderName,
                    'expires_at' => Carbon::now()->addDays(7),
                    'max_uses' => 1,
                ]);

                $reviewUrl = route('kpi-review.token', ['token' => $reviewToken->token]);
                Notification::route('mail', $leaderEmail)->notify(
                    new OrgKpiRevisionRequestedNotification(
                        $hrProject,
                        $organizationName,
                        (string) $revision['comment'],
                        $reviewUrl
                    )
                );
            }

            return back()->with('ceo_modal_success', 'Revision requests have been sent to organization leaders.');
        }

        return back()->withErrors(['error' => 'Invalid action.']);
    }
}
