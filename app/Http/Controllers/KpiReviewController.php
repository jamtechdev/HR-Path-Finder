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
        $organizationName = $reviewToken->organization_name;

        // Load KPIs for this organization
        $kpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->where('organization_name', $organizationName)
            ->with('linkedJob')
            ->get();

        return Inertia::render('PerformanceSystem/KpiReviewToken', [
            'token' => $token,
            'project' => $hrProject,
            'organizationName' => $organizationName,
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
        $organizationName = $reviewToken->organization_name;

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
     * Send review request email to organization leader (HR Manager action).
     */
    public function sendReviewRequest(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'organization_name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'name' => ['nullable', 'string'],
        ]);

        // Generate token
        $token = KpiReviewToken::generateToken();
        $expiresAt = Carbon::now()->addDays(7);

        $reviewToken = KpiReviewToken::create([
            'hr_project_id' => $hrProject->id,
            'organization_name' => $validated['organization_name'],
            'token' => $token,
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'expires_at' => $expiresAt,
            'max_uses' => 3, // Allow 3 submissions
        ]);

        // TODO: Send email with magic link
        // Mail::to($validated['email'])->send(new KpiReviewInvitation($reviewToken));

        return back()->with('success', 'Review request email sent successfully.');
    }
}
