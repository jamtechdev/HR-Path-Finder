<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KpiEditHistory;
use App\Models\OrganizationalKpi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KpiEditHistoryController extends Controller
{
    /**
     * Display KPI edit history for a specific KPI.
     * Accessible by both Admin and HR Manager.
     */
    public function show(OrganizationalKpi $organizationalKpi)
    {
        // Check authorization - allow admin or HR Manager who owns the project
        $user = request()->user();
        if (!$user) {
            abort(401);
        }

        if (!$user->hasRole('admin') && !$user->hasRole('hr_manager')) {
            abort(403);
        }

        // If HR Manager, verify they own the project
        if ($user->hasRole('hr_manager') && !$user->hasRole('admin')) {
            $hrProject = $organizationalKpi->hrProject;
            if ($hrProject && $hrProject->company && $hrProject->company->users->contains($user)) {
                // Allow access - HR Manager owns the project
            } else {
                abort(403, 'You do not have access to this KPI edit history.');
            }
        }

        $editHistory = KpiEditHistory::where('organizational_kpi_id', $organizationalKpi->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Return JSON for AJAX requests
        if (request()->wantsJson() || request()->expectsJson()) {
            return response()->json([
                'kpi' => $organizationalKpi,
                'editHistory' => $editHistory,
            ]);
        }

        return Inertia::render('Admin/PerformanceSystem/KpiEditHistory/Show', [
            'kpi' => $organizationalKpi,
            'editHistory' => $editHistory,
        ]);
    }

    /**
     * Display all KPI edit history for a project.
     */
    public function index(Request $request): Response
    {
        $projectId = $request->input('project_id');
        
        $query = KpiEditHistory::with(['organizationalKpi.hrProject.company']);
        
        if ($projectId) {
            $query->whereHas('organizationalKpi', function ($q) use ($projectId) {
                $q->where('hr_project_id', $projectId);
            });
        }
        
        $editHistory = $query->orderBy('created_at', 'desc')->paginate(50);

        return Inertia::render('Admin/PerformanceSystem/KpiEditHistory/Index', [
            'editHistory' => $editHistory,
            'projectId' => $projectId,
        ]);
    }
}
