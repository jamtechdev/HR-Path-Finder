<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CeoDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Check if CEO email is verified
        if (!$user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice')
                ->with('warning', 'Please verify your email address before accessing the dashboard.');
        }
        
        // Get companies where user is CEO
        $companies = $user->companies()->wherePivot('role', 'ceo')->get();
        
        // Check if CEO has any companies - if not, they need to wait for invitation
        if ($companies->isEmpty()) {
            return Inertia::render('Dashboard/CEO/Index', [
                'companies' => [],
                'pendingApprovals' => [],
                'completedProjects' => [],
                'noCompany' => true,
                'message' => 'You have not been invited to any company yet. Please wait for an invitation from the HR Manager.',
                'stats' => [
                    'total_companies' => 0,
                    'pending_approvals' => 0,
                    'completed_projects' => 0,
                ]
            ]);
        }
        
        // Get HR projects requiring CEO approval
        $pendingApprovals = HrProject::whereIn('company_id', $companies->pluck('id'))
            ->where('status', 'pending_ceo_approval')
            ->with(['company', 'ceoApproval'])
            ->get();
            
        // Get completed projects
        $completedProjects = HrProject::whereIn('company_id', $companies->pluck('id'))
            ->where('status', 'completed')
            ->with('company')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dashboard/CEO/Index', [
            'companies' => $companies,
            'pendingApprovals' => $pendingApprovals,
            'completedProjects' => $completedProjects,
            'noCompany' => false,
            'stats' => [
                'total_companies' => $companies->count(),
                'pending_approvals' => $pendingApprovals->count(),
                'completed_projects' => $completedProjects->count(),
            ]
        ]);
    }

    public function approvals()
    {
        $user = auth()->user();
        $companies = $user->companies()->wherePivot('role', 'ceo')->get();
        
        $projects = HrProject::whereIn('company_id', $companies->pluck('id'))
            ->where('status', 'pending_ceo_approval')
            ->with(['company', 'ceoApproval', 'ceoPhilosophy', 'organizationDesign', 'performanceSystem', 'compensationSystem'])
            ->paginate(10);

        return Inertia::render('Dashboard/CEO/Approvals', [
            'projects' => $projects
        ]);
    }
}