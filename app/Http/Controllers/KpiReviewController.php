<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\KpiReviewToken;
use App\Models\OrganizationalKpi;
use App\Models\KpiEditHistory;
use App\Models\OrgChartMapping;
use App\Mail\KpiReviewRequestMail;
use App\Notifications\CeoKpiReviewRequestedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class KpiReviewController extends Controller
{
    /**
     * Resolve CEO recipients with valid emails for this project's company.
     *
     * @return Collection<int, \App\Models\User>
     */
    protected function resolveCeoRecipients(HrProject $hrProject): Collection
    {
        $company = $hrProject->company;
        if (! $company) {
            return collect();
        }

        // Primary source: company_users pivot with role=ceo
        $ceos = $company->ceos()->get();

        // Fallback: in case relationship caching/pivot is stale, re-query via users relation.
        if ($ceos->isEmpty()) {
            $ceos = $company->users()->wherePivot('role', 'ceo')->get();
        }

        return $ceos
            ->filter(fn ($u) => is_string($u->email) && trim($u->email) !== '')
            ->values();
    }

    /**
     * Show KPI review page via magic link (no authentication required).
     */
    public function show(Request $request, string $token)
    {
        $reviewToken = KpiReviewToken::where('token', $token)->first();

        if (!$reviewToken) {
            abort(404, 'Invalid or expired review link.');
        }
        if ($reviewToken->expires_at && $reviewToken->expires_at->isPast()) {
            abort(404, 'This review link has expired.');
        }

        $hrProject = $reviewToken->hrProject;
        $defaultOrganizationName = trim($reviewToken->organization_name ?? '');

        // Data leak fix: pass only the token's assigned organization; reviewer must not see other orgs
        $allOrganizations = $defaultOrganizationName !== '' ? [$defaultOrganizationName] : [];

        // Load KPIs for the default organization (from token)
        // Strictly restrict access to only the organization assigned to this token
        // Use trim and case-insensitive matching to handle any whitespace issues
        // Load KPIs and remove duplicates
        $allKpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->whereRaw('TRIM(LOWER(organization_name)) = ?', [strtolower(trim($defaultOrganizationName))])
            ->with('linkedJob')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Remove duplicates - keep the one with highest ID (most recent)
        $uniqueKpis = collect($allKpis)->unique(function ($kpi) {
            return strtolower(trim($kpi->organization_name)) . '::' . strtolower(trim($kpi->kpi_name));
        })->values();
        
        $kpis = $uniqueKpis->map(function ($kpi) {
            $history = KpiEditHistory::where('organizational_kpi_id', $kpi->id)
                ->orderByDesc('id')
                ->get();

            $hrVersion = $history->first(function ($h) {
                return ($h->edited_by_type ?? null) === 'hr_manager' && !empty($h->changes['new_values'] ?? null);
            });
            $leaderVersion = $history->first(function ($h) {
                return ($h->edited_by_type ?? null) === 'org_manager' && !empty($h->changes['new_values'] ?? null);
            });
            $hrFromLeaderOldValues = $history->first(function ($h) {
                return ($h->edited_by_type ?? null) === 'org_manager' && !empty($h->changes['old_values'] ?? null);
            });

            $kpi->hr_draft =
                $hrVersion?->changes['new_values']
                ?? $hrFromLeaderOldValues?->changes['old_values']
                ?? $kpi->toArray();
            $kpi->leader_latest = $leaderVersion?->changes['new_values'] ?? null;
            return $kpi;
        })->values();

        // Log for debugging
        \Log::info('KPI Review Token Page Loaded', [
            'token' => $token,
            'project_id' => $hrProject->id,
            'organization_name' => $defaultOrganizationName,
            'kpis_count' => $kpis->count(),
            'all_organizations' => $allOrganizations,
        ]);

        // Verify access scope - ensure token can only access its assigned organization
        if (strtolower(trim((string) $reviewToken->organization_name)) !== strtolower(trim((string) $defaultOrganizationName))) {
            abort(403, 'Access denied. This token is restricted to a specific organization.');
        }

        // Check if token is already used (review completed)
        $isCompleted = $reviewToken->is_used || ($reviewToken->uses_count >= $reviewToken->max_uses);

        $ceos = $this->resolveCeoRecipients($hrProject)->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ];
        })->values();

        $latestReviewComment = '';
        $kpiIds = $kpis->pluck('id')->filter()->values()->all();
        if (!empty($kpiIds)) {
            $commentHistory = KpiEditHistory::whereIn('organizational_kpi_id', $kpiIds)
                ->where('edited_by_type', 'org_manager')
                ->orderByDesc('id')
                ->get()
                ->first(function ($h) {
                    return !empty(trim((string) data_get($h->changes, 'new_values.review_comments', '')));
                });
            $latestReviewComment = trim((string) data_get($commentHistory?->changes, 'new_values.review_comments', ''));
        }

        return Inertia::render('PerformanceSystem/KpiReviewToken', [
            'token' => $token,
            'project' => $hrProject,
            'organizationName' => $defaultOrganizationName,
            'allOrganizations' => $allOrganizations,
            'kpis' => $kpis->toArray(),
            'reviewerName' => $reviewToken->name,
            'reviewerEmail' => $reviewToken->email,
            'isCompleted' => $isCompleted,
            'ceos' => $ceos->toArray(),
            'reviewComments' => $latestReviewComment,
        ]);
    }

    /**
     * Store KPI review from organization leader.
     */
    public function store(Request $request, string $token)
    {
        $reviewToken = KpiReviewToken::where('token', $token)->first();

        if (!$reviewToken) {
            abort(404, 'Invalid or expired review link.');
        }
        if ($reviewToken->expires_at && $reviewToken->expires_at->isPast()) {
            abort(404, 'This review link has expired.');
        }
        $hrProject = $reviewToken->hrProject;
        $tokenOrganization = trim((string) $reviewToken->organization_name);
        $hasCeoRevisionRequested = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->whereRaw('TRIM(LOWER(organization_name)) = ?', [strtolower($tokenOrganization)])
            ->where(function ($q) {
                $q->whereRaw('LOWER(COALESCE(ceo_approval_status, "")) = ?', ['revision_requested'])
                    ->orWhereRaw('LOWER(COALESCE(status, "")) = ?', ['revision_requested']);
            })
            ->exists();

        if ($reviewToken->uses_count >= $reviewToken->max_uses && !$hasCeoRevisionRequested) {
            return redirect()->route('kpi-review.token', ['token' => $token])->withErrors([
                'error' => 'This review link has already been used. Please request a new review link from HR/CEO.',
            ]);
        }

        $isFinalSubmit = (bool) $request->boolean('final_submit', false);

        $validated = $request->validate([
            'final_submit' => ['nullable', 'boolean'],
            'kpis' => ['required', 'array'],
            'organization_name' => ['required', 'string'],
            'review_comments' => ['nullable', 'string', 'max:5000'],
            'ceo_user_ids' => ['nullable', 'array'],
            'ceo_user_ids.*' => ['integer', 'exists:users,id'],
            'self_assessment' => ['nullable', 'array'],
            'self_assessment.*' => ['boolean'],
            'kpis.*.id' => ['nullable', 'exists:organizational_kpis,id'],
            'kpis.*.kpi_name' => ['required', 'string'],
            'kpis.*.purpose' => ['nullable', 'string'],
            'kpis.*.category' => ['nullable', 'string'],
            'kpis.*.linked_job_id' => ['nullable', 'exists:job_definitions,id'],
            'kpis.*.linked_csf' => ['nullable', 'string'],
            'kpis.*.formula' => ['nullable', 'string'],
            'kpis.*.measurement_method' => ['nullable', 'string'],
            'kpis.*.weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'kpis.*.is_active' => ['nullable', 'boolean'],
        ]);

        if ($isFinalSubmit) {
            $selfAssessment = collect($validated['self_assessment'] ?? []);
            if ($selfAssessment->count() < 4 || $selfAssessment->contains(fn ($v) => $v !== true)) {
                return back()->withErrors([
                    'self_assessment' => 'Please complete all 4 self-assessment checks before requesting CEO review.',
                ]);
            }

            $kpis = collect($validated['kpis']);
            $totalWeight = (float) $kpis->sum(fn ($k) => (float) ($k['weight'] ?? 0));
            if ($kpis->isEmpty() || round($totalWeight, 2) !== 100.0) {
                return back()->withErrors([
                    'kpis' => 'Total KPI weight must be exactly 100% before final submission.',
                ]);
            }
        }

        $organizationName = $validated['organization_name'] ?? $reviewToken->organization_name;

        // Strictly enforce access scope - token can only access its assigned organization
        if (strtolower(trim((string) $reviewToken->organization_name)) !== strtolower(trim((string) $organizationName))) {
            abort(403, 'Access denied. This token is restricted to a specific organization.');
        }

        DB::transaction(function () use ($hrProject, $organizationName, $validated, $reviewToken) {
            $normalizedOrganization = strtolower(trim((string) $organizationName));
            foreach ($validated['kpis'] as $kpiData) {
                if (isset($kpiData['id']) && $kpiData['id']) {
                    // Update existing KPI
                    $kpi = OrganizationalKpi::find($kpiData['id']);
                    if ($kpi && strtolower(trim((string) $kpi->organization_name)) === $normalizedOrganization) {
                        $oldValues = $kpi->toArray();
                        $kpi->update([
                            'kpi_name' => $kpiData['kpi_name'],
                            'purpose' => $kpiData['purpose'] ?? null,
                            'category' => $kpiData['category'] ?? null,
                            'linked_job_id' => $kpiData['linked_job_id'] ?? null,
                            'linked_csf' => $kpiData['linked_csf'] ?? null,
                            'formula' => $kpiData['formula'] ?? null,
                            'measurement_method' => $kpiData['measurement_method'] ?? null,
                            'weight' => $kpiData['weight'] ?? null,
                            'is_active' => $kpiData['is_active'] ?? true,
                            'status' => 'proposed',
                        ]);

                        // Log edit history
                        KpiEditHistory::create([
                            'organizational_kpi_id' => $kpi->id,
                            'edited_by_type' => 'org_manager',
                            'edited_by_id' => null,
                            'edited_by_name' => $reviewToken->name,
                            'changes' => [
                                'old_values' => $oldValues,
                                'new_values' => $kpi->toArray(),
                                'description' => 'Organization manager proposed changes',
                            ],
                        ]);
                    }
                } else {
                    // Check if KPI already exists for this organization and name (case-insensitive, trimmed)
                    $existingKpi = OrganizationalKpi::where('hr_project_id', $hrProject->id)
                        ->whereRaw('TRIM(LOWER(organization_name)) = ?', [trim(strtolower($organizationName))])
                        ->whereRaw('TRIM(LOWER(kpi_name)) = ?', [trim(strtolower($kpiData['kpi_name']))])
                        ->first();
                    
                    if ($existingKpi) {
                        // Update existing KPI instead of creating duplicate
                        $oldValues = $existingKpi->toArray();
                        $existingKpi->update([
                            'purpose' => $kpiData['purpose'] ?? $existingKpi->purpose,
                            'category' => $kpiData['category'] ?? $existingKpi->category,
                            'linked_job_id' => $kpiData['linked_job_id'] ?? $existingKpi->linked_job_id,
                            'linked_csf' => $kpiData['linked_csf'] ?? $existingKpi->linked_csf,
                            'formula' => $kpiData['formula'] ?? $existingKpi->formula,
                            'measurement_method' => $kpiData['measurement_method'] ?? $existingKpi->measurement_method,
                            'weight' => $kpiData['weight'] ?? $existingKpi->weight,
                            'is_active' => $kpiData['is_active'] ?? $existingKpi->is_active,
                            'status' => 'proposed',
                        ]);
                        
                        $kpi = $existingKpi;
                    } else {
                        // Create new KPI only if it doesn't exist
                        $kpi = OrganizationalKpi::create([
                            'hr_project_id' => $hrProject->id,
                            'organization_name' => trim($organizationName),
                            'kpi_name' => trim($kpiData['kpi_name']),
                            'purpose' => $kpiData['purpose'] ?? null,
                            'category' => $kpiData['category'] ?? null,
                            'linked_job_id' => $kpiData['linked_job_id'] ?? null,
                            'linked_csf' => $kpiData['linked_csf'] ?? null,
                            'formula' => $kpiData['formula'] ?? null,
                            'measurement_method' => $kpiData['measurement_method'] ?? null,
                            'weight' => $kpiData['weight'] ?? null,
                            'is_active' => $kpiData['is_active'] ?? true,
                            'status' => 'proposed',
                        ]);
                    }

                    // Log edit history
                    KpiEditHistory::create([
                        'organizational_kpi_id' => $kpi->id,
                        'edited_by_type' => 'org_manager',
                        'edited_by_id' => null,
                        'edited_by_name' => $reviewToken->name,
                        'changes' => [
                            'old_values' => null,
                            'new_values' => $kpi->toArray(),
                            'description' => 'Organization manager created new KPI',
                        ],
                    ]);
                }
            }
        });

        // Save review comments to edit history if provided
        if (!empty($validated['review_comments'])) {
            $anchorKpiId = OrganizationalKpi::where('hr_project_id', $hrProject->id)
                ->whereRaw('TRIM(LOWER(organization_name)) = ?', [strtolower(trim((string) $organizationName))])
                ->value('id');
            KpiEditHistory::create([
                'organizational_kpi_id' => $anchorKpiId, // Anchor to org KPI so we can query by project/org later
                'edited_by_type' => 'org_manager',
                'edited_by_id' => null,
                'edited_by_name' => $reviewToken->name,
                'changes' => [
                    'old_values' => null,
                    'new_values' => [
                        'review_comments' => $validated['review_comments'],
                        'organization_name' => trim((string) $organizationName),
                    ],
                    'description' => 'Organization manager provided review comments',
                ],
            ]);
        }

        if (!$isFinalSubmit) {
            return back()->with('success', 'KPI draft saved successfully.');
        }

        // Final submit only: lock token usage and notify CEO.
        $reviewToken->incrementUse();

        $hrProject->load('company');
        $ceos = $this->resolveCeoRecipients($hrProject);
        $requestedCeoIds = $validated['ceo_user_ids'] ?? null;

        $ceosToNotify = $ceos;
        if (is_array($requestedCeoIds) && count($requestedCeoIds) > 0) {
            // only allow selection among this company's CEO recipients
            $ceosToNotify = $ceos->whereIn('id', $requestedCeoIds)->values();
        }

        $ceoNotified = false;
        if ($ceosToNotify->isNotEmpty()) {
            try {
                Notification::send(
                    $ceosToNotify,
                    new CeoKpiReviewRequestedNotification($hrProject, $organizationName)
                );
                $ceoNotified = true;
            } catch (\Exception $e) {
                \Log::error('Failed to notify CEO after leader KPI submission', [
                    'project_id' => $hrProject->id,
                    'organization_name' => $organizationName,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Log submission
        \Log::info('KPI Review Submitted', [
            'token' => $token,
            'organization_name' => $organizationName,
            'kpis_count' => count($validated['kpis']),
            'has_review_comments' => !empty($validated['review_comments']),
        ]);

        // Redirect back to the review page - Inertia will call show() method which reloads fresh KPIs
        return redirect()->route('kpi-review.token', ['token' => $token])
            ->with(
                $ceoNotified ? 'success' : 'warning',
                $ceoNotified
                    ? 'Your KPI review has been submitted successfully. CEO has been notified by email.'
                    : 'Your KPI review has been submitted successfully, but we could not email the CEO. Please contact support.'
            );
    }

    /**
     * Get KPIs for a specific organization (AJAX endpoint for token review page).
     */
    public function getKpisForOrganization(Request $request, string $token, string $organizationName)
    {
        $reviewToken = KpiReviewToken::where('token', $token)->first();

        if (!$reviewToken) {
            abort(404, 'Invalid or expired review link.');
        }
        if ($reviewToken->expires_at && $reviewToken->expires_at->isPast()) {
            abort(404, 'This review link has expired.');
        }

        // Strictly enforce access scope - token can only access its assigned organization
        if (strtolower(trim((string) $reviewToken->organization_name)) !== strtolower(trim((string) $organizationName))) {
            abort(403, 'Access denied. This token is restricted to a specific organization.');
        }

        $hrProject = $reviewToken->hrProject;

        // Load KPIs for the selected organization
        // Use trim and case-insensitive matching
        // Load KPIs and remove duplicates
        $allKpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->whereRaw('TRIM(LOWER(organization_name)) = ?', [strtolower(trim($organizationName))])
            ->with('linkedJob')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Remove duplicates - keep the one with highest ID (most recent)
        $uniqueKpis = collect($allKpis)->unique(function ($kpi) {
            return strtolower(trim($kpi->organization_name)) . '::' . strtolower(trim($kpi->kpi_name));
        })->values();
        
        $kpis = $uniqueKpis->map(function ($kpi) {
            $history = KpiEditHistory::where('organizational_kpi_id', $kpi->id)
                ->orderByDesc('id')
                ->get();

            $hrVersion = $history->first(function ($h) {
                return ($h->edited_by_type ?? null) === 'hr_manager' && !empty($h->changes['new_values'] ?? null);
            });
            $leaderVersion = $history->first(function ($h) {
                return ($h->edited_by_type ?? null) === 'org_manager' && !empty($h->changes['new_values'] ?? null);
            });
            $hrFromLeaderOldValues = $history->first(function ($h) {
                return ($h->edited_by_type ?? null) === 'org_manager' && !empty($h->changes['old_values'] ?? null);
            });

            $kpi->hr_draft =
                $hrVersion?->changes['new_values']
                ?? $hrFromLeaderOldValues?->changes['old_values']
                ?? $kpi->toArray();
            $kpi->leader_latest = $leaderVersion?->changes['new_values'] ?? null;
            return $kpi;
        })->values();

        return response()->json([
            'kpis' => $kpis,
        ]);
    }

    /**
     * Send review request email to organization leader (HR Manager action).
     * Sends to: (1) the organization leader from org chart mapping (org_head_email), then (2) CEOs and admins.
     */
    public function sendReviewRequest(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'organization_name' => ['required', 'string'],
            'recipient_target' => ['nullable', 'in:leader,ceo,both'],
            'kpis' => ['nullable', 'array'],
            'kpis.*.id' => ['nullable', 'exists:organizational_kpis,id'],
            'kpis.*.kpi_name' => ['required_with:kpis', 'string'],
            'kpis.*.purpose' => ['nullable', 'string'],
            'kpis.*.category' => ['nullable', 'string'],
            'kpis.*.linked_job_id' => ['nullable', 'exists:job_definitions,id'],
            'kpis.*.linked_csf' => ['nullable', 'string'],
            'kpis.*.formula' => ['nullable', 'string'],
            'kpis.*.measurement_method' => ['nullable', 'string'],
            'kpis.*.weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'kpis.*.is_active' => ['nullable', 'boolean'],
        ]);

        $hrProject->load('company');
        $recipientTarget = $validated['recipient_target'] ?? 'leader';
        $ceos = $this->resolveCeoRecipients($hrProject);
        $selectedOrg = trim((string) $validated['organization_name']);

        // Guard: verified/approved organizations cannot be re-sent unless CEO requested revision.
        $orgRows = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->whereRaw('TRIM(LOWER(organization_name)) = ?', [strtolower($selectedOrg)])
            ->get(['status', 'ceo_approval_status']);

        if ($orgRows->isEmpty()) {
            return back()->withErrors([
                'error' => 'No KPI rows found for the selected organization.',
            ]);
        }

        $hasCeoRevisionRequested = $orgRows->contains(function ($k) {
            $ceo = strtolower((string) ($k->ceo_approval_status ?? ''));
            $status = strtolower((string) ($k->status ?? ''));
            return $ceo === 'revision_requested' || $status === 'revision_requested';
        });

        $allApproved = $orgRows->every(function ($k) {
            $ceo = strtolower((string) ($k->ceo_approval_status ?? ''));
            $status = strtolower((string) ($k->status ?? ''));
            return $ceo === 'approved' || $status === 'approved' || $status === 'verified';
        });

        if ($allApproved && !$hasCeoRevisionRequested) {
            return back()->withErrors([
                'error' => 'This organization is already verified by CEO. Re-send is allowed only after a CEO revision request.',
            ]);
        }

        $emailsSent = 0;
        $errors = [];

        // Persist latest KPI draft before sending email, so token page always shows current KPIs.
        // Full sync for selected organization: create/update provided rows and remove missing rows.
        if (!empty($validated['kpis']) && is_array($validated['kpis'])) {
            $incoming = collect($validated['kpis'])
                ->map(function ($kpiData) use ($selectedOrg) {
                    return [
                        'id' => $kpiData['id'] ?? null,
                        'organization_name' => trim((string) ($kpiData['organization_name'] ?? $selectedOrg)),
                        'kpi_name' => trim((string) ($kpiData['kpi_name'] ?? '')),
                        'purpose' => $kpiData['purpose'] ?? null,
                        'category' => $kpiData['category'] ?? null,
                        'linked_job_id' => $kpiData['linked_job_id'] ?? null,
                        'linked_csf' => $kpiData['linked_csf'] ?? null,
                        'formula' => $kpiData['formula'] ?? null,
                        'measurement_method' => $kpiData['measurement_method'] ?? null,
                        'weight' => $kpiData['weight'] ?? null,
                        'is_active' => $kpiData['is_active'] ?? true,
                    ];
                })
                ->filter(function ($row) use ($selectedOrg) {
                    return strtolower($row['organization_name']) === strtolower($selectedOrg) && $row['kpi_name'] !== '';
                })
                ->values();

            $activeTotalWeight = (float) $incoming
                ->filter(fn ($row) => (bool) ($row['is_active'] ?? true))
                ->sum(fn ($row) => (float) ($row['weight'] ?? 0));
            if ($incoming->isEmpty() || round($activeTotalWeight, 2) !== 100.0) {
                return back()->withErrors([
                    'error' => 'Selected organization KPI weight must be exactly 100% before sending review request.',
                ]);
            }

            \DB::transaction(function () use ($hrProject, $selectedOrg, $incoming) {
                $orgQuery = OrganizationalKpi::where('hr_project_id', $hrProject->id)
                    ->whereRaw('TRIM(LOWER(organization_name)) = ?', [strtolower($selectedOrg)]);
                $existingOrgIds = $orgQuery->pluck('id')->all();
                $keptIds = [];

                foreach ($incoming as $row) {
                    $kpi = null;
                    if (!empty($row['id'])) {
                        $kpi = OrganizationalKpi::where('id', $row['id'])
                            ->where('hr_project_id', $hrProject->id)
                            ->first();
                    }

                    if (!$kpi) {
                        $kpi = OrganizationalKpi::where('hr_project_id', $hrProject->id)
                            ->whereRaw('TRIM(LOWER(organization_name)) = ?', [strtolower($row['organization_name'])])
                            ->whereRaw('TRIM(LOWER(kpi_name)) = ?', [strtolower($row['kpi_name'])])
                            ->first();
                    }

                    if ($kpi) {
                        $kpi->update([
                            'organization_name' => $row['organization_name'],
                            'kpi_name' => $row['kpi_name'],
                            'purpose' => $row['purpose'],
                            'category' => $row['category'],
                            'linked_job_id' => $row['linked_job_id'],
                            'linked_csf' => $row['linked_csf'],
                            'formula' => $row['formula'],
                            'measurement_method' => $row['measurement_method'],
                            'weight' => $row['weight'],
                            'is_active' => $row['is_active'],
                            'status' => 'draft',
                        ]);
                    } else {
                        $kpi = OrganizationalKpi::create([
                            'hr_project_id' => $hrProject->id,
                            'organization_name' => $row['organization_name'],
                            'kpi_name' => $row['kpi_name'],
                            'purpose' => $row['purpose'],
                            'category' => $row['category'],
                            'linked_job_id' => $row['linked_job_id'],
                            'linked_csf' => $row['linked_csf'],
                            'formula' => $row['formula'],
                            'measurement_method' => $row['measurement_method'],
                            'weight' => $row['weight'],
                            'is_active' => $row['is_active'],
                            'status' => 'draft',
                        ]);
                    }

                    $keptIds[] = $kpi->id;
                }

                $deleteIds = array_values(array_diff($existingOrgIds, $keptIds));
                if (!empty($deleteIds)) {
                    OrganizationalKpi::whereIn('id', $deleteIds)->delete();
                }
            });
        }

        if (in_array($recipientTarget, ['leader', 'both'], true)) {
            // 1) Send to the organization leader (org head) from org chart mapping for this organization
            $orgMapping = OrgChartMapping::where('hr_project_id', $hrProject->id)
                ->whereRaw('TRIM(LOWER(org_unit_name)) = ?', [strtolower(trim($validated['organization_name']))])
                ->first();

            if ($orgMapping && $orgMapping->is_kpi_reviewer && !empty(trim($orgMapping->org_head_email ?? ''))) {
                $reviewToken = null;
                try {
                    $token = KpiReviewToken::generateToken();
                    $expiresAt = Carbon::now()->addDays(7);
                    $leaderEmail = trim($orgMapping->org_head_email);
                    $leaderName = trim($orgMapping->org_head_name ?? '') ?: $leaderEmail;

                    $reviewToken = KpiReviewToken::create([
                        'hr_project_id' => $hrProject->id,
                        'organization_name' => $validated['organization_name'],
                        'token' => $token,
                        'email' => $leaderEmail,
                        'name' => $leaderName,
                        'expires_at' => $expiresAt,
                        'max_uses' => 1,
                    ]);

                    \Log::info('Sending KPI Review Request Email to Organization Leader', [
                        'organization_name' => $validated['organization_name'],
                        'org_head_email' => $leaderEmail,
                        'project_id' => $hrProject->id,
                    ]);

                    Mail::to($leaderEmail)->send(new KpiReviewRequestMail($reviewToken, $hrProject));

                    \Log::info('KPI Review Request Email sent successfully to Organization Leader', [
                        'org_head_email' => $leaderEmail,
                    ]);

                    $emailsSent++;
                } catch (\Exception $e) {
                    // Roll back token if email delivery failed, so UI doesn't show false "Request Sent".
                    if ($reviewToken) {
                        try {
                            $reviewToken->delete();
                        } catch (\Throwable $deleteError) {
                            \Log::warning('Failed to rollback KPI review token after mail send failure', [
                                'review_token_id' => $reviewToken->id ?? null,
                                'error' => $deleteError->getMessage(),
                            ]);
                        }
                    }
                    \Log::error('Failed to send KPI Review Request Email to Organization Leader', [
                        'org_head_email' => $orgMapping->org_head_email ?? null,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    $errors[] = "Failed to send email to organization leader: " . ($orgMapping->org_head_email ?? '') . " - {$e->getMessage()}";
                }
            } else {
                $errors[] = 'No valid KPI reviewer leader email found for selected organization.';
            }
        }

        if (in_array($recipientTarget, ['ceo', 'both'], true)) {
            if ($ceos->isEmpty()) {
                $errors[] = 'No CEO is assigned to this company.';
            } else {
                try {
                    Notification::send(
                        $ceos,
                        new CeoKpiReviewRequestedNotification($hrProject, $validated['organization_name'])
                    );
                    $emailsSent += $ceos->count();
                } catch (\Exception $e) {
                    $errors[] = 'Failed to send CEO review email: ' . $e->getMessage();
                }
            }
        }

        if ($emailsSent > 0) {
            $message = "Review request email sent successfully.";
            if (!empty($errors)) {
                $message .= " Some errors occurred: " . implode(', ', $errors);
            }
            // Avoid global flash toast here; HR UI already shows its own success modal.
            if (!empty($errors)) {
                return back()->withErrors(['error' => $message]);
            }
            return back();
        } else {
            return back()->withErrors(['error' => 'Failed to send any emails. ' . implode(', ', $errors)]);
        }
    }

    /**
     * Notify company CEO by email that KPI review is ready.
     */
    public function notifyCeoKpiReview(Request $request, HrProject $hrProject)
    {
        if (! $request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'organization_name' => ['required', 'string'],
        ]);

        $hrProject->load('company');
        $ceos = $this->resolveCeoRecipients($hrProject);

        if ($ceos->isEmpty()) {
            return back()->withErrors([
                'error' => 'No CEO is assigned to this company.',
            ]);
        }

        Notification::send(
            $ceos,
            new CeoKpiReviewRequestedNotification($hrProject, $validated['organization_name'])
        );

        return back()->with('success', 'CEO notified by email for KPI review.');
    }
}
