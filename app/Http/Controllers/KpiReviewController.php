<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\KpiReviewToken;
use App\Models\OrganizationalKpi;
use App\Models\KpiEditHistory;
use App\Models\OrgChartMapping;
use App\Mail\KpiReviewRequestMail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class KpiReviewController extends Controller
{
    /**
     * Show KPI review page via magic link (no authentication required).
     */
    public function show(Request $request, string $token)
    {
        $reviewToken = KpiReviewToken::where('token', $token)->first();

        if (!$reviewToken || !$reviewToken->isValid()) {
            abort(404, 'Invalid or expired review link.');
        }

        $hrProject = $reviewToken->hrProject;
        $defaultOrganizationName = $reviewToken->organization_name;

        // Get all organizations that have KPIs
        $allOrganizations = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->distinct()
            ->pluck('organization_name')
            ->filter()
            ->values()
            ->toArray();

        // Also get organizations from org chart mappings
        $orgChartOrganizations = \App\Models\OrgChartMapping::where('hr_project_id', $hrProject->id)
            ->distinct()
            ->pluck('org_unit_name')
            ->filter()
            ->values()
            ->toArray();

        // Combine and get unique organizations
        $allOrganizations = array_unique(array_merge($allOrganizations, $orgChartOrganizations));
        sort($allOrganizations);

        // Load KPIs for the default organization (from token)
        // Strictly restrict access to only the organization assigned to this token
        // Use trim and case-insensitive matching to handle any whitespace issues
        // Load KPIs and remove duplicates
        $allKpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->whereRaw('TRIM(organization_name) = ?', [trim($defaultOrganizationName)])
            ->with('linkedJob')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Remove duplicates - keep the one with highest ID (most recent)
        $uniqueKpis = collect($allKpis)->unique(function ($kpi) {
            return strtolower(trim($kpi->organization_name)) . '::' . strtolower(trim($kpi->kpi_name));
        })->values();
        
        $kpis = $uniqueKpis;

        // Log for debugging
        \Log::info('KPI Review Token Page Loaded', [
            'token' => $token,
            'project_id' => $hrProject->id,
            'organization_name' => $defaultOrganizationName,
            'kpis_count' => $kpis->count(),
            'all_organizations' => $allOrganizations,
        ]);

        // Verify access scope - ensure token can only access its assigned organization
        if ($reviewToken->organization_name !== $defaultOrganizationName) {
            abort(403, 'Access denied. This token is restricted to a specific organization.');
        }

        // Check if token is already used (review completed)
        $isCompleted = $reviewToken->is_used || ($reviewToken->uses_count >= $reviewToken->max_uses);

        return Inertia::render('PerformanceSystem/KpiReviewToken', [
            'token' => $token,
            'project' => $hrProject,
            'organizationName' => $defaultOrganizationName,
            'allOrganizations' => $allOrganizations,
            'kpis' => $kpis->toArray(),
            'reviewerName' => $reviewToken->name,
            'reviewerEmail' => $reviewToken->email,
            'isCompleted' => $isCompleted,
        ]);
    }

    /**
     * Store KPI review from organization leader.
     */
    public function store(Request $request, string $token)
    {
        $reviewToken = KpiReviewToken::where('token', $token)->first();

        if (!$reviewToken || !$reviewToken->isValid()) {
            abort(404, 'Invalid or expired review link.');
        }

        $validated = $request->validate([
            'kpis' => ['required', 'array'],
            'organization_name' => ['required', 'string'],
            'review_comments' => ['nullable', 'string', 'max:5000'],
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

        $hrProject = $reviewToken->hrProject;
        $organizationName = $validated['organization_name'] ?? $reviewToken->organization_name;

        // Strictly enforce access scope - token can only access its assigned organization
        if ($reviewToken->organization_name !== $organizationName) {
            abort(403, 'Access denied. This token is restricted to a specific organization.');
        }

        \DB::transaction(function () use ($hrProject, $organizationName, $validated, $reviewToken) {
            foreach ($validated['kpis'] as $kpiData) {
                if (isset($kpiData['id']) && $kpiData['id']) {
                    // Update existing KPI
                    $kpi = OrganizationalKpi::find($kpiData['id']);
                    if ($kpi && $kpi->organization_name === $organizationName) {
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
            KpiEditHistory::create([
                'organizational_kpi_id' => null, // General review comment, not tied to specific KPI
                'edited_by_type' => 'org_manager',
                'edited_by_id' => null,
                'edited_by_name' => $reviewToken->name,
                'changes' => [
                    'old_values' => null,
                    'new_values' => ['review_comments' => $validated['review_comments']],
                    'description' => 'Organization manager provided review comments',
                ],
            ]);
        }

        // Mark token as used after review submission
        $reviewToken->update(['is_used' => true]);
        $reviewToken->increment('uses_count');

        // Log submission
        \Log::info('KPI Review Submitted', [
            'token' => $token,
            'organization_name' => $organizationName,
            'kpis_count' => count($validated['kpis']),
            'has_review_comments' => !empty($validated['review_comments']),
        ]);

        // Redirect back to the review page - Inertia will call show() method which reloads fresh KPIs
        return redirect()->route('kpi-review.token', ['token' => $token])
            ->with('success', 'Your KPI review has been submitted successfully. Thank you for your feedback!');
    }

    /**
     * Get KPIs for a specific organization (AJAX endpoint for token review page).
     */
    public function getKpisForOrganization(Request $request, string $token, string $organizationName)
    {
        $reviewToken = KpiReviewToken::where('token', $token)->first();

        if (!$reviewToken || !$reviewToken->isValid()) {
            abort(404, 'Invalid or expired review link.');
        }

        // Strictly enforce access scope - token can only access its assigned organization
        if ($reviewToken->organization_name !== $organizationName) {
            abort(403, 'Access denied. This token is restricted to a specific organization.');
        }

        $hrProject = $reviewToken->hrProject;

        // Load KPIs for the selected organization
        // Use trim and case-insensitive matching
        // Load KPIs and remove duplicates
        $allKpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->whereRaw('TRIM(organization_name) = ?', [trim($organizationName)])
            ->with('linkedJob')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Remove duplicates - keep the one with highest ID (most recent)
        $uniqueKpis = collect($allKpis)->unique(function ($kpi) {
            return strtolower(trim($kpi->organization_name)) . '::' . strtolower(trim($kpi->kpi_name));
        })->values();
        
        $kpis = $uniqueKpis;

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
        ]);

        $hrProject->load('company');
        $company = $hrProject->company;

        $emailsSent = 0;
        $errors = [];

        // 1) Send to the organization leader (org head) from org chart mapping for this organization
        $orgMapping = OrgChartMapping::where('hr_project_id', $hrProject->id)
            ->whereRaw('TRIM(LOWER(org_unit_name)) = ?', [strtolower(trim($validated['organization_name']))])
            ->first();

        if ($orgMapping && !empty(trim($orgMapping->org_head_email ?? ''))) {
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
                    'max_uses' => 3,
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
                \Log::error('Failed to send KPI Review Request Email to Organization Leader', [
                    'org_head_email' => $orgMapping->org_head_email ?? null,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                $errors[] = "Failed to send email to organization leader: " . ($orgMapping->org_head_email ?? '') . " - {$e->getMessage()}";
            }
        }

        // 2) Get CEOs and admins for the company
        $ceos = $company->ceos()->get();
        $admins = \App\Models\User::role('admin')->get();

        // Send email to all CEOs
        foreach ($ceos as $ceo) {
            try {
                // Generate token for this CEO
                $token = KpiReviewToken::generateToken();
                $expiresAt = Carbon::now()->addDays(7);

                $reviewToken = KpiReviewToken::create([
                    'hr_project_id' => $hrProject->id,
                    'organization_name' => $validated['organization_name'],
                    'token' => $token,
                    'email' => $ceo->email,
                    'name' => $ceo->name,
                    'expires_at' => $expiresAt,
                    'max_uses' => 3,
                ]);

                \Log::info('Sending KPI Review Request Email to CEO', [
                    'ceo_id' => $ceo->id,
                    'ceo_email' => $ceo->email,
                    'organization_name' => $validated['organization_name'],
                    'project_id' => $hrProject->id,
                ]);

                // Send email directly using Mail facade (no queue)
                Mail::to($ceo->email)->send(new KpiReviewRequestMail($reviewToken, $hrProject));

                \Log::info('KPI Review Request Email sent successfully to CEO', [
                    'ceo_id' => $ceo->id,
                    'ceo_email' => $ceo->email,
                ]);

                $emailsSent++;
            } catch (\Exception $e) {
                \Log::error('Failed to send KPI Review Request Email to CEO', [
                    'ceo_id' => $ceo->id,
                    'ceo_email' => $ceo->email,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                $errors[] = "Failed to send email to CEO: {$ceo->email} - {$e->getMessage()}";
            }
        }

        // Send email to all admins
        foreach ($admins as $admin) {
            try {
                // Generate token for this admin
                $token = KpiReviewToken::generateToken();
                $expiresAt = Carbon::now()->addDays(7);

                $reviewToken = KpiReviewToken::create([
                    'hr_project_id' => $hrProject->id,
                    'organization_name' => $validated['organization_name'],
                    'token' => $token,
                    'email' => $admin->email,
                    'name' => $admin->name,
                    'expires_at' => $expiresAt,
                    'max_uses' => 3,
                ]);

                \Log::info('Sending KPI Review Request Email to Admin', [
                    'admin_id' => $admin->id,
                    'admin_email' => $admin->email,
                    'organization_name' => $validated['organization_name'],
                    'project_id' => $hrProject->id,
                ]);

                // Send email directly using Mail facade (no queue)
                Mail::to($admin->email)->send(new KpiReviewRequestMail($reviewToken, $hrProject));

                \Log::info('KPI Review Request Email sent successfully to Admin', [
                    'admin_id' => $admin->id,
                    'admin_email' => $admin->email,
                ]);

                $emailsSent++;
            } catch (\Exception $e) {
                \Log::error('Failed to send KPI Review Request Email to Admin', [
                    'admin_id' => $admin->id,
                    'admin_email' => $admin->email,
                    'error' => $e->getMessage(),
                ]);
                $errors[] = "Failed to send email to Admin: {$admin->email}";
            }
        }

        if ($emailsSent > 0) {
            $message = "Review request emails sent successfully to {$emailsSent} recipient(s).";
            if (!empty($errors)) {
                $message .= " Some errors occurred: " . implode(', ', $errors);
            }
            return back()->with('success', $message);
        } else {
            return back()->withErrors(['error' => 'Failed to send any emails. ' . implode(', ', $errors)]);
        }
    }
}
