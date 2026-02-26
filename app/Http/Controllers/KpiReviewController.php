<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\KpiReviewToken;
use App\Models\OrganizationalKpi;
use App\Models\KpiEditHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;

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
        $kpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->where('organization_name', $defaultOrganizationName)
            ->with('linkedJob')
            ->get();

        return Inertia::render('PerformanceSystem/KpiReviewToken', [
            'token' => $token,
            'project' => $hrProject,
            'organizationName' => $defaultOrganizationName,
            'allOrganizations' => $allOrganizations,
            'kpis' => $kpis,
            'reviewerName' => $reviewToken->name,
            'reviewerEmail' => $reviewToken->email,
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
                            'kpi_id' => $kpi->id,
                            'editor_name' => $reviewToken->name,
                            'editor_email' => $reviewToken->email,
                            'action' => 'updated',
                            'old_values' => $oldValues,
                            'new_values' => $kpi->toArray(),
                            'change_description' => 'Organization manager proposed changes',
                        ]);
                    }
                } else {
                    // Create new KPI
                    $kpi = OrganizationalKpi::create([
                        'hr_project_id' => $hrProject->id,
                        'organization_name' => $organizationName,
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
                        'kpi_id' => $kpi->id,
                        'editor_name' => $reviewToken->name,
                        'editor_email' => $reviewToken->email,
                        'action' => 'created',
                        'old_values' => null,
                        'new_values' => $kpi->toArray(),
                        'change_description' => 'Organization manager created new KPI',
                    ]);
                }
            }
        });

        // Increment token use
        $reviewToken->incrementUse();

        return back()->with('success', 'Your KPI review has been submitted. HR will review your changes.');
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

        $hrProject = $reviewToken->hrProject;

        // Load KPIs for the selected organization
        $kpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->where('organization_name', $organizationName)
            ->with('linkedJob')
            ->get();

        return response()->json([
            'kpis' => $kpis,
        ]);
    }

    /**
     * Send review request email to organization leader (HR Manager action).
     * Sends emails to all CEOs and admins for the company.
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

        // Get all CEOs for this company
        $ceos = $company->ceos()->get();
        
        // Get all admins (users with admin role)
        $admins = \App\Models\User::role('admin')->get();

        $emailsSent = 0;
        $errors = [];

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

                \Illuminate\Support\Facades\Notification::route('mail', $ceo->email)
                    ->notify(new \App\Notifications\KpiReviewRequestNotification($reviewToken, $hrProject));

                $emailsSent++;
            } catch (\Exception $e) {
                \Log::error('Failed to send KPI Review Request Email to CEO', [
                    'ceo_id' => $ceo->id,
                    'ceo_email' => $ceo->email,
                    'error' => $e->getMessage(),
                ]);
                $errors[] = "Failed to send email to CEO: {$ceo->email}";
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

                \Illuminate\Support\Facades\Notification::route('mail', $admin->email)
                    ->notify(new \App\Notifications\KpiReviewRequestNotification($reviewToken, $hrProject));

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
